// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/ITellor.sol";

/**
 * @title CryptoSavingsVault
 * @dev A savings vault where users can stake ETH and earn dynamic interest
 * Interest rates are determined by BTC price from Tellor oracle
 * 
 * STUB CONTRACT - For testing infrastructure
 * TODO: Nishant will implement full functionality
 */
contract CryptoSavingsVault {
    
    // ============ State Variables ============
    
    /// @notice Mapping of user addresses to their staked balances
    mapping(address => uint256) public balances;
    
    /// @notice Mapping of user addresses to their stake timestamps
    mapping(address => uint256) public stakeTimestamps;
    
    /// @notice Total amount staked in the vault
    uint256 public totalStaked;
    
    /// @notice Tellor oracle address
    address public tellorOracle;
    
    /// @notice High APR (when BTC < $30k)
    uint256 public constant HIGH_APR = 500; // 5% = 500 basis points
    
    /// @notice Low APR (when BTC >= $30k)
    uint256 public constant LOW_APR = 200; // 2% = 200 basis points
    
    /// @notice BTC price threshold
    uint256 public constant BTC_THRESHOLD = 30000e18; // $30,000 with 18 decimals
    
    // ============ Events ============
    
    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 principal, uint256 interest, uint256 timestamp);
    event InterestRateUpdated(uint256 newRate, uint256 btcPrice);
    
    // ============ Constructor ============
    
    constructor(address _tellorOracle) {
        tellorOracle = _tellorOracle;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Stake ETH in the vault
     * @dev User sends ETH and it gets tracked in balances mapping
     * TODO: Implement by Nishant
     */
    function stake() external payable {
        require(msg.value > 0, "Amount must be > 0");
        
        // TODO: Implement staking logic
        // Should:
        // 1. Update balances[msg.sender]
        // 2. Update stakeTimestamps[msg.sender]
        // 3. Update totalStaked
        // 4. Emit Staked event
        
        revert("Not implemented yet");
    }
    
    /**
     * @notice Withdraw staked ETH plus earned interest
     * @param amount Amount to withdraw (principal only, interest calculated automatically)
     * TODO: Implement by Nishant
     */
    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // TODO: Implement withdrawal logic
        // Should:
        // 1. Calculate interest earned
        // 2. Update balances[msg.sender]
        // 3. Update totalStaked
        // 4. Transfer principal + interest to user
        // 5. Emit Withdrawn event
        
        revert("Not implemented yet");
    }
    
    /**
     * @notice Get current interest rate based on BTC price from Tellor
     * @return Current APR in basis points (500 = 5%, 200 = 2%)
     * TODO: Implement by Nishant
     */
    function getCurrentAPR() public view returns (uint256) {
        // TODO: Implement Tellor integration
        // Should:
        // 1. Query Tellor oracle for BTC price
        // 2. Compare with BTC_THRESHOLD
        // 3. Return HIGH_APR or LOW_APR
        
        // For now, return HIGH_APR as placeholder
        return HIGH_APR;
    }
    
    /**
     * @notice Calculate interest earned for a user
     * @param user Address of the user
     * @return Interest earned in wei
     * TODO: Implement by Nishant
     */
    function calculateInterest(address user) public view returns (uint256) {
        // TODO: Implement interest calculation
        // Should:
        // 1. Get time staked (block.timestamp - stakeTimestamps[user])
        // 2. Get current APR from getCurrentAPR()
        // 3. Calculate: principal * APR * time / (365 days * 10000)
        
        return 0; // Placeholder
    }
    
    /**
     * @notice Get user's total balance including interest
     * @param user Address of the user
     * @return Total balance (principal + interest)
     */
    function getTotalBalance(address user) external view returns (uint256) {
        return balances[user] + calculateInterest(user);
    }
    
    /**
     * @notice Get BTC price from Tellor oracle
     * @return BTC price in USD (18 decimals)
     * TODO: Implement by Nishant
     */
    function getBTCPrice() public view returns (uint256) {
        // TODO: Implement Tellor query
        // Should query Tellor for BTC/USD price
        
        return 35000e18; // Placeholder: $35,000
    }
}