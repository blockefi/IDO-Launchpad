// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Staking.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./interfaces/ITokenSale.sol";
import "./interfaces/IAdmin.sol";
import "./interfaces/IAirdrops.sol";
import "./interfaces/IERC20D.sol";
import "./interfaces/IVesting.sol";

//TODo getState view is ok or not, Check for uses of claimed mapping
// params token address;

contract Vesting is Initializable, IVesting {
    using SafeERC20 for IERC20D;

    uint64 constant POINT_BASE = 1000;
    uint64 constant PCT_BASE = 1 ether;

    bool only;
    bytes32 public constant OPERATOR = keccak256("OPERATOR");

    mapping(address => uint128) public tokensaleTiers;

    IAdmin admin;
    IStaking staking;
    ITokenSale tokenSale;

    function initialize(address _admin, address _staking) external initializer {
        admin = IAdmin(_admin);
        staking = IStaking(_staking);
    }

     function giftTier(address[] calldata users, uint128[] calldata tiers)
        public
    {
        require(admin.hasRole(OPERATOR, msg.sender), "OnlyOperator");
        require(users.length == tiers.length, "invalid length");
        for (uint128 i = 0; i < users.length; i++) {
            if (staking.getTierOf(users[i]) < tiers[i]) {
                tokensaleTiers[users[i]] = tiers[i];
            }
        }
    }

    function onlygiftTier(bool _onlytier) external {
        require(admin.hasRole(OPERATOR, msg.sender), "OnlyOperator");
        require(only != _onlytier, "Invalid bool");
        tokenSale._checkingEpoch();
        require(uint8(tokenSale.epoch()) < 1, "Incorrect time");
        only = _onlytier;
    }

    function claim(address _tokenSale) external {
        tokenSale = ITokenSale(_tokenSale);
        (address token, ) = tokenSale.getParams();
        tokenSale._checkingEpoch();
        require(
            uint8(tokenSale.epoch()) > 1 && !admin.blockClaim(address(this)),
            "incorrect time"
        );
        // address sender = msg.sender;
        require(!tokenSale.claimed(msg.sender), "already claims");
        (
            uint256 _amount,
            uint256 _share,
            uint256 _claims,
            bool _free,
            int8 _point
        ) = tokenSale.stakes(msg.sender);
        require(_amount != 0, "doest have a deposit");
        /** @notice An investor can withdraw no more tokens than they bought or than allowed by their tier */
        uint256 value;
        uint256 left;
        if (_share == 0) {
            (_share, left) = _claim(_tokenSale);
        }
        (int8 newPoint, uint256 pct) = _canPct(
            block.timestamp,
            _point,
            _tokenSale
        );
        require(pct > 0 || left > 0, "nothing to claim");
        value = (_share * pct) / POINT_BASE;
        _point = newPoint;
        _claims += value;
        //TODO int8 is assigned to type bool
        tokenSale.userClaimed(msg.sender, newPoint == -1 || value == 0); //share == 0?
        if (value > 0) {
            IERC20D(token).safeTransfer(msg.sender, tokenSale.shift(value));
        }
        emit Claim(msg.sender, tokenSale.shift(value), left);
        if (left > 0) {
            (bool success, ) = msg.sender.call{value: left}("");
            require(success);
        }
        tokenSale.changeUserStakes(
            msg.sender,
            _amount,
            _share,
            _claims,
            _free,
            _point
        );
    }

    function _claim(address _tokenSale) internal returns (uint256, uint256) {
        tokenSale = ITokenSale(_tokenSale);
        (, uint256 b, , uint256 d) = tokenSale.getState();
        uint256 supply = tokenSale.amountForSale();
        (
            uint256 _amount,
            uint256 _share,
            uint256 _claims,
            bool _free,
            int8 _point
        ) = tokenSale.stakes(msg.sender);
        if (b > supply) {
            uint256 rate;
            if (supply > d && !_free) {
                rate = ((supply - d) * PCT_BASE) / (b - d);
            } else if (supply <= d && _free) {
                rate = (supply * PCT_BASE) / d;
            } else {
                rate = PCT_BASE;
            }
            _share = rate > 0 ? (_amount * rate) / PCT_BASE : rate == PCT_BASE
                ? _amount
                : 0;
            tokenSale.changeUserStakes(
                msg.sender,
                _amount,
                _share,
                _claims,
                _free,
                _point
            );
            return (
                _share,
                ((_amount - _share) * tokenSale.getPrivatePrice()) / PCT_BASE
            );
        } else {
            tokenSale.changeUserStakes(
                msg.sender,
                _amount,
                _share,
                _claims,
                _free,
                _point
            );
            return (_amount, 0);
        }
    }

    function canClaim(address _tokenSale) external returns (uint256, uint256) {
        tokenSale = ITokenSale(_tokenSale);
        return _claim(_tokenSale);
    }

    function _canPct(
        uint256 _now,
        int8 _curPoint,
        address _tokenSale
    ) internal returns (int8 _newPoint, uint256 _pct) {
        tokenSale = ITokenSale(_tokenSale);
        (, uint16[2][] memory vestingPoints) = tokenSale.getParams();
        _newPoint = _curPoint;
        for (uint8 i = 0; i <= uint8(_curPoint); i++) {
            if (_now >= vestingPoints[i][0]) {
                _newPoint = int8(i) - 1;
                for (uint8 j = i; j <= uint8(_curPoint); j++) {
                    _pct = _pct + vestingPoints[j][1];
                }
                break;
            }
        }
    }
}
