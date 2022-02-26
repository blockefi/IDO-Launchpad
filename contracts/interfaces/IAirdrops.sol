// SPDX-License-Identifier: UNLICENSED



pragma solidity ^0.8.4;

/**
 * @title IStaking.
 * @dev interface for staking
 * with params enum and functions.
 */
interface IAirdrops {
    function depositAssets(address, uint256, uint256) external payable;
    function setShareForBNBReward(address) external;
    function userPendingBNB(address user, uint amount) external;
    function pushEBSCAmount(uint _amount) external;
    function withdrawEBSC(uint _amount) external;
    function setShareForEBSCReward (address user, uint _amount) external; 
    function userPendingEBSC(address user) external;
    function setTotalBNB(uint _amount) external;
    function pushEBSCAirdrop(uint256 _amount) external;
    function popEBSCAirdrop(uint256 _amount) external;
    function userStakeAirdrop(address user,uint _amount, uint _startTime, uint _endTime) external;
}
