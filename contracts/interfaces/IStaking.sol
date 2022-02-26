// SPDX-License-Identifier: UNLICENSED



pragma solidity ^0.8.4;

/**
 * @title IStaking.
 * @dev interface for staking
 * with params enum and functions.
 */
interface IStaking {
    /**
     * @dev
     * defines privelege type of address.
     */

    struct TierDetails {
        uint128 amount;
        uint128 allocations;
    }

    struct LevelDetails{
        uint duration;
        uint numberOfTiers;
    }

    struct UserState {
        uint giftTier;
        uint lock;
        uint256 amount;
        uint256 lockTime;
    }

    function setPoolsEndTime(address, uint256) external;

    function stakedAmountOf(address) external view returns (uint256);

    function setTierTo(address _address, uint _tier) external;

    function unsetTierOf(address _address) external;
    
    //function stake(uint256) external;

    function getAllocationOf(address) external returns (uint128);

    function unstake(uint256) external;

    function getUserState(address)
        external
        returns (
            uint,
            uint,
            uint256,
            uint256
        );

    function stateOfUser(address)
        external
        returns (
            uint,
            uint,
            uint256,
            uint256
        );

    function getTierOf(address) external view returns (uint);

    function getReflection() external view returns (uint256);
}
