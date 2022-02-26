// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/IAdmin.sol";
import "./interfaces/IERC20D.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "./interfaces/IAirdrops.sol";

/**
 * @title Staking.
 * @dev contract for staking tokens.
 *
 */
contract Staking is IStaking, Initializable {
    using SafeERC20 for IERC20D;

    /**
     * EBSC required for different tiers
     */

    bytes32 public constant OPERATOR = keccak256("OPERATOR");
    uint64 constant PCT_BASE = 1 ether;
    uint64 constant ORACLE_MUL = 1e10;
    uint64 constant POINT_BASE = 1000;
    uint64 constant NO_LOCK_FEE = 50; //5%

    uint256 public BNBFeeLockLevel = 1;

    // uint256 constant BACKER_TIER = 2e5 gwei;
    // uint256 constant STARTER_TIER = 6e5 gwei;
    // uint256 constant INVESTOR_TIER = 1e6 gwei;
    // uint256 constant STRATEGIST_TIER = 25e5 gwei;
    // uint256 constant VENTURIST_TIER = 5e6 gwei;
    // uint256 constant EVANGELIST_TIER = 7e6 gwei;
    // uint256 constant EVANGELIST_PRO_TIER = 3e7 gwei;
    // uint256 constant FIRST = 2592e3;
    // uint256 constant SECOND = 5184e3;
    // uint256 constant THIRD = 7776e3;

    // -- updated

    uint256 public lockLevelCount;
    uint256 public totalStakedAmount;
    IERC20D public lpToken;
    IAdmin public admin;
    IUniswapV2Router02 router;
    address wBNB;

    mapping(uint256 => mapping(uint256 => TierDetails)) public tiers;
    mapping(uint256 => LevelDetails) public levels;
    mapping(address => UserState) public override stateOfUser;

    function initialize(
        address _token,
        address _admin,
        address _router,
        address _WBNB,
        uint128[][] memory _depositAmount
    ) public initializer {
        lpToken = IERC20D(_token);
        admin = IAdmin(_admin);
        lockLevelCount = 4;
        levels[1] = LevelDetails(0, 6);
        levels[2] = LevelDetails(30 days, 6);
        levels[3] = LevelDetails(60 days, 6);
        levels[4] = LevelDetails(90 days, 7);

        router = IUniswapV2Router02(_router);
        wBNB = _WBNB;

        // setDeposits( _depositAmount);
        for (uint8 i = 0; i < uint8(_depositAmount.length); i++) {
            for (uint8 j = 0; j < uint8(_depositAmount[i].length); j++) {
                tiers[i + 1][j + 1].amount = _depositAmount[i][j] * 10**9;
            }
        }
    }

    receive() external payable {}

    modifier onlyInstances() {
        require(admin.tokenSalesM(msg.sender), "Sender is not instance");
        _;
    }
    modifier validation(address _address) {
        require(_address != address(0), "Staking: zero address");
        _;
    }
    modifier onlyOperator() {
        require(
            admin.hasRole(OPERATOR, msg.sender),
            "Staking: sender is not an operator"
        );
        _;
    }

    function setBNBFeeLockLevel(uint256 lockLevel) external onlyOperator {
        BNBFeeLockLevel = lockLevel;
    }

    function getReflection() external view override returns (uint256) {
        // console.log("totalStakedAmount ",totalStakedAmount);
        // console.log("balanceof staking",lpToken.balanceOf(address(this)));
        return (lpToken.balanceOf(address(this)) - totalStakedAmount);
    }

    function transferReflection(uint256 _amount) external {
        lpToken.safeTransfer(admin.airdrop(), _amount);
    }

    function stakedAmountOf(address _address)
        external
        view
        override
        returns (uint256)
    {
        return stateOfUser[_address].amount;
    }

    function setAdmin(address _address)
        external
        validation(_address)
        onlyOperator
    {
        admin = IAdmin(_address);
    }

    function setToken(address _address)
        external
        validation(_address)
        onlyOperator
    {
        lpToken = IERC20D(_address);
    }

    function getTierOf(address _address)
        external
        view
        override
        returns (uint256)
    {
        return _getHighestTier(_address);
    }

    function setTierTo(address _address, uint256 _tier)
        external
        override
        onlyOperator
    {
        stateOfUser[_address].giftTier = _tier;
    }

    function unsetTierOf(address _address) external override onlyOperator {
        stateOfUser[_address].giftTier = 0;
    }

    function getAllocationOf(address _address)
        external
        view
        override
        returns (uint128)
    {
        UserState memory state = stateOfUser[_address];
        return tiers[state.lock][_getHighestTier(_address)].allocations;
    }

    function setPoolsEndTime(address _address, uint256 _time)
        external
        override
        onlyInstances
    {
        if (stateOfUser[_address].lockTime < _time) {
            stateOfUser[_address].lockTime = _time;
        }
    }

    function stake(uint256 _level, uint256 _amount) external payable {
        require(
            _amount > 0,
            "Staking: deposited amount must be greater than 0"
        );
        UserState storage s = stateOfUser[msg.sender];

        totalStakedAmount += (_amount);
        //IAirdrops(admin.airdrop()).pushEBSCAmount(_amount);
        // console.log("Amount", _amount);
        // console.log("Total staked Amount" ,totalStakedAmount);
        if (s.lock > 1 && uint8(_getHighestTier(msg.sender)) > 3) {
            IAirdrops(admin.airdrop()).userStakeAirdrop(
                msg.sender,
                s.amount,
                s.lockTime - levels[s.lock].duration,
                0
            );
        }
        //IAirdrops(admin.airdrop()).pushEBSCAmount(_amount);
        if (s.amount != 0) {
            require(
                uint8(_level) >= uint8(s.lock) || _canUnstake(),
                "Staking: level < user level"
            );
        }

        if (stateOfUser[msg.sender].lock > 1 && _level == 1) {
            IAirdrops(admin.airdrop()).userPendingEBSC(msg.sender);
        }

        s.amount = s.amount + _amount;
        uint256 sec = levels[_level].duration;
        s.lock = _level;
        s.lockTime = block.timestamp + sec;

        uint256 highestTier = _getHighestTier(msg.sender);

        if (s.lock == 4 && uint8(highestTier) == 7) {
            IAirdrops(admin.airdrop()).setShareForBNBReward(msg.sender);
        }

        if (s.lock > 1 && uint8(highestTier) > 3) {
            IAirdrops(admin.airdrop()).pushEBSCAirdrop(_amount);
        }

        if (s.lock > 1) {
            IAirdrops(admin.airdrop()).setShareForEBSCReward(
                msg.sender,
                _amount
            );
        }

        require(uint8(highestTier) > 0, "does not have tier");
        if (s.lock == BNBFeeLockLevel) {
            uint256 feePercent = (_amount * NO_LOCK_FEE) / POINT_BASE;
            address[] memory arr = new address[](2);
            arr[0] = address(lpToken);
            arr[1] = wBNB;
            uint256[] memory v;
            v = router.getAmountsOut(feePercent, arr);
            uint256 valueInBnb = v[v.length - 1];
            require(msg.value >= valueInBnb, "invalid BNB Value");
            address payable airdrop = payable(admin.airdrop());
            IAirdrops(admin.airdrop()).setTotalBNB(msg.value);
            (bool sent, ) = airdrop.call{value: msg.value}("");
            require(sent, "Failed to send BNB");
        }
        lpToken.safeTransferFrom(msg.sender, address(this), _amount);
    }

    function unstake(uint256 _amount) external override {
        require(_canUnstake(), "Staking: wait to be able unstake");
        uint256 amount = _amount > 0 ? _amount : stateOfUser[msg.sender].amount;
        UserState storage s = stateOfUser[msg.sender];
        if (s.lock > 1 && uint8(_getHighestTier(msg.sender)) > 3) {
            IAirdrops(admin.airdrop()).userStakeAirdrop(
                msg.sender,
                s.amount,
                s.lockTime - levels[s.lock].duration,
                block.timestamp
            );
        }
        stateOfUser[msg.sender].amount -= amount;
        totalStakedAmount -= _amount;
        if (
            stateOfUser[msg.sender].lock == 4 &&
            uint8(_getHighestTier(msg.sender)) < 7
        ) {
            IAirdrops(admin.airdrop()).userPendingBNB(msg.sender, _amount);
        }
        lpToken.safeTransfer(msg.sender, _amount);
        IAirdrops(admin.airdrop()).withdrawEBSC(_amount);
    }

    function setAllocations(uint128[][] memory _allocations)
        external
        onlyOperator
    {
        for (uint8 i = 0; i < uint8(_allocations.length); i++) {
            for (uint8 j = 0; j < uint8(_allocations[i].length); j++) {
                require(
                    _allocations[i][j] > 0,
                    "Staking: price must be greater than 0"
                );
                tiers[i + 1][j + 1].allocations = _allocations[i][j];
            }
        }
    }

    function getAllocations(uint256 _level, uint256 _tier)
        external
        view
        returns (uint128)
    {
        return tiers[_level][_tier].allocations;
    }

    //TODO: write tests
    function changeAllocations(
        uint256 _level,
        uint256 _tier,
        uint128 _allocation
    ) external onlyOperator {
        require(_allocation > 0, "Staking: price must be greater than 0");
        tiers[_level][_tier].allocations = _allocation;
    }

    function setDeposits(uint128[][] memory _depositAmount)
        public
        onlyOperator
    {
        for (uint8 i = 0; i < uint8(_depositAmount.length); i++) {
            for (uint8 j = 0; j < uint8(_depositAmount[i].length); j++) {
                tiers[i + 1][j + 1].amount = _depositAmount[i][j];
            }
        }
    }

    function getDeposits(uint256 _level, uint256 _tier)
        external
        view
        returns (uint128)
    {
        return tiers[_level][_tier].amount;
    }

    function getUserState(address _address)
        external
        view
        override
        returns (
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            _getHighestTier(_address),
            stateOfUser[_address].lock,
            stateOfUser[_address].amount,
            stateOfUser[_address].lockTime
        );
    }

    function _getHighestTier(address _address) internal view returns (uint256) {
        uint256 _tier = _tierByAmount(
            stateOfUser[_address].amount,
            stateOfUser[_address].lock
        );
        return
            _tier > stateOfUser[_address].giftTier
                ? _tier
                : stateOfUser[_address].giftTier;
    }

    function _canUnstake() internal view returns (bool) {
        return block.timestamp > stateOfUser[msg.sender].lockTime;
    }

    function _tierByAmount(uint256 _amount, uint256 _level)
        internal
        view
        returns (uint256)
    {
        if (_level == 0) {
            return 0;
        }
        for (uint256 i = levels[_level].numberOfTiers; i > 0; i--) {
            if (_amount >= tiers[_level][i].amount) {
                return i;
            }
        }
        return 0;
    }

    // function _withdraw(uint256 _amount) private {

    //     // lpToken.safeTransfer(msg.sender, _amount);
    // }
}
