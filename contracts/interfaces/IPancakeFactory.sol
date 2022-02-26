// SPDX-License-Identifier: UNLICENSED



pragma solidity >=0.6.2;

interface IPancakeFactory {
    function getPair(address tokenA, address tokenB)
        external
        view
        returns (address pair);
}
