// SPDX-License-Identifier: UNLICENSED



pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IAdmin.sol";
import "./interfaces/ITokenSale.sol";
import "hardhat/console.sol";

/**
 * @title Admin.
 * @dev contract creates tokenSales.
 *
 */

contract Admin is AccessControl, IAdmin {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR = keccak256("OPERATOR");
    uint64 POINT_BASE = 1000;

    address[] public override tokenSales;
    address public override masterTokenSale;
    address public override stakingContract;
    address public override exchangeOracle;
    address public override wallet;
    address public override airdrop;

    mapping(address => bool) public override tokenSalesM;
    mapping(address => bool) public override blockClaim;
    mapping(address => uint256) indexOfTokenSales;
    mapping(address => ITokenSale.Params) params;
    mapping(address => ITokenSale.ParamsTime) paramsTime;
    mapping(address => mapping(address => bool)) public override blacklist;

    /**
     * @dev Emitted when pool is created.
     */
    event CreateTokenSale(address instanceAddress);
    /**
     * @dev Emitted when airdrop is set.
     */
    event SetAirdrop(address airdrop);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(OPERATOR, DEFAULT_ADMIN_ROLE);
        wallet = msg.sender;
    }


    /**
     * @dev Modifier that checks address is not ZERO address.
     */
    modifier validation(address _address) {
        require(_address != address(0), "Zero address");
        _;
    }
    modifier onlyAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Sender is not an admin"
        );
        _;
    }
    modifier onlyExist(address _instance) {
        require(tokenSalesM[_instance], "Pool does not exist yet");
        _;
    }
    modifier onlyIncoming(address _instance) {
        require(
            paramsTime[_instance].privateStart > block.timestamp,
            "Pool has already started"
        );
        _;
    }

    function _descendingSort(uint16[2][] memory arr)
        internal
        pure
        returns (uint16[2][] memory, uint256)
    {
        uint256 l = arr.length;
        uint256 sum;
        for (uint256 i = 0; i < l; i++) {
            for (uint256 j = i + 1; j < l; j++) {
                if (arr[i][0] < arr[j][0]) {
                    uint16[2] memory temp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = temp;
                }
            }
            sum += arr[i][1];
        }
        return (arr, sum);
    }

    function setWallet(address _address)
        external
        validation(_address)
        onlyAdmin
    {
        wallet = _address;
    }

    function addOperator(address _address) external virtual onlyAdmin {
        grantRole(OPERATOR, _address);
    }

    function removeOperator(address _address) external virtual onlyAdmin {
        revokeRole(OPERATOR, _address);
    }

    function getParams(address _instance)
        external
        view
        override
        returns (ITokenSale.Params memory)
    {
        return params[_instance];
    }

    function destroyInstance(address _instance)
        external
        onlyExist(_instance)
        onlyIncoming(_instance)
    {
        _removeFromSales(_instance);
        ITokenSale(_instance).destroy();
    }

    /**
     * @dev add users to blacklist
     * @param _blacklist - the list of users to add to the blacklist
     */
    function addToBlackList(address _instance, address[] memory _blacklist)
        external
        override
        onlyIncoming(_instance)
        onlyExist(_instance)
    {
        require(msg.sender == params[_instance].initial, "adr is not initial");
        require(_blacklist.length <= 500, "Too large array");
        for (uint256 i = 0; i < _blacklist.length; i++) {
            blacklist[_instance][_blacklist[i]] = true;
        }
    }

    function getTokenSalesCount() external view returns (uint256) {
        return tokenSales.length;
    }

    function _addToSales(address _addr) internal {
        tokenSalesM[_addr] = true;
        indexOfTokenSales[_addr] = tokenSales.length;
        tokenSales.push(_addr);
    }

    function _removeFromSales(address _addr) internal {
        tokenSalesM[_addr] = false;
        tokenSales[indexOfTokenSales[_addr]] = tokenSales[
            tokenSales.length - 1
        ];
        indexOfTokenSales[
            tokenSales[tokenSales.length - 1]
        ] = indexOfTokenSales[_addr];
        tokenSales.pop();
        delete indexOfTokenSales[_addr];
    }

    function _checkingParams(ITokenSale.Params memory _params, ITokenSale.ParamsTime memory _paramsTime)
        internal
        view
        returns (ITokenSale.Params memory)
    {
        require(
            _params.totalSupply > 0,
            "Token supply for sale should be greater then 0"
        );
        require(
            _paramsTime.privateStart >= block.timestamp,
            "Start time should be greater then timestamp"
        );
        require(
            _paramsTime.privateEnd > _paramsTime.privateStart,
            "End time should be greater then start time"
        );
        require(
            _paramsTime.publicStart > _paramsTime.privateEnd,
            "Public round should start after private round"
        );
        require(
            _paramsTime.publicEnd > _paramsTime.publicStart,
            "End time should be greater then start time"
        );
        require(
            _params.initial != address(0) && _params.token != address(0),
            "initialAddress || token == 0"
        );
        for (uint256 i = 0; i < _params.escrowReturnMilestones.length; i++) {
            require(
                _params.escrowReturnMilestones[i][0] < POINT_BASE &&
                    _params.escrowReturnMilestones[i][1] < POINT_BASE,
                "escrowMilestone > BASE"
            );
        }
        require(
            _params.escrowPercentage < POINT_BASE,
            "must be less than BASE"
        );
        (_params.escrowReturnMilestones, ) = _descendingSort(
            _params.escrowReturnMilestones
        );
        uint256 sum;
        (_params.vestingPoints, sum) = _descendingSort(_params.vestingPoints);
        require(sum == POINT_BASE, "amount of percentage is not equal to base");
        return _params;
    }

    /**
     * @dev creates new pool.
     * initialize staking, admin, oracle contracts for it.
     * @param _params describes prices, timeline, limits of new pool.
     */

    function createPool(ITokenSale.Params memory _params, ITokenSale.ParamsTime memory _paramsTime)
        external
        override
        onlyRole(OPERATOR)
    {
        _checkingParams(_params, _paramsTime);
        address instance = Clones.clone(masterTokenSale);
        params[instance] = _params;
        paramsTime[instance] = _paramsTime;
        ITokenSale(instance).initialize(
            _params,
            _paramsTime,
            stakingContract,
            address(this),
            exchangeOracle
        );
        _addToSales(instance);
        IERC20(_params.token).safeTransferFrom(
            _params.initial,
            instance,
            _params.totalSupply
        );
        emit CreateTokenSale(instance);
    }

    /**
     * @dev returns all token sales
     */

    function getTokenSales() external view override returns (address[] memory) {
        return tokenSales;
    }

    function setMasterContract(address _address)
        external
        override
        validation(_address)
        onlyAdmin
    {
        masterTokenSale = _address;
    }

    /**
     * @dev set address for airdrop distribution.
     */

    function setAirdrop(address _address)
        external
        override
        validation(_address)
        onlyAdmin
    {
        airdrop = _address;
        emit SetAirdrop(_address);
    }

    /**
     * @dev set address for staking logic contract.
     */

    function setStakingContract(address _address)
        external
        override
        validation(_address)
        onlyAdmin
    {
        stakingContract = _address;
    }

    /**
     * @dev set oracle contract address
     */

    function setOracleContract(address _address)
        external
        override
        validation(_address)
        onlyAdmin
    {
        exchangeOracle = _address;
    }

    function setClaimBlock(address _address) external onlyRole(OPERATOR) {
        blockClaim[_address] = true;
    }

    function removeClaimBlock(address _address) external onlyRole(OPERATOR) {
        blockClaim[_address] = false;
    }
}
