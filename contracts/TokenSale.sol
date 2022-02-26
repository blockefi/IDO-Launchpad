// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./Staking.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./interfaces/ITokenSale.sol";
import "./interfaces/IAdmin.sol";
import "./interfaces/IAirdrops.sol";
import "./interfaces/IERC20D.sol";

/*
A tokensale includes 3 stages: 
1. Private round. Only EBSC token holders can participate in this round. 
 The BNB/USD price is fixed in the beginning of the tokensale.
 All tokens available in the pre-sale will be made available through the private sale round. 
 A single investor can purchase up to their maximum allowed investment defined by the tier.
 Investors can claim their tokens only when the private round is finished. 
 If the total supply is higher than the total demand for this tokensale, investors purchase tokens up to their max allocation. 
 If the the demand is higher than supply, the number of tokens investors will receive is adjusted, and then the native token used to invest are partially refunded.

2. Public round. After the private round has been completed, the public round opens. 
 Any unsold tokens from the private round  become available publicly. 
 Anyone can participate in the public round. Investment in the public sale round is limited to 1000$ per wallet. Investors who have purchased tokens in the private sale round will be able to invest further in the public sale round.

3. Airdrop. 1% of tokens allocated to each tokensale are transferred to the distributor address to be distributed among participants with two highest tiers. (The distribution is centralised in this version)
*/

contract TokenSale is Initializable, ITokenSale {
    using SafeERC20 for IERC20D;

    uint64 constant PCT_BASE = 1 ether;
    uint64 constant ORACLE_MUL = 1e10;
    uint64 constant POINT_BASE = 1000;
    // uint64 constant NO_LOCK_FEE = 50; //5%
    bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;
    AggregatorV3Interface priceFeed;
    IStaking stakingContract;
    IERC20D token;
    Params public params;
    ParamsTime paramsTime;
    IAdmin admin;
    /**
     * @dev current tokensale stage (epoch)
     */
    Epoch public override epoch;

    mapping(address => Staked) public override stakes;
    mapping(address => bool) public claimed;
    //delete!!!
    mapping(address => uint256) public override publicPurchased;

    uint256 public privatePrice;
    uint256 public publicPrice;

    function getPrivatePrice() external view returns (uint256) {
        return privatePrice;
    }

    address[] public usersOnDeposit;
    /** @dev Decrease result by 1 to access correct position */
    mapping(address => uint256) public userDepositIndex;

    struct State {
        bool fee;
        bool leftovers;
        uint16 tokenDecimals;
        uint96 exchangeRate;
        uint128 totalPrivateSold;
        uint128 freePrivateSold;
        uint256 totalPublicSold;
        uint128 totalSupplyDecimals;
        uint128 publicMaxValues;
    }

    State state;

    receive() external payable {}

    function getParams() external view returns (address, uint16[2][] memory) {
        return (params.token, params.vestingPoints);
    }

    function getState()
        external
        view
        returns (
            uint96,
            uint128,
            uint256,
            uint128
        )
    {
        return (
            state.exchangeRate,
            state.totalPrivateSold,
            state.totalPublicSold,
            state.freePrivateSold
        );
    }

    function userClaimed(address user, bool newPoint) external {
        claimed[user] = newPoint;
    }

    function changeUserStakes(
        address user,
        uint256 _amount,
        uint256 _share,
        uint256 _claims,
        bool _free,
        int8 _point
    ) external {
        stakes[user].amount = _amount;
        stakes[user].share = _share;
        stakes[user].claim = _claims;
        stakes[user].free = _free;
        stakes[user].point = _point;
    }

    function initialize(
        Params calldata _params,
        ParamsTime calldata _paramsTime,
        address _stakingContract,
        address _admin,
        address _priceFeed
    ) external override initializer {
        params = _params;
        paramsTime = _paramsTime;
        stakingContract = IStaking(_stakingContract);
        admin = IAdmin(_admin);
        token = IERC20D(_params.token);
        state.tokenDecimals = token.decimals();
        state.totalSupplyDecimals = uint128(_multiply(_params.totalSupply));
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

   

    /**
     * @dev setup the current tokensale stage (epoch)
     */
    function _checkingEpoch() public {
        uint256 time = block.timestamp;
        if (
            epoch != Epoch.Private &&
            time >= paramsTime.privateStart &&
            time <= paramsTime.privateEnd
        ) {
            epoch = Epoch.Private;
            return;
        }
        if (
            epoch != Epoch.Public &&
            time >= paramsTime.publicStart &&
            time <= paramsTime.publicEnd &&
            _overcomeThreshold()
        ) {
            epoch = Epoch.Public;
            return;
        }
        if (
            (epoch != Epoch.Finished &&
                (time > paramsTime.privateEnd && !_overcomeThreshold())) ||
            time > paramsTime.publicEnd
        ) {
            epoch = Epoch.Finished;
            return;
        }
        if (
            (epoch != Epoch.Waiting && epoch != Epoch.Finished) &&
            (time > paramsTime.privateEnd && time < paramsTime.publicStart)
        ) {
            epoch = Epoch.Waiting;
            return;
        }
    }

    // to save size
    function _onlyAdmin() internal view {
        require(
            admin.hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
                msg.sender == address(admin),
            "Sender is not an admin"
        );
    }

    /**
     * @dev invest BNB to the tokensale
     */
    function deposit() external payable {
        address sender = msg.sender;
        uint256 value = msg.value;
        require(
            !admin.blacklist(address(this), sender),
            "adr in the blacklist"
        );
        _checkingEpoch();

        require(
            epoch == Epoch.Private || epoch == Epoch.Public,
            "incorrect time"
        );
        require(value > 0, "Cannot deposit 0");
        if (userDepositIndex[sender] == 0) {
            usersOnDeposit.push(sender);
            userDepositIndex[sender] = usersOnDeposit.length;
        }
        if (state.exchangeRate == 0) {
            // (, state.exchangeRate, , , ) = priceFeed.latestRoundData();
            state.exchangeRate = 29770000000;
            privatePrice =
                (params.privateTokenPrice * PCT_BASE) /
                (uint256(state.exchangeRate) * ORACLE_MUL);
            publicPrice =
                (params.publicTokenPrice * PCT_BASE) /
                (uint256(state.exchangeRate) * ORACLE_MUL);
        }
        if (epoch == Epoch.Private) {
            _processPrivate(sender, value);
        }
        if (epoch == Epoch.Public) {
            _processPublic(sender, value);
        }
    }

    function destroy() external override {
        _onlyAdmin();
        uint256 amountTkn = token.balanceOf(address(this));
        if (amountTkn > 0) {
            token.safeTransfer(admin.wallet(), amountTkn);
        }
        address payable wallet = payable(admin.wallet());
        selfdestruct(wallet);
    }

    /**
     * @dev processing BNB investment to the private round
     * @param _sender - transaction sender
     * @param _amount - investment amount in BNB
     */
    function _processPrivate(address _sender, uint256 _amount) internal {
        uint256 t;
        uint256 l;
        (t, l, , ) = stakingContract.getUserState(_sender);
        require(uint8(t) > 0, "No tier");
        // if (l == 1) {
        //     uint256 fee = (_amount * NO_LOCK_FEE) / POINT_BASE;
        //     _amount = _amount - fee;
        //     IAirdrops(admin.airdrop()).depositAssets{value: fee}(
        //         address(this),
        //         0,
        //         0
        //     );
        // }
        _amount = (_amount * PCT_BASE) / privatePrice;
        require(_amount > 0, "too little value");
        Staked storage s = stakes[_sender];
        uint256 maxInFiat = stakingContract.getAllocationOf(_sender);
        uint256 inValue = (maxInFiat * PCT_BASE) /
            (uint96(state.exchangeRate) * ORACLE_MUL);
        uint256 max = (inValue * PCT_BASE) / privatePrice;

        uint256 sum = s.amount + _amount;
        bool limit = sum >= max;
        uint256 left = limit ? sum - max : 0;
        uint256 add = limit ? (max - s.amount) : _amount;
        if (t == 7) {
            if (!s.free) {
                s.free = true;
                state.freePrivateSold += uint128(s.amount) != 0
                    ? uint128(s.amount)
                    : 0;
            }
            state.freePrivateSold += uint128(add);
        }
        state.totalPrivateSold += uint128(add);
        s.amount += add;
        //to iterate through an array
        s.point = int8(uint8(params.vestingPoints.length - 1));
        /**@notice Forbid unstaking*/
        stakingContract.setPoolsEndTime(_sender, paramsTime.privateEnd);
        emit DepositPrivate(_sender, shift(_amount));
        left = (left * privatePrice) / PCT_BASE;
        if (left > 0) {
            (bool success, ) = _sender.call{value: left}("");
            require(success);
        }
    }

    /**
     * @dev processing BNB investment to the public round
     * @param _sender - transaction sender
     * @param _amount - investment amount in BNB
     */
    function _processPublic(address _sender, uint256 _amount) internal {
    /** @notice Calculate the token price in BNB and maximum available amount to purchase in tokens*/
        if (state.totalPublicSold == 0) {
            uint128 inValue = (params.publicBuyLimit * PCT_BASE) /
                (uint96(state.exchangeRate) * ORACLE_MUL);
            state.publicMaxValues =
                uint128((uint256(inValue) * PCT_BASE) /
                (publicPrice));
        }

        /** @notice Calculate and transfer max amount of token the investor can purchase */
        (uint256 want, uint256 left) = _leftWant(_sender, _amount);
        uint256 amount = left < want ? left : want;
        token.safeTransfer(_sender, shift(amount));
        publicPurchased[_sender] += amount;
        state.totalPublicSold += uint128(amount);

        /** @notice If the investor is trying to but more tokens than is allowed, the rest of BNB is returned to them */
        if (left < want) {
            uint256 refund = _amount -
                ((left * publicPrice) / PCT_BASE);
            (bool success, ) = _sender.call{value: refund}("");
            require(success);
        }
        emit DepositPublic(_sender, shift(amount));
    }

    /**
     * @dev calculates the amount of tokens an investor want and can actually purchase
     * @param _sender - transaction sender
     * @param _amount - investment amount in BNB
     */
    function _leftWant(address _sender, uint256 _amount)
        internal
        view
        returns (uint256 want, uint256 left)
    {
        want = (_amount * PCT_BASE) / publicPrice;
        uint256 forUser = (state.publicMaxValues - publicPurchased[_sender]);
        uint256 forContract = amountForSale() -
            (state.totalPrivateSold + state.totalPublicSold);
        left = forUser < forContract ? forUser : forContract;
    }

    /**
     * @dev converts the amount of tokens from 18 decimals to {tokenDecimals}
     */
    function shift(uint256 _amount) public view returns (uint256 value) {
        if (state.tokenDecimals != 18) {
            value = state.tokenDecimals < 18
                ? (_amount / 10**(18 - state.tokenDecimals))
                : (_amount * 10**(state.tokenDecimals - 18));
        } else {
            value = _amount;
        }
    }

    /**
     * @dev converts the amount of tokens from {tokenDecimals} to 18 decimals
     */
    function _multiply(uint256 _amount) internal view returns (uint256 value) {
        if (state.tokenDecimals != 18) {
            value = state.tokenDecimals < 18
                ? (_amount * 10**(18 - state.tokenDecimals))
                : (_amount / 10**(state.tokenDecimals - 18));
        } else {
            value = _amount;
        }
    }

    /**
     * @dev allows the participants of the private round to claim their tokens
     */
    // function claim() external override {
    //     _checkingEpoch();
    //     require(
    //         uint8(epoch) > 1 && !admin.blockClaim(address(this)),
    //         "incorrect time"
    //     );
    //     address sender = msg.sender;
    //     require(!claimed[sender], "already claims");
    //     Staked storage s = stakes[sender];
    //     require(s.amount != 0, "doest have a deposit");
    //     /** @notice An investor can withdraw no more tokens than they bought or than allowed by their tier */
    //     uint256 value;
    //     uint256 left;
    //     if (s.share == 0) {
    //         (s.share, left) = _claim(s);
    //     }
    //     (int8 newPoint, uint256 pct) = _canPct(block.timestamp, s.point);
    //     require(pct > 0 || left > 0, "nothing to claim");
    //     value = (s.share * pct) / POINT_BASE;
    //     s.point = newPoint;
    //     s.claim += value;
    //     claimed[sender] = newPoint == -1 || value == 0 ? true : false; //share == 0?
    //     if (value > 0) {
    //         token.safeTransfer(sender, shift(value));
    //     }
    //     emit Claim(sender, shift(value), left);
    //     if (left > 0) {
    //         (bool success, ) = sender.call{value: left}("");
    //         require(success);
    //     }
    // }

    // function _claim(Staked memory _s) internal view returns (uint256, uint256) {
    //     uint256 supply = amountForSale();
    //     if (state.totalPrivateSold > supply) {
    //         uint256 rate;
    //         if (supply > state.freePrivateSold && !_s.free) {
    //             rate =
    //                 ((supply - state.freePrivateSold) * PCT_BASE) /
    //                 (state.totalPrivateSold - state.freePrivateSold);
    //         } else if (supply <= state.freePrivateSold && _s.free) {
    //             rate = (supply * PCT_BASE) / state.freePrivateSold;
    //         } else {
    //             rate = PCT_BASE;
    //         }
    //         _s.share = rate > 0
    //             ? (_s.amount * rate) / PCT_BASE
    //             : rate == PCT_BASE
    //             ? _s.amount
    //             : 0;
    //         return (
    //             _s.share,
    //             ((_s.amount - _s.share) * privatePrice) / PCT_BASE
    //         );
    //     } else {
    //         return (_s.amount, 0);
    //     }
    // }

    // function canClaim(address _user) external view returns (uint256, uint256) {
    //     return _claim(stakes[_user]);
    // }

    // function _canPct(uint256 _now, int8 _curPoint)
    //     internal
    //     view
    //     returns (int8 _newPoint, uint256 _pct)
    // {
    //     _newPoint = _curPoint;
    //     for (uint8 i = 0; i <= uint8(_curPoint); i++) {
    //         if (_now >= params.vestingPoints[i][0]) {
    //             _newPoint = int8(i) - 1;
    //             for (uint8 j = i; j <= uint8(_curPoint); j++) {
    //                 _pct = _pct + params.vestingPoints[j][1];
    //             }
    //             break;
    //         }
    //     }
    // }

    /**
     * @dev sends the unsold tokens and corresponding part of the escrow to the admin address
     */
    function takeLeftovers() external override {
        _checkingEpoch();
        require(epoch == Epoch.Finished, "It is not time yet");
        require(!state.leftovers, "Already paid");
        uint256 returnAmount = _returnEscrow();
        uint256 escrowFee = (_escrowAmount() - returnAmount);
        uint256 earned = _earned();
        state.leftovers = true;
        if (amountForSale() > _totalTokenSold()) {
            returnAmount += (amountForSale() - _totalTokenSold());
        }
        if (escrowFee > 0) {
            token.safeTransfer(admin.wallet(), shift(escrowFee));
        }
        if (returnAmount > 0) {
            token.safeTransfer(params.initial, shift(returnAmount));
        }
        if (earned > 0) {
            earned = earned - _valueFee();
            uint256 value = earned <= address(this).balance
                ? earned
                : address(this).balance;
            (bool success, ) = params.initial.call{value: value}("");
            require(success);
        }
        emit TransferLeftovers(shift(returnAmount), shift(escrowFee), earned);
    }

    function takeFee() external {
        _checkingEpoch();
        require(uint8(epoch) > 1, "It is not time yet");
        require(!state.fee, "Already paid");
        address wallet = admin.wallet();
        uint256 tokenFee = _tokenFee();
        uint256 valueFee = _valueFee();
        state.fee = true;
        if (tokenFee > 0) {
            token.safeTransfer(wallet, shift(tokenFee));
        }
        if (valueFee > 0) {
            (bool success, ) = wallet.call{value: valueFee}("");
            require(success);
        }
    }

    function _valueFee() internal view returns (uint256) {
        uint256 totalForSale = amountForSale();
        uint256 totalValue;
        if (state.totalPrivateSold > totalForSale) {
            totalValue = (totalForSale * privatePrice) / PCT_BASE;
        } else {
            totalValue = (state.totalPrivateSold * privatePrice) / PCT_BASE;
        }
        return (totalValue * params.valueFeePct) / POINT_BASE;
    }

    function _earned() internal view returns (uint256 earned) {
        uint256 totalForSale = amountForSale();
        bool soldOut = _totalTokenSold() > totalForSale;
        if (soldOut) {
            earned =
                (((totalForSale - state.totalPublicSold) * privatePrice) +
                    (state.totalPublicSold * publicPrice)) /
                PCT_BASE;
        } else {
            earned =
                ((state.totalPrivateSold * privatePrice) +
                    (state.totalPublicSold * publicPrice)) /
                PCT_BASE;
        }
    }

    function takeLocked() external override {
        _onlyAdmin();
        require(
            block.timestamp >= (paramsTime.publicEnd + 2592e3),
            "It is not time yet"
        );
        uint256 amountTkn = token.balanceOf(address(this));
        uint256 amountValue = address(this).balance;
        if (amountTkn > 0) {
            token.safeTransfer(admin.wallet(), amountTkn);
        }
        if (address(this).balance > 0) {
            (bool success, ) = admin.wallet().call{value: amountValue}("");
            require(success);
        }
    }

    function _returnEscrow() internal view returns (uint256 returnAmount) {
        uint256 blockedAmount = _escrowAmount();
        uint16[2][] memory milestones = params.escrowReturnMilestones;
        for (uint256 i = 0; i < milestones.length; i++) {
            uint256 mustSold = (amountForSale() * milestones[i][0]) /
                POINT_BASE;
            if (mustSold <= _totalTokenSold()) {
                if (milestones[i][1] > 0) {
                    returnAmount =
                        (blockedAmount * milestones[i][1]) /
                        POINT_BASE;
                } else {
                    returnAmount = blockedAmount;
                }
                break;
            }
        }
    }

    function _totalTokenSold() internal view returns (uint256) {
        return state.totalPrivateSold + state.totalPublicSold;
    }

    function _escrowAmount() internal view returns (uint256) {
        return
            (state.totalSupplyDecimals * params.escrowPercentage) / POINT_BASE;
    }

    function _overcomeThreshold() public view returns (bool overcome) {
        if (amountForSale() > state.totalPrivateSold) {
            overcome = ((amountForSale() - state.totalPrivateSold) >=
                _multiply(params.thresholdPublicAmount));
        }
    }

    /**
     * @dev amount reserved for entire process without airdrop
     */
    function amountForSale() public view returns (uint256) {
        return (state.totalSupplyDecimals - _escrowAmount()) - _tokenFee();
    }

    function _tokenFee() internal view returns (uint256) {
        return (state.totalSupplyDecimals * params.tokenFeePct) / POINT_BASE;
    }
}
