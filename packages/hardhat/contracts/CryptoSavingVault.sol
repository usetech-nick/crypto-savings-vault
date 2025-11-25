// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ITellor.sol";

/**
 * @title CryptoSavingsVault
 * @dev Simple ETH savings vault with per-user simple interest.
 *      APR dynamically changes based on ETH/USD price from the Tellor oracle.
 *
 * Logic:
 *  - If ETH < $3000 → APR = 6%
 *  - If ETH ≥ $3000 → APR = 3%
 *
 *  APR is in basis points:
 *      600 → 6%
 *      300 → 3%
 *
 *  Simple Interest Formula:
 *      interest = principal * aprBps * timeElapsed / (365 days * 10000)
 */
contract CryptoSavingsVault is ReentrancyGuard {
    // ============ State Variables ============

    /// @notice principal staked per user (in wei)
    mapping(address => uint256) public balances;

    /// @notice timestamp when user last updated stake (for interest calculation)
    mapping(address => uint256) public stakeTimestamps;

    /// @notice interest accumulated but not yet withdrawn (in wei)
    mapping(address => uint256) public accruedInterest;

    /// @notice total ETH staked in the vault (principal only)
    uint256 public totalStaked;

    /// @notice Tellor oracle address
    address public tellorOracle;

    /// @notice APR when ETH < $3000 (6%)
    uint256 public constant HIGH_APR = 600;

    /// @notice APR when ETH >= $3000 (3%)
    uint256 public constant LOW_APR = 300;

    /// @notice Basis points denominator
    uint256 public constant BPS_DENOM = 10000;

    /// @notice Threshold for switching APR (18 decimals)
    uint256 public constant ETH_THRESHOLD = 3000e18;

    /// @notice Tellor query id for ETH/USD
    bytes32 public constant ETH_QUERY_ID = keccak256("ETH/USD");

    // ============ Events ============

    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 principal, uint256 interest, uint256 timestamp);

    // ============ Constructor ============

    constructor(address _tellorOracle) {
        tellorOracle = _tellorOracle;
    }

    // ============ Core Functions ============

    /**
     * @notice Stake ETH into the vault.
     * Moves any pending interest into accruedInterest & resets timestamp.
     */
    function stake() public payable nonReentrant {
        require(msg.value > 0, "Amount must be > 0");

        // If user already staked, add pending interest to accrued pool
        if (balances[msg.sender] > 0 && stakeTimestamps[msg.sender] != 0) {
            uint256 pending = _calculatePendingInterest(msg.sender);
            if (pending > 0) {
                accruedInterest[msg.sender] += pending;
            }
        }

        // Increase principal & update timestamp
        balances[msg.sender] += msg.value;
        stakeTimestamps[msg.sender] = block.timestamp;
        totalStaked += msg.value;

        emit Staked(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @notice Withdraw principal + proportional simple interest.
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        uint256 principal = balances[msg.sender];
        require(principal >= amount, "Insufficient balance");

        // Calculate total interest (accrued + pending)
        uint256 pending = _calculatePendingInterest(msg.sender);
        uint256 totalInterestAvailable = accruedInterest[msg.sender] + pending;

        // User withdraws interest proportional to the amount withdrawn
        uint256 interestForWithdraw = 0;
        if (totalInterestAvailable > 0 && principal > 0) {
            interestForWithdraw = (totalInterestAvailable * amount) / principal;
        }

        // Update bookkeeping
        balances[msg.sender] = principal - amount;
        totalStaked -= amount;

        uint256 remainingInterest = totalInterestAvailable - interestForWithdraw;
        accruedInterest[msg.sender] = remainingInterest;

        // Reset timestamp for remaining principal
        if (balances[msg.sender] > 0) {
            stakeTimestamps[msg.sender] = block.timestamp;
        } else {
            stakeTimestamps[msg.sender] = 0;
        }

        // Pay ETH
        uint256 payout = amount + interestForWithdraw;
        (bool sent, ) = msg.sender.call{ value: payout }("");
        require(sent, "ETH transfer failed");

        emit Withdrawn(msg.sender, amount, interestForWithdraw, block.timestamp);
    }

    // ============ Oracle-Based APR Logic ============

    /**
     * @notice Return current APR in basis points depending on ETH price.
     */
    function getCurrentAPR() public view returns (uint256) {
        uint256 ethPrice = getETHPrice();
        return (ethPrice < ETH_THRESHOLD) ? HIGH_APR : LOW_APR;
    }

    /**
     * @notice Get ETH/USD price from Tellor (18 decimals).
     * Fallback → threshold (forces LOW_APR).
     */
    function getETHPrice() public view returns (uint256) {
        if (tellorOracle == address(0)) return ETH_THRESHOLD;

        try ITellor(tellorOracle).getCurrentValue(ETH_QUERY_ID) returns (
            bool ifRetrieve,
            bytes memory value,
            uint256 /*timestamp*/
        ) {
            if (!ifRetrieve || value.length == 0) return ETH_THRESHOLD;

            uint256 decoded = abi.decode(value, (uint256));
            if (decoded == 0) return ETH_THRESHOLD;

            return decoded;
        } catch {
            return ETH_THRESHOLD;
        }
    }

    // ============ View Helpers ============

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

        uint256 numerator = principal * aprBps * dt;
        uint256 denom = 365 days * BPS_DENOM;

        return numerator / denom;
    }

    // ============ Admin ============

    function setTellorOracle(address _tellor) external {
        tellorOracle = _tellor;
    }

    // ============ Fallback ============

    receive() external payable {
        stake();
    }
}
