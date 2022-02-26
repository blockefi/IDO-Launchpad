// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// const {
//   time, // time
//   constants
// } = require("@openzeppelin/test-helpers");
// const { parseEther } = require("@ethersproject/units");
// const balance = require("@openzeppelin/test-helpers/src/balance");
// const web3 = require("@nomiclabs/hardhat-web3");

// const { BigNumber } = ethers;

// const duration = {
//   seconds(val) {
//     return BigNumber.from(val);
//   },
//   minutes(val) {
//     return BigNumber.from(val).mul(this.seconds("60"));
//   },
//   hours(val) {
//     return BigNumber.from(val).mul(this.minutes("60"));
//   },
//   days(val) {
//     return BigNumber.from(val).mul(this.hours("24"));
//   },
//   weeks(val) {
//     return BigNumber.from(val).mul(this.days("7"));
//   },
//   years(val) {
//     return BigNumber.from(val).mul(this.days("365"));
//   },
// };

// function setTokenSaleParams(params) {
//   return [
//     params.initial,
//     params.token,
//     params.totalSupply, // MUST BE 10**18;
//     params.privateStart,
//     params.privateEnd,
//     params.publicStart,
//     params.publicEnd,
//     params.privateTokenPrice, // MUST BE 10**18 in $
//     params.publicTokenPrice, // MUST BE 10**18 in $
//     params.publicBuyLimit, // LIKE ERC20
//     params.escrowPercentage,
//     params.escrowReturnMilestones,
//     params.thresholdPublicAmount,
//     params.vestingPoints,
//     params.tokenFeePct,
//     params.valueFeePct
//   ];
// }
// function descendingSort(arr){
//   let l = arr.length;
//   for(let i = 0; i < l; i++){
//     for(let j = i+1; j < l; j++){
//       if(arr[i][0] < arr[j][0]){
//         let temp = arr[i];
//         arr[i] = arr[j];
//         arr[j] = temp;
//       }
//     }
//   }
//   return arr;
// }

// describe("Admin", () => {
//   const hour = 3600;
//   const day = hour * 24;
//   const week = day * 7;
  
//   let Admin, TokenSale, LPToken, Staking
//   let params;
//   let masterContract;
//   let adminContract;
//   let accounts;
//   let instance;
//   let token;
  
//   before(async () => {
    
//     [owner, alice, bob, tod, larry] = await ethers.getSigners();

//     const { deploy } = deployments;
//     accounts = await ethers.getNamedSigners();

//     Admin = await ethers.getContractFactory("Admin");
//     TokenSale = await ethers.getContractFactory("TokenSale");
//     LPToken = await ethers.getContractFactory("LPToken");
//     Staking = await ethers.getContractFactory("Staking");

//     adminContract = await Admin.deploy();
//     await adminContract.deployed();

//     masterContract = await TokenSale.deploy();
//     await masterContract.deployed();;

//     await adminContract
//       .connect(accounts.deployer)
//       .addOperator(accounts.deployer.address);

//     await adminContract
//       .connect(accounts.deployer)
//       .addOperator(owner.address);
    
//     await adminContract.setMasterContract(masterContract.address);

//     token = await LPToken.deploy("LPToken", "LPT");
//     await token.deployed();

//     await token.mint(owner.address, ethers.utils.parseEther("10"));
//     await token
//       .connect(owner)
//       .approve(adminContract.address, ethers.constants.MaxUint256);
//     const end = BigNumber.from(new Date().getTime() + hour + week)
//     params = {
//       initial: owner.address,
//       token: token.address,
//       totalSupply: ethers.utils.parseEther("10"), // MUST BE 10**18;
//       privateStart: BigNumber.from(new Date().getTime() + hour),
//       privateEnd: end,
//       publicStart: BigNumber.from(new Date().getTime() + hour + week + hour),
//       publicEnd: BigNumber.from(
//         new Date().getTime() + hour + week + hour + week
//       ),
//       privateTokenPrice: BigNumber.from(100), // MUST BE 10**18 in $
//       publicTokenPrice: BigNumber.from(200), // MUST BE 10**18 in $
//       publicBuyLimit: ethers.utils.parseEther("1"), // LIKE ERC20
//       escrowPercentage: BigNumber.from(600),
//       escrowReturnMilestones: [
//         [BigNumber.from('300'), BigNumber.from('300')],
//         [BigNumber.from('600'), BigNumber.from('600')],
//         [BigNumber.from('900'), BigNumber.from('900')],
//         [BigNumber.from('950'), BigNumber.from('0')],
//       ],
//       thresholdPublicAmount: BigNumber.from("1"),
//       vestingPoints: [
//         [end.add(duration.hours(1)), BigNumber.from('100')],
//         [end.add(duration.hours(2)), BigNumber.from('100')],
//         [end.add(duration.hours(3)), BigNumber.from('100')],
//         [end.add(duration.hours(4)), BigNumber.from('100')],
//         [end.add(duration.hours(5)), BigNumber.from('100')],
//         [end.add(duration.hours(6)), BigNumber.from('100')],
//         [end.add(duration.hours(7)), BigNumber.from('100')],
//         [end.add(duration.hours(8)), BigNumber.from('100')],
//         [end.add(duration.hours(9)), BigNumber.from('100')],
//         [end.add(duration.hours(10)), BigNumber.from('100')],
//       ],
//       tokenFeePct: BigNumber.from('10'),
//       valueFeePct: BigNumber.from('30'),
//     };
//   });
//   let snapshotId;
//     beforeEach(async () => {
//       snapshotId = await ethers.provider.send("evm_snapshot");
//     });

//     afterEach(async () => {
//       await ethers.provider.send("evm_revert", [snapshotId]);
//     });
//   describe('Black list', () => {
//       it("Should be revert: Too large array", async () => {
//       await (adminContract.createPool(params));
//       const addresses = await adminContract.getTokenSales();
//         const largeArray = [];
//         for (let i = 0; i < 501; i++) {
//           largeArray.push(alice.address);
//         }
//         await expect(
//           adminContract.addToBlackList(addresses[0], largeArray)
//         ).to.be.revertedWith("Too large array");
//       });
//       it("Should be revert: Pool has already started", async () => {
//         await (adminContract.createPool(params));
//         const addresses = await adminContract.getTokenSales();
//         await time.increaseTo(
//           params.privateStart.add(duration.minutes(61)).toString()
//         );
//         await expect(
//           adminContract.addToBlackList(addresses[0], [accounts.alice.address])
//         ).to.be.revertedWith("Pool has already started");
//       });
//       it("Should be revert: adr is not initial", async () => {
//         await (adminContract.createPool(params));
//         const addresses = await adminContract.getTokenSales();
//         await expect(
//           adminContract.connect(alice).addToBlackList(addresses[0], [accounts.alice.address])
//         ).to.be.revertedWith("adr is not initial");
//       });
//   })
//   describe("Destroy function", () =>  {
//     let snapshotId;
//     beforeEach(async () => {
//       snapshotId = await ethers.provider.send("evm_snapshot");
//     });
//     afterEach(async () => {
//       await ethers.provider.send("evm_revert", [snapshotId]);
//     });

//     it("Should revert with msg 'Pool does not exist yet'", async () => {
//       const mock = [owner, alice, bob, tod, larry];
//       mock.forEach(async (i) => {
//         await expect(
//           adminContract.destroyInstance(i.address)
//         ).to.be.revertedWith("Pool does not exist yet");
//       })
//     });
    
//     it("Should revert with msg 'Pool has already started'", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       await (adminContract.createPool(params));
//       await time.increaseTo(
//         params.privateStart.add(duration.hours(2)).toString()
//         );
//       const addresses = await adminContract.getTokenSales();
//       await expect(
//         adminContract.destroyInstance(addresses[0])
//         ).to.be.revertedWith("Pool has already started");
//       });

//     it("The tokenSalesM should be equal to false", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       const now = (await time.latest()).toNumber();
//       tokenSaleParams[3] = BigNumber.from(now).add(duration.seconds(3600*5));
//       // console.log((tokenSaleParams[3].toNumber()), "tokenSaleParams[3]");
//       // console.log(now); 
//       // console.log("-");
//       await (adminContract.createPool(tokenSaleParams));
//       const addresses = await adminContract.getTokenSales();
//       await adminContract.destroyInstance(addresses[0]);
//       expect(await adminContract.tokenSalesM(addresses[0])).to.equal(false);
//      });

//     it("Wallet destroyed (object equal '0x')", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       await (adminContract.createPool(tokenSaleParams));
//       const addresses = await adminContract.getTokenSales();
//       await adminContract.destroyInstance(addresses[0]);
//       expect (await ethers.provider.getCode(addresses[0])).to.equal('0x');
//     });

//     it("Should change token balance", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       await (adminContract.createPool(tokenSaleParams));
//       const addresses = await adminContract.getTokenSales();
//       await expect(() => adminContract.destroyInstance(addresses[0]))
//       .to.changeTokenBalance(token, owner, params.totalSupply);
//     });
    
//     it("Should change Ether Balance", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       await (adminContract.createPool(tokenSaleParams));
//       const addresses = await adminContract.getTokenSales();
//       await alice.sendTransaction({
//         to: addresses[0],
//         value: ethers.utils.parseEther("1"), // Sends exactly 1.0 ether
//       });
//       await expect(() => adminContract.destroyInstance(addresses[0]))
//       .to.changeEtherBalance(owner, parseEther("1"));
//     })
//   });

//   describe("Create contract", async () => {
//     it("Should create contract and initialize", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       const sortMilestones = descendingSort(params.escrowReturnMilestones);
//       const sortPoints = descendingSort(params.vestingPoints);
//       const tx = await adminContract.createPool(tokenSaleParams);
//       let receipt = await tx.wait();
//       const event = receipt.events?.filter((x) => {return x.event == "CreateTokenSale"});
//       const addresses = await adminContract.getTokenSales();
//       instance = await ethers.getContractAt("TokenSale", addresses[0]);
//       expect(await adminContract.tokenSalesM(instance.address)).to.equal(true);
//       expect(await adminContract.getParams(instance.address)).to.deep.equal(setTokenSaleParams(params));
//     });

    
//     it("Should revert with msg 'Token supply for sale should be greater then 0'", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       tokenSaleParams[2] = 0;
//       await expect(
//         adminContract.createPool(tokenSaleParams)
//       ).to.be.revertedWith("Token supply for sale should be greater then 0");
//     });

//     it("Should revert with msg 'initialAddress || token == 0'", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       tokenSaleParams[0] = constants.ZERO_ADDRESS;
//       await expect(
//         adminContract.createPool(tokenSaleParams)
//       ).to.be.revertedWith("initialAddress || token == 0");
//     });
//     it("Should revert with msg 'initialAddress || token == 0'", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       tokenSaleParams[1] = constants.ZERO_ADDRESS;
//       await expect(
//         adminContract.createPool(tokenSaleParams)
//       ).to.be.revertedWith("initialAddress || token == 0");
//     });

//     it("Should revert with msg 'escrowMilestone > BASE'", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       tokenSaleParams[11] =  [
//         [BigNumber.from('300'), BigNumber.from('300')],
//         [BigNumber.from('600'), BigNumber.from('600')],
//         [BigNumber.from('1001'), BigNumber.from('900')],
//         [BigNumber.from('950'), BigNumber.from('0')],
//       ]
//       await expect(
//         adminContract.createPool(tokenSaleParams)
//       ).to.be.revertedWith("escrowMilestone > BASE");
//     });

//     it("Should revert with msg 'escrowMilestone > BASE'", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       tokenSaleParams[11] =  [
//         [BigNumber.from('300'), BigNumber.from('300')],
//         [BigNumber.from('600'), BigNumber.from('600')],
//         [BigNumber.from('900'), BigNumber.from('900')],
//         [BigNumber.from('950'), BigNumber.from('1000')],
//       ]
//       await expect(
//         adminContract.createPool(tokenSaleParams)
//       ).to.be.revertedWith("escrowMilestone > BASE");
//     });

//     it("Should revert with msg 'must be less than BASE'", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       tokenSaleParams[10] = BigNumber.from('1000');
//       await expect(
//         adminContract.createPool(tokenSaleParams)
//       ).to.be.revertedWith("must be less than BASE");
//     });

//     it("Should revert with msg 'amount of percentage is not equal to base'", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       tokenSaleParams[13] = [
//         [tokenSaleParams[4].add(duration.hours(1)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(2)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(3)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(4)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(5)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(6)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(7)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(8)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(9)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(10)), BigNumber.from('101')], //<<
//       ]
//       await expect(
//         adminContract.createPool(tokenSaleParams)
//       ).to.be.revertedWith("amount of percentage is not equal to base");
//     });

//     it("Should revert with msg 'amount of percentage is not equal to base'", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       tokenSaleParams[13] = [
//         [tokenSaleParams[4].add(duration.hours(1)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(2)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(3)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(4)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(5)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(6)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(7)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(8)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(9)), BigNumber.from('100')],
//         [tokenSaleParams[4].add(duration.hours(10)), BigNumber.from('99')], //<<
//       ]
//       await expect(
//         adminContract.createPool(tokenSaleParams)
//       ).to.be.revertedWith("amount of percentage is not equal to base");
//     });

//     it("Should revert with msg 'End time should be greater then start time'", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       const a = tokenSaleParams[3];
//       tokenSaleParams[3] = tokenSaleParams[4];
//       tokenSaleParams[4] = a;
//       await expect(
//         adminContract.createPool(tokenSaleParams)
//       ).to.be.revertedWith("End time should be greater then start time");
//     });

//     it("Should revert with msg 'Start time should be greater then timestamp", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       const now = (await time.latest()).toNumber();
//       tokenSaleParams[3] = BigNumber.from(now).sub(duration.seconds(5));
//       await expect(
//         adminContract.createPool(tokenSaleParams)
//       ).to.be.revertedWith("Start time should be greater then timestamp");
//     });

//     it("Should revert with msg 'Public round should start after private round'", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       const now = (await time.latest()).toNumber();
//       tokenSaleParams[3] = BigNumber.from(now).add(duration.seconds(5));
//       tokenSaleParams[4] = BigNumber.from(now).add(duration.hours(1));
//       tokenSaleParams[5] = BigNumber.from(now).sub(duration.hours(2));
//       tokenSaleParams[6] = BigNumber.from(now).add(duration.hours(4));;
//       await expect(
//         adminContract.createPool(tokenSaleParams)
//       ).to.be.revertedWith("Public round should start after private round");
//     });

//     it("Should revert with msg 'End time should be greater then start time'", async () => {
//       const tokenSaleParams = setTokenSaleParams(params);
//       const a = tokenSaleParams[5];
//       tokenSaleParams[5] = tokenSaleParams[6];
//       tokenSaleParams[6] = a;
//       await expect(
//         adminContract.createPool(tokenSaleParams)
//       ).to.be.revertedWith("End time should be greater then start time");
//     });
//   });
// });
