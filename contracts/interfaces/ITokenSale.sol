// SPDX-License-Identifier: UNLICENSED

/**
 * @title ITokenSale.
 * @dev interface of ITokenSale
 * params structure and functions.
 */
pragma solidity ^0.8.4;
import "./IStaking.sol";

interface ITokenSale {
    struct Staked {
        uint256 amount;
        uint256 share;
        uint256 claim;
        bool free;
        int8 point;
    }
    enum Epoch {
        Incoming,
        Private,
        Waiting,
        Public,
        Finished
    }

    /**
     * @dev describe initial params for token sale
     * @param totalSupply set total amount of tokens. (Token decimals)
     * @param privateStart set starting time for private sale.
     * @param privateEnd set finish time for private sale.
     * @param publicStart set starting time for public sale.
     * @param publicEnd set finish time for public sale.
     * @param privateTokenPrice set price for private sale per token in $ (18 decimals).
     * @param publicTokenPrice set price for public sale per token in $ (18 decimals).
     * @param publicBuyLimit set limit for tokens per address in $ (18 decimals).
     * @param escrowPercentage set interest rate for depositor. >
     * @param tierPrices set price to calculate maximum value by tier for staking.
     * @param thresholdPublicAmount - should be sold more than that.
     * @param airdrop - amount reserved for airdrop
     */
    struct Params {
        uint96 totalSupply; //MUST BE 10**18;
        uint96 privateTokenPrice; // MUST BE 10**18 in bnb
        uint96 publicTokenPrice; // MUST BE 10**18 in bnb
        uint96 publicBuyLimit; //// MUST BE 10**18 in $
        address token;
        uint96 thresholdPublicAmount; //[timeStamp, pct]
        address initial;
        uint32 valueFeePct; // in 10**18;
        uint32 escrowPercentage; // Percentage base is 1000
        uint32 tokenFeePct; // in tokens
        uint16[2][] vestingPoints; // Percentage base is 1000
        uint16[2][] escrowReturnMilestones; // Percentage base is 1000 //in erc decimals
    }

    struct ParamsTime {
        uint32 privateStart;
        uint32 privateEnd;
        uint32 publicStart;
        uint32 publicEnd;
    }

    function getParams() external view returns (address, uint16[2][] calldata);

    function changeUserStakes(
        address user,
        uint256 _amount,
        uint256 _share,
        uint256 _claims,
        bool _free,
        int8 _point
    ) external;

    /**
     * @dev initialize implementation logic contracts addresses
     * @param _stakingContract for staking contract.
     * @param _admin for admin contract.
     * @param _priceFeed for price aggregator contract.
     */
    function initialize(
        Params memory,
        ParamsTime memory,
        address _stakingContract,
        address _admin,
        address _priceFeed
    ) external;

    /**
     * @dev claim to sell tokens in airdrop.
     */

    /**
     * @dev get banned list of addresses from participation in sales in this contract.
     */
    function epoch() external returns (Epoch);

    function publicPurchased(address) external returns (uint256);

    function destroy() external;

    function amountForSale() external view returns (uint256);

    function shift(uint256) external view returns (uint256);

    //function exchangeRate() external returns (int256);

    //function totalPrivateSold() external returns (uint256);

    //function totalPublicSold() external returns (uint256);

    //function addToBlackList(address[] memory) external;

    function takeLeftovers() external;

    function stakes(address)
        external
        returns (
            uint256,
            uint256,
            uint256,
            bool,
            int8
        );

    function claimed(address) external view returns (bool);

    function userClaimed(address user, bool newPoint) external;

    function getState()
        external
        returns (
            uint96,
            uint128,
            uint256,
            uint128
        );

    function getPrivatePrice() external view returns (uint256);

    function takeLocked() external;

    function _checkingEpoch() external;

    // function state() external;

    //function getState()

    event DepositPrivate(address indexed user, uint256 amount);
    event DepositPublic(address indexed user, uint256 amount);
    event Claim(address indexed user, uint256 amount, uint256 change);
    event TransferAirdrop(uint256 amount);
    event TransferLeftovers(uint256 leftovers, uint256 fee, uint256 earned);
}
