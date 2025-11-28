// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ITellor.sol";

/**
 * @title CryptoSavingsVault
 * @dev ETH savings vault with per-user simple interest.
 *      APR changes based on ETH/USD price from the Tellor oracle.
 *
 * Simple Interest:
 *   interest = principal * aprBps * timeElapsed / (365 days * 10000)
 *
 * Admin (owner) can update:
 *  - minDeposit, maxDeposit
 *  - ethThreshold (price that flips APR)
 *  - highAprBps, lowAprBps
 *  - tellorOracle address
 */
contract CryptoSavingsVault is ReentrancyGuard, Ownable {
    // ============ State Variables ============

    mapping(address => uint256) public balances;
    mapping(address => uint256) public stakeTimestamps;
    mapping(address => uint256) public accruedInterest;
    uint256 public totalStaked;

    address public tellorOracle;
    bytes32 public constant ETH_QUERY_ID = keccak256("ETH/USD");

    // Configurable rules (bps = basis points, ETH price uses 18 decimals)
    uint256 public minDeposit; // in wei
    uint256 public maxDeposit; // in wei
    uint256 public ethThreshold; // plain integer, e.g. 3000 USD
    uint256 public highAprBps; // e.g. 600 => 6%
    uint256 public lowAprBps; // e.g. 300 => 3%

    uint256 public constant BPS_DENOM = 10000;

    // ============ Events ============

    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 principal, uint256 interest, uint256 timestamp);
    event RulesUpdated(
        uint256 minDeposit,
        uint256 maxDeposit,
        uint256 ethThreshold,
        uint256 highAprBps,
        uint256 lowAprBps
    );
    event TellorOracleUpdated(address indexed oldOracle, address indexed newOracle);

    // ============ Constructor ============

    constructor(
        address _tellorOracle,
        uint256 _minDeposit,
        uint256 _maxDeposit,
        uint256 _ethThreshold,
        uint256 _highAprBps,
        uint256 _lowAprBps
    ) Ownable(msg.sender) {
        require(_minDeposit <= _maxDeposit, "min > max");
        require(_highAprBps <= BPS_DENOM && _lowAprBps <= BPS_DENOM, "APR invalid");

        tellorOracle = _tellorOracle;
        minDeposit = _minDeposit;
        maxDeposit = _maxDeposit;
        ethThreshold = _ethThreshold;
        highAprBps = _highAprBps;
        lowAprBps = _lowAprBps;
    }

    // ============ Core Functions ============

    /**
     * @notice Stake ETH into the vault.
     */
    function stake() public payable nonReentrant {
        require(msg.value > 0, "Amount must be > 0");
        require(msg.value + balances[msg.sender] >= minDeposit, "Below min deposit");
        require(msg.value + balances[msg.sender] <= maxDeposit, "Above max deposit");

        // Move pending interest to accruedInterest
        if (balances[msg.sender] > 0 && stakeTimestamps[msg.sender] != 0) {
            uint256 pending = _calculatePendingInterest(msg.sender);
            if (pending > 0) {
                accruedInterest[msg.sender] += pending;
            }
        }

        balances[msg.sender] += msg.value;
        stakeTimestamps[msg.sender] = block.timestamp;
        totalStaked += msg.value;

        emit Staked(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @notice Withdraw principal + proportional interest.
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        uint256 principal = balances[msg.sender];
        require(principal >= amount, "Insufficient balance");

        uint256 pending = _calculatePendingInterest(msg.sender);
        uint256 totalInterestAvailable = accruedInterest[msg.sender] + pending;

        uint256 interestForWithdraw = 0;
        if (totalInterestAvailable > 0 && principal > 0) {
            interestForWithdraw = (totalInterestAvailable * amount) / principal;
        }

        // Update bookkeeping
        balances[msg.sender] = principal - amount;
        totalStaked -= amount;

        uint256 remainingInterest = totalInterestAvailable - interestForWithdraw;
        accruedInterest[msg.sender] = remainingInterest;

        if (balances[msg.sender] > 0) {
            stakeTimestamps[msg.sender] = block.timestamp;
        } else {
            stakeTimestamps[msg.sender] = 0;
        }

        uint256 payout = amount + interestForWithdraw;
        require(address(this).balance >= payout, "Vault: insufficient contract balance");

        (bool sent, ) = msg.sender.call{ value: payout }("");
        require(sent, "ETH transfer failed");

        emit Withdrawn(msg.sender, amount, interestForWithdraw, block.timestamp);
    }

    // ============ Oracle & APR Logic ============

    /**
     * @notice Return current APR in basis points depending on ETH price.
     */
    function getCurrentAPR() public view returns (uint256) {
        uint256 ethPrice = getETHPrice();
        return (ethPrice < ethThreshold) ? highAprBps : lowAprBps;
    }

    /**
     * @notice Get ETH/USD price from Tellor (18 decimals).
     * Fallback -> return ethThreshold so APR deterministically uses lowAprBps when oracle fails.
     */
    function getETHPrice() public view returns (uint256) {
        if (tellorOracle == address(0)) return ethThreshold;

        try ITellor(tellorOracle).getCurrentValue(ETH_QUERY_ID) returns (
            bool ifRetrieve,
            bytes memory value,
            uint256 /*timestamp*/
        ) {
            if (!ifRetrieve || value.length == 0) return ethThreshold;
            uint256 decoded = abi.decode(value, (uint256));
            if (decoded == 0) return ethThreshold;
            return decoded / 1e18;
        } catch {
            return ethThreshold;
        }
    }

    // ============ Views ============

    function calculateInterest(address user) public view returns (uint256) {
        return accruedInterest[user] + _calculatePendingInterest(user);
    }

    function getTotalBalance(address user) external view returns (uint256) {
        return balances[user] + calculateInterest(user);
    }

    // ============ Internal ============

    function _calculatePendingInterest(address user) internal view returns (uint256) {
        uint256 principal = balances[user];
        if (principal == 0) return 0;

        uint256 ts = stakeTimestamps[user];
        if (ts == 0) return 0;

        uint256 dt = block.timestamp - ts;
        if (dt == 0) return 0;

        uint256 aprBps = getCurrentAPR();

        // interest = principal * aprBps * dt / (365 days * BPS_DENOM)
        uint256 numerator = principal * aprBps * dt;
        uint256 denom = 365 days * BPS_DENOM;
        return numerator / denom;
    }

    // ============ Admin ============

    /**
     * @notice Owner can update Tellor oracle address.
     */
    function setTellorOracle(address _tellor) external onlyOwner {
        require(_tellor != address(0), "Invalid address");
        address old = tellorOracle;
        tellorOracle = _tellor;
        emit TellorOracleUpdated(old, _tellor);
    }

    /**
     * @notice Owner can update vault rules in one call.
     * @param _minDeposit minimum deposit in wei
     * @param _maxDeposit maximum deposit in wei
     * @param _ethThreshold threshold price with 18 decimals (e.g. 3000e18)
     * @param _highAprBps APR (bps) used when price < threshold
     * @param _lowAprBps APR (bps) used when price >= threshold
     */
    function setRules(
        uint256 _minDeposit,
        uint256 _maxDeposit,
        uint256 _ethThreshold,
        uint256 _highAprBps,
        uint256 _lowAprBps
    ) external onlyOwner {
        require(_minDeposit <= _maxDeposit, "min > max");
        require(_highAprBps <= BPS_DENOM && _lowAprBps <= BPS_DENOM, "APR invalid");

        minDeposit = _minDeposit;
        maxDeposit = _maxDeposit;
        ethThreshold = _ethThreshold;
        highAprBps = _highAprBps;
        lowAprBps = _lowAprBps;

        emit RulesUpdated(_minDeposit, _maxDeposit, _ethThreshold, _highAprBps, _lowAprBps);
    }

    // ============ Fallback ============

    receive() external payable {
        stake();
    }
}
