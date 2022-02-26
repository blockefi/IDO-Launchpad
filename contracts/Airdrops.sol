// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/IAdmin.sol";
import "./interfaces/IAirdrops.sol";
import "./interfaces/IERC20D.sol";
import "hardhat/console.sol";

// TODO Write function for Emergency withdraw for all types of funds

contract Airdrops {
    using SafeERC20 for IERC20D;
    bytes32 public constant OPERATOR = keccak256("OPERATOR");

    struct Airdrop{
        uint totalsupply;
        uint tokenstaked;
        uint time;
        address token;
        mapping(address => bool) claimed;
    }

    struct userAirDrop{
        uint amount;
        uint startTime;
        uint endTime;
    }

    IAdmin public admin;
    IStaking public staking;
    IERC20D public lpToken;

    uint256 public SBNB;
    uint256 public totalstakeBNB;
    uint256 public totalBNB;

    uint256 public SEBSC;
    uint256 public totalstakeEBSC;
    uint256 public totalEBSC;

    uint256 public airdropCount;
    uint256 public tokenStakedAirdrop;

    bool firstDistribution;

    address public marketingWallet; // Todo: setter function

    mapping(address => uint256) public s1BNB;
    mapping(address => uint256) public previousRewardBNB;

    mapping(address => uint256) public s1EBSC;
    mapping(address => uint256) public previousRewardEBSC;

    mapping(uint256 => Airdrop) public airdrops;
    mapping(address => userAirDrop) public userAirDrops;

    constructor(
        address _staking,
        address _admin,
        address _lpToken
    ) {
        staking = IStaking(_staking);
        admin = IAdmin(_admin);
        lpToken = IERC20D(_lpToken);
    }

    receive() external payable {}

    function viewBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getReflection() public view returns (uint256) {
        // console.log("total EBSC", totalEBSC);
        // console.log(lpToken.balanceOf(address(this)));
        return (lpToken.balanceOf(address(this)) - totalEBSC);
    }

    // function pushEBSCAmount(uint256 _amount) external {
    //     totalEBSC += _amount * ((100 - lpToken._taxFee()) / 100);
    // }

    function withdrawEBSC(uint256 _amount) public {
        totalstakeEBSC -= _amount;
    }

    function distributionEBSC(uint amount) public {
        require(amount !=0, "Cannot distribute zero amount");
        require(totalstakeEBSC != 0, "No EBSC amount for reflection");
        // uint256 amount = staking.getReflection(); 
        totalEBSC += (amount);
        SEBSC += ((amount * 10**18) /totalstakeEBSC);
        //Todo calling from backend
        // lpToken.safeTransferFrom(marketingWallet, address(this), amount);
        // todo transfer function in staking
        // lpToken.safeTransferFrom(address(staking),address(this), amount);
    }


    function setShareForEBSCReward(address user, uint256 _amount) public {
        //stake[msg.sender] += amount;
        // uint256 amount;
        // (, , amount, ) = staking.getUserState(user);
        totalstakeEBSC += _amount;
        //tokenTOLL.transferFrom(msg.sender, address(this),amount);
        s1EBSC[user] = SEBSC;
    }

    function userPendingEBSC(address user) public {
        uint256 amount;
        (, , amount, ) = staking.getUserState(user);
        previousRewardEBSC[user] += (amount * (SEBSC - s1EBSC[user])) / 10**18;
    }

    function getEBSCReward(address user, uint256 amount)
        external
        view
        returns (uint256)
    {
        return (previousRewardEBSC[user] +((amount * (SEBSC - s1EBSC[user])) /10**18));
    }

  
function claimEBSC() public {
        uint256 amount;
        uint256 lock;
        uint256 reward;
        amount = getReflection();
        totalEBSC += amount;
        SEBSC += (amount * 10**18) /totalstakeEBSC;
        (, lock, amount, ) = staking.getUserState(msg.sender);
        if (lock == 1) {
            reward = previousRewardEBSC[msg.sender];
            
        } else {
            reward =
                previousRewardEBSC[msg.sender] +
                (amount * (SEBSC - s1EBSC[msg.sender])) /
                10**18;
        }
        totalEBSC -= reward;
        s1EBSC[msg.sender] = SEBSC;
        lpToken.safeTransfer(msg.sender, reward);
    }

    function setTotalBNB(uint256 _amount) public {
        require(msg.sender == address(staking), "Only staking contract");
        totalBNB += _amount;
    }

    function setShareForBNBReward(address user) public {
        require(msg.sender == address(staking), "Only staking contract");
        //stake[msg.sender] += amount;
        uint256 amount;
        (, , amount, ) = staking.getUserState(user);
        totalstakeBNB += amount;
        //tokenTOLL.transferFrom(msg.sender, address(this),amount);
        s1BNB[user] = SBNB;
    }

    function distributionBNB() public {
        require(
            totalstakeBNB != 0,
            "No user staked yet for BNBreward distribution"
        );
        if (!firstDistribution) {
            SBNB += (address(this).balance * 10**18) / totalstakeBNB;
            firstDistribution = true;
        } else {
            SBNB +=
                ((address(this).balance - totalBNB) * 10**18) /
                totalstakeBNB;
        }
    }

    function userPendingBNB(address user, uint256 amount) public {
        require(msg.sender == address(staking), "Only staking contract");
        // uint256 amount;
        // (, , amount, ) = staking.getUserState(user);
        previousRewardBNB[user] += (amount * (SBNB - s1BNB[user])) / 10**18;

    }

    function getBNBReward(address user, uint256 amount)
        external
        view
        returns (uint256)
    {
        return (previousRewardBNB[user] +
            (amount * (SBNB - s1BNB[user])) /
            10**18);
    }

    function claimBNB() public {
        uint256 amount;
        uint256 lock;
        uint256 reward;
        uint256 tier;
        (tier, lock, amount, ) = staking.getUserState(msg.sender);
        if (uint8(tier) < 7) {
            reward = previousRewardBNB[msg.sender];
        } else {
            reward =
                previousRewardBNB[msg.sender] +
                (amount * (SBNB - s1BNB[msg.sender])) /
                10**18;
            //console.log("reward in else ",reward);
        }
        totalBNB -= reward;
        //console.log("totalBNB", totalBNB);
        s1BNB[msg.sender] = SBNB;
        // console.log(msg.sender.balance);
        (bool sent, ) = payable(msg.sender).call{value: reward}("");
        require(sent, "Failed to send Ether");
        //console.log(msg.sender.balance);
    }

    //    function unstake(uint amount) public {
    //     require(amount >0, 'Staking: amount should not be less than or equal to 0');
    //     require(amount <= stake[msg.sender]);
    //     previousReward[msg.sender] = previousReward[msg.sender] + (stake[msg.sender] * (S - s1[msg.sender]))/ 10 ** 18;
    //     stake[msg.sender] -= amount;
    //     totalstakeToken -= amount;
    //     tokenTOLL.transfer(msg.sender,amount);
    //     s1[msg.sender] = S;
    //  }

    modifier onlyOperator() {
        require(
            admin.hasRole(OPERATOR, msg.sender),
            "sender is not an operator"
        );
        _;
    }

    modifier onlyExits(address _pool) {
        require(admin.tokenSalesM(_pool), "pool does not exist yet");
        _;
    }
    
    modifier validation(address _address) {
        require(_address != address(0), "zero address");
        _;
    }

    function setLptoken(address _address)
        external
        validation(_address)
        onlyOperator
    {
        lpToken = IERC20D(_address);
    }

    function setStaking(address _address)
        external
        validation(_address)
        onlyOperator
    {
        staking = IStaking(_address);
    }

    function setAdmin(address _address)
        external
        validation(_address)
        onlyOperator
    {
        admin = IAdmin(_address);
    }

    function addAirdrop(uint _totalsupply, address _token) external payable onlyOperator returns(uint){
        airdropCount++;
        airdrops[airdropCount].totalsupply = _totalsupply;
        airdrops[airdropCount].tokenstaked = tokenStakedAirdrop;
        airdrops[airdropCount].time = block.timestamp;
        if(_token != address(1)){
            airdrops[airdropCount].token = _token;
            IERC20D(_token).safeTransferFrom(msg.sender,address(this),_totalsupply);
        }else{
            airdrops[airdropCount].token = address(1);
            require(msg.value >= _totalsupply,"Invalid amount");
        }
        return(airdropCount);
    }

    function pushEBSCAirdrop(uint256 _amount) external {
        tokenStakedAirdrop += _amount;
    }

    function popEBSCAirdrop(uint256 _amount) public {
        tokenStakedAirdrop -= _amount;
    }

    function userStakeAirdrop(address user,uint _amount, uint _startTime, uint _endTime) external{
        if(_amount != 0){
            userAirDrops[user].amount = _amount;
        }
        if(_startTime != 0){
            userAirDrops[user].startTime =  _startTime;
        }
        if(_endTime != 0){
            userAirDrops[user].endTime = _endTime;
        }      
    }

     function claimAirdrop(uint id) external{
        require(!airdrops[id].claimed[msg.sender],"already deployed");
        uint t;
        uint l;
        uint amount;
        (t,l,amount, ) = staking.getUserState(msg.sender);
        if(userAirDrops[msg.sender].amount != 0){
            require((airdrops[id].time >= userAirDrops[msg.sender].startTime) && (airdrops[id].time >= userAirDrops[msg.sender].endTime),"can't claim");
            if(airdrops[id].token != address(1)){
                IERC20D(airdrops[id].token).safeTransfer(msg.sender,(userAirDrops[msg.sender].amount * airdrops[id].totalsupply) / airdrops[id].tokenstaked);
            }else{
                (bool sent, ) = payable(msg.sender).call{value: (userAirDrops[msg.sender].amount * airdrops[id].totalsupply) / airdrops[id].tokenstaked}("");
                require(sent, "Failed to send BNB");
            }
            airdrops[id].claimed[msg.sender] = true;
        }else if(t > 3 && l > 1){
            if(airdrops[id].token != address(1)){
                IERC20D(airdrops[id].token).safeTransfer(msg.sender,(amount * airdrops[id].totalsupply) / airdrops[id].tokenstaked);
            }else{
                (bool sent, ) = payable(msg.sender).call{value: (amount * airdrops[id].totalsupply) / airdrops[id].tokenstaked}("");
                require(sent, "Failed to send BNB");
            }
            airdrops[id].claimed[msg.sender] = true;
        }
     }
    
}
