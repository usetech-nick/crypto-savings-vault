// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ITellor
 * @dev Simplified Tellor oracle interface for reading data
 * This is a minimal interface for the bootcamp project
 * Full Tellor docs: https://docs.tellor.io
 */
interface ITellor {
    /**
     * @dev Retrieve value from oracle based on queryId
     * @param _queryId The ID of the data requested
     * @param _timestamp The timestamp to retrieve data from
     * @return _value The value retrieved
     * @return _timestampRetrieved The timestamp when data was retrieved
     */
    function getDataBefore(bytes32 _queryId, uint256 _timestamp)
        external
        view
        returns (bytes memory _value, uint256 _timestampRetrieved);

    /**
     * @dev Get the latest value for a queryId
     * @param _queryId The ID of the data requested
     * @return _ifRetrieve Whether the value was successfully retrieved
     * @return _value The value retrieved
     * @return _timestampRetrieved The timestamp of the value
     */
    function getCurrentValue(bytes32 _queryId)
        external
        view
        returns (bool _ifRetrieve, bytes memory _value, uint256 _timestampRetrieved);
}