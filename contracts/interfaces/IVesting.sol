// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

interface IVesting {
    
    event Claim(address indexed user, uint256 amount, uint256 change);
}
