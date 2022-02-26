const { expect } = require("chai");
const { ethers } = require("hardhat");

//import MyClass from "./utilities/utilities"

const {
    time, // time
    constants,
} = require("@openzeppelin/test-helpers");
// const { parseEther } = require("@ethersproject/units");
// const balance = require("@openzeppelin/test-helpers/src/balance");
// const web3 = require("@nomiclabs/hardhat-web3");
const BN = require("ethers").BigNumber;

beforeEach(async () => {

    [owner, user1, user2, user3, user4] = await ethers.getSigners();
    provider = ethers.provider;

    Admin = await ethers.getContractFactory("Admin");
    TokenSale = await ethers.getContractFactory("TokenSale");
    Token = await ethers.getContractFactory("Token");
    LpToken = await ethers.getContractFactory("Token");
    Staking = await ethers.getContractFactory("Staking");
    Oracle = await ethers.getContractFactory("ChainLink");
    Airdrops = await ethers.getContractFactory("Airdrops");
    Weth = await ethers.getContractFactory("WETH");
    Factory = await ethers.getContractFactory("UniswapV2Factory");
    Router = await ethers.getContractFactory("UniswapV2Router01");
    getinit = await ethers.getContractFactory("CalHash");
    Ebsc = await ethers.getContractFactory("EBSC");

    Getinit = await getinit.deploy();
    await Getinit.deployed();
    console.log("init", await Getinit.getInitHash());

    token = await Token.deploy("Token", "tkn");
    await token.deployed();

    // lpToken = await Token.deploy("LPToken", "lptkn");
    // await lpToken.deployed();

    factory = await Factory.deploy(owner.address);
    await factory.deployed();

    weth = await Weth.deploy();
    await weth.deployed();

    router = await Router.deploy(factory.address, weth.address);
    await router.deployed();
    //  console.log(router.address);

    adminContract = await Admin.deploy();
    await adminContract.deployed();

    tokenSaleContract = await TokenSale.deploy();
    await tokenSaleContract.deployed();

    oracle = await Oracle.deploy();
    await oracle.deployed();

    stakingContract = await Staking.deploy();
    await stakingContract.deployed();


    ebscToken = await Ebsc.deploy(router.address);  // This is EBSC token with name lpToken
    await ebscToken.deployed();

    airdropContract = await Airdrops.deploy(stakingContract.address, adminContract.address, ebscToken.address);
    await airdropContract.deployed();

    console.log("Deployment done");
    console.log("reflection initially ", String(await airdropContract.getReflection()));

})

describe("deposit", async () => {
    it("deposit function", async () => {

        await adminContract.addOperator(owner.address);
        await adminContract.setMasterContract(tokenSaleContract.address);
        await adminContract.setOracleContract(oracle.address);
        await adminContract.setStakingContract(stakingContract.address);
        await adminContract.setAirdrop(airdropContract.address);


        defaultAllocation = {
            NONE: {
                STARTER: BN.from("100").mul(BN.from("10").pow("18")),
                INVESTOR: BN.from("250").mul(BN.from("10").pow("18")),
                STRATEGIST: BN.from("500").mul(BN.from("10").pow("18")),
                EVANGELIST: BN.from("1250").mul(BN.from("10").pow("18")),
            },
            FIRST: {
                STARTER: BN.from("125").mul(BN.from("10").pow("18")),
                INVESTOR: BN.from("325").mul(BN.from("10").pow("18")),
                STRATEGIST: BN.from("625").mul(BN.from("10").pow("18")),
                EVANGELIST: BN.from("1750").mul(BN.from("10").pow("18")),
            },
            SECOND: {
                STARTER: BN.from("150").mul(BN.from("10").pow("18")),
                INVESTOR: BN.from("400").mul(BN.from("10").pow("18")),
                STRATEGIST: BN.from("750").mul(BN.from("10").pow("18")),
                EVANGELIST: BN.from("2000").mul(BN.from("10").pow("18")),
            },
            THIRD: {
                STARTER: BN.from("200").mul(BN.from("10").pow("18")),
                INVESTOR: BN.from("500").mul(BN.from("10").pow("18")),
                STRATEGIST: BN.from("1000").mul(BN.from("10").pow("18")),
                EVANGELIST: BN.from("2500").mul(BN.from("10").pow("18")),
                EVANGELIST_PRO: BN.from("3500").mul(BN.from("10").pow("18")),
            },
        };
        const arrayOfAllocations = [
            [
                defaultAllocation.NONE.STARTER,
                defaultAllocation.NONE.INVESTOR,
                defaultAllocation.NONE.STRATEGIST,
                defaultAllocation.NONE.EVANGELIST,
            ],
            [
                defaultAllocation.FIRST.STARTER,
                defaultAllocation.FIRST.INVESTOR,
                defaultAllocation.FIRST.STRATEGIST,
                defaultAllocation.FIRST.EVANGELIST,
            ],
            [
                defaultAllocation.SECOND.STARTER,
                defaultAllocation.SECOND.INVESTOR,
                defaultAllocation.SECOND.STRATEGIST,
                defaultAllocation.SECOND.EVANGELIST,
            ],
            [
                defaultAllocation.THIRD.STARTER,
                defaultAllocation.THIRD.INVESTOR,
                defaultAllocation.THIRD.STRATEGIST,
                defaultAllocation.THIRD.EVANGELIST,
                defaultAllocation.THIRD.EVANGELIST_PRO,
            ],
        ];

        const allocationsArray = [[100, 250, 500, 1250], [125, 325, 625, 1750, 222, 565], [150, 400, 750, 2000], [200, 500, 1000, 2500, 3500]]

        const EbscReq = [[200000, 600000, 1000000, 2500000, 5000000, 7000000],
        [200000, 600000, 1000000, 2500000, 5000000, 7000000],
        [200000, 600000, 1000000, 2500000, 5000000, 7000000],
        [200000, 600000, 1000000, 2500000, 5000000, 7000000, 30000000]];

        await stakingContract.initialize(ebscToken.address, adminContract.address, router.address, weth.address, EbscReq);

        await stakingContract.setAllocations(allocationsArray);




        // await lpToken.mint(owner.address, BN.from("500000").mul(BN.from("10").pow("18")));
        // await lpToken.mint(user1.address, BN.from("500000").mul(BN.from("10").pow("18")));
        // await lpToken.mint(user2.address, BN.from("500000").mul(BN.from("10").pow("18")));
        // await lpToken.mint(user3.address, BN.from("700000").mul(BN.from("10").pow("18")));
        // await lpToken.mint(user4.address, BN.from("1400000").mul(BN.from("10").pow("18")));


        // await lpToken.connect(owner).approve(stakingContract.address, BN.from("300000").mul(BN.from("10").pow("18")));
        // await lpToken.connect(user1).approve(stakingContract.address, BN.from("300000").mul(BN.from("10").pow("18")));
        // await lpToken.connect(user2).approve(stakingContract.address, BN.from("300000").mul(BN.from("10").pow("18")));
        // await lpToken.connect(user3).approve(stakingContract.address, BN.from("700000").mul(BN.from("10").pow("18")));
        // await lpToken.connect(user4).approve(stakingContract.address, BN.from("1400000").mul(BN.from("10").pow("18")));



        await ebscToken.connect(owner).approve(router.address, BN.from("200000").mul(BN.from("10").pow("9")));

        console.log("airdrops: ", airdropContract.address);

        await ebscToken.excludeFromFee(stakingContract.address);
        await ebscToken.excludeFromFee(airdropContract.address);

        await router.connect(owner).addLiquidityETH(ebscToken.address, BN.from("200000").mul(BN.from("10").pow("9")), 1,
            1, owner.address, 1671258710, { value: BN.from("10").mul(BN.from("10").pow("18")) });

        console.log("success addLiquidity ");

        let ethVal = 84774999;

        await ebscToken.setTaxFeePercent(8);

        await ebscToken.connect(owner).transfer(user1.address, BN.from("20000000").mul(BN.from("10").pow("9")))
        await ebscToken.connect(owner).transfer(user3.address, BN.from("20000000").mul(BN.from("10").pow("9")))

        //console.log("owner balance before reflection", String(await ebscToken.balanceOf(owner.address)));


        await ebscToken.connect(user3).transfer(user2.address, BN.from("20000000").mul(BN.from("10").pow("9")))


        await ebscToken.connect(owner).transfer(user3.address, BN.from("60000000").mul(BN.from("10").pow("9")))
        await ebscToken.connect(owner).transfer(user4.address, BN.from("30000000").mul(BN.from("10").pow("9")))

        await ebscToken.connect(user1).approve(stakingContract.address, BN.from("20000000").mul(BN.from("10").pow("9")));
        await ebscToken.connect(user4).approve(stakingContract.address, BN.from("30000000").mul(BN.from("10").pow("9")));

        //console.log("stakingcontract reflection before", String(await stakingContract.getReflection()));
        console.log("Staking contract balance before", String(await ebscToken.balanceOf(stakingContract.address)));
        console.log("Balance of user1", String(await ebscToken.balanceOf(user1.address)));

        await stakingContract.connect(user1).stake(1, BN.from("20000000").mul(BN.from("10").pow("9")), { value: BN.from("10").mul(BN.from("10").pow("18")) });
        console.log("Staking contract balance after", String(await ebscToken.balanceOf(stakingContract.address)));
        console.log("Balance of user1 after", String(await ebscToken.balanceOf(user1.address)));


        await stakingContract.connect(user4).stake(2, BN.from("30000000").mul(BN.from("10").pow("9")));

        console.log(String(await stakingContract.getUserState(user4.address)[1]));
        console.log("EBSC balance of staking", String(await ebscToken.balanceOf(stakingContract.address)));

       

        await ebscToken.connect(user2).transfer(user4.address, BN.from("2000000").mul(BN.from("10").pow("9")));

        await stakingContract.transferReflection(stakingContract.getReflection());
        console.log("airdrop reflection", String(await airdropContract.getReflection()));
        await ebscToken.connect(owner).transfer(airdropContract.address, 1600051201638);
        console.log("airdrop reflection after", String(await airdropContract.getReflection()));

        await airdropContract.distributionEBSC(Number(await airdropContract.getReflection()));

        console.log("after distributionEBSC");
        let amountStaked = (await stakingContract.getUserState(user4.address));
        console.log("amount staked by user4 ", Number(amountStaked[2]));

        console.log("user4 balance before EBSC reward", String(await ebscToken.balanceOf(user4.address)));
        //await airdropContract.getEBSCReward(user4.address,300000000000000);
        await airdropContract.connect(user4).claimEBSC();
        console.log("user4 balance after EBSC reward", String(await ebscToken.balanceOf(user4.address)));

        //console.log("user 4 lock time ", Number(amountStaked[3]));

        await ethers.provider.send("evm_increaseTime", [1648916310]);
        await ethers.provider.send("evm_mine");


        await stakingContract.connect(user4).unstake(BN.from("30000000").mul(BN.from("10").pow("9")));

        let amountAfter = (await stakingContract.getUserState(user4.address));
        console.log("amount staked by user4 after withdrawl ", Number(amountAfter[2]));

        console.log("user4 pending reward ", Number(await airdropContract.getEBSCReward(user4.address, BN.from("30000000").mul(BN.from("10").pow("9")))));



        console.log("BNB balance ", Number(await airdropContract.viewBalance()));

        await airdropContract.distributionBNB();

        await airdropContract.connect(user3).claimBNB();

        console.log("Balance user3 after claimBNB ", String(await ethers.provider.getBalance(user3.address)));
        console.log("Balance user3 after claimBNB ", String(await ethers.provider.getBalance(user3.address)));


        let a = await stakingContract.getUserState(owner.address);

        // console.log("Allocation :------ ", String(await stakingContract.getAllocationOf(owner.address)));

        // console.log("Allocation",  String(await stakingContract.allocation(1,4)));

        // await token.mint(owner.address, BN.from("7000000000000000").mul(BN.from("10").pow("18")));
        // await token.connect(owner).approve(adminContract.address, BN.from("20000000000").mul(BN.from("10").pow("18")));

        // const ownDate = new Date();

        // let date = parseInt(ownDate.getTime() / 1000);
        // const timeUpdated = date + 23;
        // console.log("Date now in sec ", timeUpdated);


        // defaultParams = {
        //     initial: owner.address,
        //     token: token.address,
        //     totalSupply: BN.from("300000").mul(BN.from("10").pow("18")),
        //     privateStart: BN.from(timeUpdated),
        //     privateEnd: BN.from(timeUpdated + 5000),
        //     publicStart: BN.from(timeUpdated + 6000),
        //     publicEnd: BN.from(timeUpdated + 7000),
        //     privateTokenPrice: BN.from("10000000"),
        //     publicTokenPrice: BN.from("20000000"),
        //     publicBuyLimit: BN.from("1000").mul(BN.from("10").pow("18")),
        //     escrowPercentage: BN.from("600"),
        //     escrowReturnMilestones: [
        //         [BN.from("300"), BN.from("600")],
        //         // [BN.from('600'), BN.from('600')],
        //         [BN.from("900"), BN.from("200")],
        //         [BN.from("600"), BN.from("200")],
        //     ],
        //     thresholdPublicAmount: BN.from("1"),
        //     vestingPoints: [
        //         [BN.from(1643540942), BN.from("1000")],
        //         // ["16479856", BN.from('1000')],
        //     ],
        //     tokenFeePct: BN.from("10"),
        //     valueFeePct: BN.from("300"),
        // };

        // await adminContract.addOperator(owner.address);

        // // console.log("operator hash", await adminContract.OPERATOR);

        // console.log(
        //     "Role checking",
        //     await adminContract.hasRole(
        //         "0x523a704056dcd17bcf83bed8b68c59416dac1119be77755efe3bde0a64e46e0c",
        //         owner.address
        //     )
        // );

        // // await adminContract.createPool(defaultParams);
        // await adminContract.setMasterContract(tokenSaleContract.address);
        // await adminContract.setOracleContract(oracle.address);
        // await adminContract.setStakingContract(stakingContract.address);

        // const tx = await adminContract.createPool(defaultParams);
        // const receipt = await tx.wait();
        // const event = await receipt.events.filter((x) => x.event === "CreateTokenSale");
        // defaultInstance = await TokenSale.attach(event[0].args.instanceAddress);
        // console.log("default instance ", defaultInstance.address);
        // console.log("instance address ", event[0].args.instanceAddress);
        // console.log("get state ", await defaultInstance.amountForSale());
        // //return event[0].args.instanceAddress;

        // console.log("Before deposit");


        // function sleep(time) {
        //     return new Promise((resolve) => setTimeout(resolve, time));
        // }

        // await sleep(5000).then(async () => {

        //     console.log("Initial get state: "+await defaultInstance.getState());
        //     await defaultInstance.connect(owner).deposit({ value: BN.from("10000000000")});

        //     console.log("after deposit get state: "+ await defaultInstance.getState());
        // });

    });
});
