// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// const { describe } = require("mocha");

// describe.only("Staking",async()=>{

//     let Staking;
//     let Token;
//     let accounts;
//     let admin;
//     let token;

//     beforeEach(async()=>{

//         Staking = await ethers.getContractFactory("Staking");
//         Admin = await ethers.getContractFactory("Admin");
//         Token = await ethers.getContractFactory("Token");
//         accounts = await ethers.getSigners();

//         admin = await Admin.deploy();
//         await admin.deployed();

//         token = await Token.deploy("Token", "TKN");
//         await token.deployed();

//         staking = await Staking.deploy();
//         await staking.deployed();
//         staking.initialize(token.address,admin.address,[[200000,600000,1000000,2500000,5000000,7000000],[200000,600000,1000000,2500000,5000000,7000000],[200000,600000,1000000,2500000,5000000,7000000],[200000,600000,1000000,2500000,5000000,7000000,30000000]]);

//     });

//     describe("StakedAmountOf",async()=>{
//         it("The default value is zero",async()=>{
//             let stakedAmount =  await staking.stakedAmountOf(accounts[0].address);
//             expect (stakedAmount).to.be.eq(0);
//         });
//         it("Returns correct staked amount", async()=>{
//             await token.connect(accounts[0]).mint(accounts[1].address,200000000000000);
//             await token.connect(accounts[1]).approve(staking.address,200000000000000)
//             await staking.connect(accounts[1]).stake(1,200000);
//             expect (await staking.stakedAmountOf(accounts[1].address)).to.be.eq(200000);
//         });
//     });

//     describe("stake",async()=>{
//         it("Doesn't stakes a zero value", async()=>{
//         await token.connect(accounts[0]).mint(accounts[1].address,200000000000000);
//         await token.connect(accounts[1]).approve(staking.address,200000000000000)
//         await expect (staking.connect(accounts[1]).stake(1,0)).to.be.revertedWith("Staking: deposited amount must be greater than 0");
//         });

//         it("User can only deposit at higher tier level after first time",async()=>{
//             await token.connect(accounts[0]).mint(accounts[1].address,400000000000000);
//             await token.connect(accounts[1]).approve(staking.address,400000000000000);
//             await staking.connect(accounts[1]).stake(3,200000);
//             await expect(staking.connect(accounts[1]).stake(1,200000)).to.be.revertedWith("Staking: level < user level");
//         });

//     });

//     describe("Unstake",async()=>{
//         it("User cannot withdraw before lock period is over",async()=>{
//             await token.connect(accounts[0]).mint(accounts[1].address,200000000000000);
//             await token.connect(accounts[1]).approve(staking.address,200000000000000)
//             await staking.connect(accounts[1]).stake(1,200000);
//             await expect(staking.connect(accounts[1]).unstake(200000)).to.be.revertedWith("Staking: wait to be able unstake");
//         });
//         it("User Can unstake after lock period is over",async()=>{
//             await token.connect(accounts[0]).mint(accounts[1].address,200000000000000);
//             await token.connect(accounts[1]).approve(staking.address,200000000000000)
//             await staking.connect(accounts[1]).stake(1,200000);
//             await ethers.provider.send("evm_increaseTime", [2592000]);
//             await ethers.provider.send("evm_mine");
//             await staking.connect(accounts[1]).unstake(200000)
//         });
//     });
//     describe("setAllocations",async()=>{
//         it("Sets allocation Accurately",async()=>{
//             await admin.connect(accounts[0]).addOperator(accounts[1].address);
//             let customAllocations = [[15, 60, 120, 360, 750, 1125], [30,120,240,720,1500,2250], [45,180,360,1080,2250,3375], [75,300,600,1800,3750,5625,7500]];
//             await staking.connect(accounts[1]).setAllocations(customAllocations); 
//             expect(await staking.getAllocations(1, 1)).to.be.equal(15);
//             expect(await staking.getAllocations(2, 1)).to.be.equal(30);
//             expect(await staking.getAllocations(3, 2)).to.be.equal(180);
//         });
//     describe("Set admin",async()=>{
//         it("Changes / Sets admin contract address ",async()=>{
//             await admin.connect(accounts[0]).addOperator(accounts[1].address);
//             await staking.connect(accounts[1]).setAdmin(accounts[2].address);
//             //A new admin contract will be deployed on 2nd signer's address
//             //Hence the two values won't be same.
//             await expect(admin.address).to.be.not.eq(accounts[2].address); 
//         });
//     });
//     describe("Set Token",async()=>{
//         it("Changes / Sets token contract address ",async()=>{
//             await admin.connect(accounts[0]).addOperator(accounts[1].address);
//             await staking.connect(accounts[1]).setToken(accounts[2].address);
//             //A new token contract will be deployed on 2nd signer's address
//             //Hence the two values won't be same.
//             await expect(token.address).to.be.not.eq(accounts[2].address);
//         });
//     });
//     describe("getTierOf",async()=>{
//         it("Default tier is zero ",async()=>{
//             let tier = await staking.connect(accounts[0]).getTierOf(accounts[1].address)
//             await expect (tier).to.be.eq(0);
//         });
//         it("It shows accurate tier",async()=>{
//             await token.connect(accounts[0]).mint(accounts[1].address,600000000000000);
//             await token.connect(accounts[1]).approve(staking.address,600000000000000);
//             await staking.connect(accounts[1]).stake(2,600000000000000);
//             await expect (await staking.connect(accounts[1]).getTierOf((accounts[1].address))).to.be.eq(2);
//         });
//     });
//     describe("set tier to",async()=>{
//         it("Changes tier of an user",async()=>{
//             await token.connect(accounts[0]).mint(accounts[2].address,600000000000000);
//             await token.connect(accounts[2]).approve(staking.address,600000000000000);
//             await staking.connect(accounts[2]).stake(2,600000000000000);
//             await admin.connect(accounts[0]).addOperator(accounts[1].address);
//             await staking.connect(accounts[1]).setTierTo(accounts[2].address,3);
//             await expect (await staking.connect(accounts[0]).getTierOf((accounts[2].address))).to.be.eq(3);
//         });
//     });
//     describe("unset tier of",async()=>{
//         it("unsets tier",async()=>{
//             await token.connect(accounts[0]).mint(accounts[2].address,600000000000000);
//             await token.connect(accounts[2]).approve(staking.address,600000000000000);
//             await staking.connect(accounts[2]).stake(2,600000000000000);
//             await admin.connect(accounts[0]).addOperator(accounts[1].address);
//             await staking.connect(accounts[1]).setTierTo(accounts[2].address,3);
//             await staking.connect(accounts[1]).unsetTierOf(accounts[2].address);
//             await expect (await staking.connect(accounts[0]).getTierOf((accounts[2].address))).to.be.eq(2);
//         });
//     });
//     describe("GetUserState",async()=>{
//         it("Gets User State",async () =>{
//             await admin.connect(accounts[0]).addOperator(accounts[1].address);
//             await token.connect(accounts[0]).mint(accounts[2].address,600000000000000);
//             await token.connect(accounts[2]).approve(staking.address,600000000000000);
//             await staking.connect(accounts[2]).stake(2,600000000000000);
//             let userArray = await staking.connect(accounts[0]).getUserState(accounts[2].address);
//             expect (await userArray[0]).to.be.eq(2);
//             expect (await userArray[1]).to.be.eq(2);
//             expect (await userArray[2]).to.be.eq(600000000000000);
//             expect (Number(await userArray[3])).to.be.greaterThan(Number(Date.now()/1000));
//         });
//     });
//     // describe("Checking Pools end time",async()=>{    
//     //     it("Checking Pools end time", async () =>{
//     //         await admin.connect(accounts[0]).createPool(params);
//     //         await staking.connect(accounts[0]).getAllocationOf(accounts[0].address);
//     //         console.log(Number(await staking.connect(accounts[0].address).getAllocationOf(accounts[0].address)));
//     //      });
//     // });
//     describe("Changes allocations", async() =>{
//         it("Operator Revert statement", async() =>{
//             await expect ( staking.connect(accounts[2]).changeAllocations(1,3,12)).to.be.revertedWith('Staking: sender is not an operator');
//         });
//         it("Changes allocations accurately", async() =>{
//             await admin.connect(accounts[0]).addOperator(accounts[1].address);
//             let customAllocations = [[15, 60, 120, 360, 750, 1125], [30,120,240,720,1500,2250], [45,180,360,1080,2250,3375], [75,300,600,1800,3750,5625,7500]];
//             await staking.connect(accounts[1]).setAllocations(customAllocations); 
//             await token.connect(accounts[0]).mint(accounts[2].address,700000000000000);
//             await token.connect(accounts[2]).approve(staking.address,700000000000000)
//             await staking.connect(accounts[2]).stake(3,600000000000000);
//             expect (await staking.connect(accounts[1]).getAllocationOf(accounts[2].address)).to.be.eq(600);
//             //await staking.connect(accounts[1]).changeAllocations(3,600000000000000);
//         });
//     });
//     describe("get allocation of ",async()=>{
//         it("Without setting allocations ", async() =>{
//             await staking.connect(accounts[0]).getAllocationOf(accounts[0].address);
//             console.log(Number(await staking.connect(accounts[0]).getAllocationOf(accounts[0].address)));
//         }); 
//     });
// });
// });
