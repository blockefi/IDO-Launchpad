// SPDX-License-Identifier: UNLICENSED



pragma solidity ^0.8.4;

contract ChainLink {
    function latestRoundData()
        external
        pure
        returns (
            uint80,
            int256,
            uint256,
            uint256,
            uint80
        )
    {
        uint80 roundId;
        int256 answer;
        uint256 startedAt;
        uint256 updatedAt;
        uint80 answeredInRound;
        unchecked {
            answer = 48887406263;
        }
        return (roundId, answer, startedAt, updatedAt, answeredInRound);
    }
}
