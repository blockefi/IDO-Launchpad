// SPDX-License-Identifier: UNLICENSED



pragma solidity ^0.8.4;

interface IUnicrypt {
    function lockLPToken(
        address,
        uint256,
        uint256,
        address,
        bool,
        address
    ) external payable;
    
}
