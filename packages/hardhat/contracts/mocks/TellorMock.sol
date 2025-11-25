// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TellorMock
 * @dev Minimal Tellor oracle mock for tests.
 *      Returns a stored price and timestamp.
 */
contract TellorMock {
    uint256 public price;

    constructor(uint256 _price) {
        price = _price;
    }

    function setPrice(uint256 _price) external {
        price = _price;
    }

    // This matches the signature expected by ITellor in your vault.
    function getCurrentValue(bytes32) external view returns (bool, bytes memory, uint256) {
        return (true, abi.encode(price), block.timestamp);
    }
}
