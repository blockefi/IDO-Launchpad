// /* eslint-disable no-plusplus */
// /* eslint-disable new-cap */
// /* eslint-disable no-undef */
// const {
//   time, // time
//   constants
// } = require("@openzeppelin/test-helpers");

// const chai = require("chai");

// const { expect } = chai;
// const BN = require("ethers").BigNumber;

// const { parseEther } = require("ethers").utils;
// chai.use(require("chai-bignumber")());


// const duration = {
//   seconds(val) {
//     return BN.from(val);
//   },
//   minutes(val) {
//     return BN.from(val).mul(this.seconds("60"));
//   },
//   hours(val) {
//     return new BN.from(val).mul(this.minutes("60"));
//   },
//   days(val) {
//     return new BN.from(val).mul(this.hours("24"));
//   },
//   weeks(val) {
//     return new BN.from(val).mul(this.days("7"));
//   },
//   years(val) {
//     return new BN.from(val).mul(this.days("365"));
//   },
// };

// describe("TokenSale contract", function (done) {
//   const hour = 3600;
//   const decimals = BN.from("18");
//   const totalMint = BN.from("1000").mul(BN.from("10").pow(decimals));

//   const EXCHANGE_RATE = BN.from(48887406263);
//   const PCT_BASE = BN.from("10").pow("18");
//   const ORACLE_MUL = BN.from("10").pow("10");
//   const ZERO = BN.from('0');
//   const POINT_BASE = BN.from('1000');

//   const STARTER_TIER = BN.from(2e5).mul(BN.from("10").pow("9"));
//   const INVESTOR_TIER = BN.from(6e5).mul(BN.from("10").pow("9"));
//   const STRATEGIST_TIER = BN.from(25e5).mul(BN.from("10").pow("9"));
//   const EVANGELIST_TIER = BN.from(7e6).mul(BN.from("10").pow("9"));
//   const MaxTiers = {
//     Evangelist: BN.from("459461743190958214254398"),
//     Strategist: BN.from("183784697276383285701759"),
//     Investor: BN.from("91892348638191642850879"),
//     Starter: BN.from("36756939455276657140351"),
//     None: BN.from("0"),
//   };

//   const Tiers = Object.freeze({
//     STARTER_TIER: BN.from(2e5).mul(BN.from("10").pow("9")),
//     INVESTOR_TIER:  BN.from(6e5).mul(BN.from("10").pow("9")),
//     STRATEGIST_TIER: BN.from(25e5).mul(BN.from("10").pow("9")),
//     EVANGELIST_TIER: BN.from(7e6).mul(BN.from("10").pow("9")),
//     EVANGELIST_TIER_PRO: BN.from(3e7).mul(BN.from("10").pow("9")),
//   });

//   const LockLevel = Object.freeze({
//     NONE: 0,
//     FIRST: 1,
//     SECOND: 2,
//     THIRD: 3,
//   });

//   const TiersEnum = Object.freeze({
//     NONE: 0,
//     STATER: 1,
//     INVESTOR: 2,
//     STRATEGIST: 3,
//     EVANGELIST: 4,
//     EVANGELIST_PRO: 5,
//   });

//   let provider;

//   let Admin;
//   let TokenSale;
//   let Token;
//   let Staking;
//   let Oracle;
//   let Airdrops;

//   let oracle;
//   let masterContract;
//   let adminContract;
//   let stakingContract;
//   let airdrops;
//   let lpToken;
//   let owner;
//   let alice;
//   let bob;
//   let pol;
//   let tod;
//   let larry;
//   let defaultInstance;
//   let defaultToken;
//   let defaultParams;
//   let defaultAllocation;

//   async function createPool({
//     initial,
//     token,
//     totalSupply,
//     privateStart,
//     privateEnd,
//     publicStart,
//     publicEnd,
//     privateTokenPrice,
//     publicTokenPrice,
//     publicBuyLimit,
//     escrowPercentage,
//     escrowReturnMilestones,
//     thresholdPublicAmount,
//     vestingPoints,
//     tokenFeePct,
//     valueFeePct
//   }) {
//     defaultToken = await Token.deploy("DefaultToken", "def");
//     await defaultToken.deployed();
//     await defaultToken.changeDecimals(decimals);
//     await defaultToken.mint(owner.address, totalMint);
//     await defaultToken.approve(adminContract.address, totalMint);
//     defaultParams.token = defaultToken.address;

//     const params = {
//       initial: initial || defaultParams.initial,
//       token: token || defaultParams.token,
//       totalSupply: totalSupply || defaultParams.totalSupply,
//       privateStart: privateStart || defaultParams.privateStart,
//       privateEnd: privateEnd || defaultParams.privateEnd,
//       publicStart: publicStart || defaultParams.publicStart,
//       publicEnd: publicEnd || defaultParams.publicEnd,
//       privateTokenPrice: privateTokenPrice || defaultParams.privateTokenPrice,
//       publicTokenPrice: publicTokenPrice || defaultParams.publicTokenPrice,
//       publicBuyLimit: publicBuyLimit || defaultParams.publicBuyLimit,
//       escrowPercentage: escrowPercentage || defaultParams.escrowPercentage,
//       escrowReturnMilestones:
//       escrowReturnMilestones || defaultParams.escrowReturnMilestones,
//       thresholdPublicAmount:
//       thresholdPublicAmount || defaultParams.thresholdPublicAmount,
//       vestingPoints: vestingPoints || defaultParams.vestingPoints,
//       tokenFeePct: tokenFeePct || defaultParams.tokenFeePct,
//       valueFeePct: valueFeePct || defaultParams.valueFeePct,
//     };

//     const tx = await adminContract.createPool(params);
//     const receipt = await tx.wait();
//     const event = receipt.events.filter((x) => x.event === "CreateTokenSale");
//     defaultInstance = TokenSale.attach(event[0].args.instanceAddress);
//     return event[0].args.instanceAddress;
//   }

//   beforeEach(async () => {
//     Admin = await ethers.getContractFactory("Admin");
//     TokenSale = await ethers.getContractFactory("TokenSale");
//     Token = await ethers.getContractFactory("LPToken");
//     Staking = await ethers.getContractFactory("Staking");
//     Oracle = await ethers.getContractFactory("ChainLink");
//     Airdrops = await ethers.getContractFactory("Airdrops");

//     [owner, alice, bob, pol, tod, larry] = await ethers.getSigners();
//     provider = ethers.provider;

//     masterContract = await TokenSale.deploy();
//     await masterContract.deployed();

//     oracle = await Oracle.deploy();
//     await oracle.deployed();

//     lpToken = await Token.deploy("LPToken", "lp");
//     await lpToken.deployed();

//     adminContract = await Admin.deploy();
//     await adminContract.deployed();

//     stakingContract = await Staking.deploy(
//       lpToken.address,
//       adminContract.address
//     );

//     airdrops = await Airdrops.deploy(stakingContract.address, adminContract.address, lpToken.address);
//     await airdrops.deployed();


//     await adminContract.addOperator(owner.address);
//     await adminContract.setMasterContract(masterContract.address);
//     await adminContract.setOracleContract(oracle.address);
//     await adminContract.setStakingContract(stakingContract.address);
//     await adminContract.setAirdrop(airdrops.address);
    
//     defaultAllocation = {
//       NONE: {
//         STARTER: BN.from("100").mul(BN.from("10").pow("18")),
//         INVESTOR: BN.from("250").mul(BN.from("10").pow("18")),
//         STRATEGIST: BN.from("500").mul(BN.from("10").pow("18")),
//         EVANGELIST: BN.from("1250").mul(BN.from("10").pow("18")),
//       },
//       FIRST: {
//         STARTER: BN.from("125").mul(BN.from("10").pow("18")),
//         INVESTOR: BN.from("325").mul(BN.from("10").pow("18")),
//         STRATEGIST: BN.from("625").mul(BN.from("10").pow("18")),
//         EVANGELIST:  BN.from("1750").mul(BN.from("10").pow("18")),
//       },
//       SECOND: {
//         STARTER: BN.from("150").mul(BN.from("10").pow("18")),
//         INVESTOR: BN.from("400").mul(BN.from("10").pow("18")),
//         STRATEGIST: BN.from("750").mul(BN.from("10").pow("18")),
//         EVANGELIST: BN.from("2000").mul(BN.from("10").pow("18")),
//       },
//       THIRD: {
//         STARTER: BN.from("200").mul(BN.from("10").pow("18")),
//         INVESTOR: BN.from("500").mul(BN.from("10").pow("18")),
//         STRATEGIST: BN.from("1000").mul(BN.from("10").pow("18")),
//         EVANGELIST: BN.from("2500").mul(BN.from("10").pow("18")),
//         EVANGELIST_PRO:  BN.from("3500").mul(BN.from("10").pow("18")),
//       }
//     }
//     const arrayOfAllocations = [
//       [
//         defaultAllocation.NONE.STARTER,
//         defaultAllocation.NONE.INVESTOR,
//         defaultAllocation.NONE.STRATEGIST,
//         defaultAllocation.NONE.EVANGELIST,
//       ],
//       [
//         defaultAllocation.FIRST.STARTER,
//         defaultAllocation.FIRST.INVESTOR,
//         defaultAllocation.FIRST.STRATEGIST,
//         defaultAllocation.FIRST.EVANGELIST,
//       ],  
//       [
//         defaultAllocation.SECOND.STARTER,
//         defaultAllocation.SECOND.INVESTOR,
//         defaultAllocation.SECOND.STRATEGIST,
//         defaultAllocation.SECOND.EVANGELIST,
//       ], 
//       [
//         defaultAllocation.THIRD.STARTER,
//         defaultAllocation.THIRD.INVESTOR,
//         defaultAllocation.THIRD.STRATEGIST,
//         defaultAllocation.THIRD.EVANGELIST,
//         defaultAllocation.THIRD.EVANGELIST_PRO,
//       ],

//     ];
//     await stakingContract.setAllocations(arrayOfAllocations)
//     const now = (await time.latest()).toNumber();
//     const end = BN.from(now).add(duration.hours(5));

//     defaultParams = {
//       initial: owner.address,
//       totalSupply: totalMint,
//       privateStart: BN.from(now).add(duration.hours(1)),
//       privateEnd: end,
//       publicStart: BN.from(now).add(duration.hours(6)),
//       publicEnd: BN.from(now).add(duration.hours(11)),
//       privateTokenPrice: BN.from("399999999999999999612"),
//       publicTokenPrice: BN.from("499999999999999999760"),
//       publicBuyLimit: BN.from("1000").mul(BN.from("10").pow("18")),
//       escrowPercentage: BN.from("600"),
//       escrowReturnMilestones: [
//         [BN.from('300'), BN.from('300')],
//         [BN.from('600'), BN.from('600')],
//         [BN.from('900'), BN.from('900')],
//         [BN.from('950'), BN.from('0')],
//       ],
//       thresholdPublicAmount: BN.from("1"),
//       vestingPoints: [
//         [end.add(duration.hours(1)), BN.from('100')],
//         [end.add(duration.hours(2)), BN.from('100')],
//         [end.add(duration.hours(3)), BN.from('100')],
//         [end.add(duration.hours(4)), BN.from('100')],
//         [end.add(duration.hours(5)), BN.from('100')],
//         [end.add(duration.hours(6)), BN.from('100')],
//         [end.add(duration.hours(7)), BN.from('100')],
//         [end.add(duration.hours(8)), BN.from('100')],
//         [end.add(duration.hours(9)), BN.from('100')],
//         [end.add(duration.hours(10)), BN.from('100')],
//       ],
//       tokenFeePct: BN.from('10'),
//       valueFeePct: BN.from('30'),
//     };
//     await createPool({});
//   });
//   function parseGwei(amount) {
//     return BN.from(amount).mul(BN.from("10").pow("9"));
//   }
//   function mxByAmount(amount) {
//     if (amount.gte(EVANGELIST_TIER)) {
//       return MaxTiers.Evangelist;
//     }
//     if (amount.gte(STRATEGIST_TIER)) {
//       return MaxTiers.Strategist;
//     }
//     if (amount.gte(INVESTOR_TIER)) {
//       return MaxTiers.Investor;
//     }
//     if (amount.gte(STARTER_TIER)) {
//       return MaxTiers.Starter;
//     }
//   }
//   async function setMaxAllocation(lock = LockLevel.NONE, tier = TiersEnum.EVANGELIST){
//     await stakingContract.changeAllocations(lock, tier, BN.from(1e15).mul(BN.from("10").pow("18")));
//   }
//   function setPrivatePrice(price = defaultParams.privateTokenPrice) {
//   return price.mul(PCT_BASE).div(EXCHANGE_RATE.mul(ORACLE_MUL))
//  }
//  function setPublicPrice(price = defaultParams.publicTokenPrice) {
//    return price.mul(PCT_BASE).div(EXCHANGE_RATE.mul(ORACLE_MUL))
// }
//   function descendingSort(arr){
//     let l = arr.length;
//     for(let i = 0; i < l; i++){
//       for(let j = i+1; j < l; j++){
//         if(arr[i][0] < arr[j][0]){
//           let temp = arr[i];
//           arr[i] = arr[j];
//           arr[j] = temp;
//         }
//       }
//     }
//     return arr;
//   }
//   function calculateTokenAmount(amount, price) {
//     return amount.mul(PCT_BASE).div(price || setPrivatePrice());
//   }

//   function calculatePublicTokenAmount(amount) {
//     return amount.mul(PCT_BASE).div(setPublicPrice());
//   }
//   function calculatePublicTokenAmountWithBuyLimit(amount) {
//     const maxValue = defaultParams.publicBuyLimit.mul(PCT_BASE).div(EXCHANGE_RATE.mul(ORACLE_MUL));
//     const maxToken = maxValue.mul(PCT_BASE).div(setPublicPrice());
//     const want = amount.mul(PCT_BASE).div(setPublicPrice());
//     return want.gte(maxToken) ? maxToken : want;
//   }
//   function calculateAmountByTokens(tokens) {
//     return tokens.mul(setPrivatePrice()).div(PCT_BASE);
//   }
//   function calculateAmountByTokensPublic(tokens) {
//     return tokens.mul(setPublicPrice()).div(PCT_BASE);
//   }
//   function calculateAmountByPercent(total, prc) {
//     return total.mul(prc).div(BN.from(100));
//   }
//   function calculateLeftBnB(total, claim, price) {
//     return total.sub(claim).mul(price || setPrivatePrice()).div(PCT_BASE);
//   }

//   function shift(amount) {
//     if (decimals.toNumber() !== 18) {
//       return decimals.toNumber() < 18
//         ? amount.div(BN.from("10").pow(BN.from("18").sub(decimals)))
//         : amount.mul(BN.from("10").pow(decimals.sub(BN.from("18"))));
//     }
//     return amount;
//   }

//   function multiply(amount) {
//     if (decimals.toNumber() !== 18) {
//       return decimals.toNumber() < 18
//         ? amount.mul(BN.from("10").pow(BN.from("18").sub(decimals)))
//         : amount.div(BN.from("10").pow(decimals.sub(BN.from("18"))));
//     }
//     return amount;
//   }
//   function calculateWithRate(want, totalSupply, totalPrivateSold) {
//     const rate = totalSupply.mul(PCT_BASE).div(totalPrivateSold);
//     return want.mul(rate).div(PCT_BASE);
//   }
//   // limit - in $
//   function maxTokeAllocation(limit) {
//     const inBnb = limit.mul(PCT_BASE).div(EXCHANGE_RATE.mul(ORACLE_MUL));
//     return inBnb.mul(PCT_BASE).div(setPrivatePrice());
//   }

//   async function calculateGasCost(tx) {
//     const receipt = await tx.wait();
//     return (await provider.getGasPrice()).mul(receipt.gasUsed);
//   }

//   async function stake(account, amount, level = LockLevel.NONE) {
//     await lpToken.mint(account.address, amount);
//     await lpToken.connect(account).approve(stakingContract.address, amount);
//     await stakingContract.connect(account).stake(level, amount);
//   }
//   async function parseEvent(tx, name) {
//     const receipt = await tx.wait();
//     const event = receipt.events.filter((x) => x.event === name);
//     return event[0];
//   }

//   async function deposit(
//     {
//     account,
//     amount,
//     stakeAmount = Tiers.STARTER_TIER,
//     lockLevel,
//     increase = true,
//     instance = defaultInstance
//     }
//   ) {
//     await stake(account, stakeAmount, lockLevel);
//     if (increase) {
//       await time.increaseTo(
//         defaultParams.privateStart.toString()
//       );
//     }
//     await instance.connect(account).deposit({ value: amount });
//   }

//   function returnEscrowAmount(blocked, returnAmount) {
//     return returnAmount.toString() === "0"
//       ? blocked
//       : blocked.mul(returnAmount).div(BN.from(POINT_BASE));
//   }
//   function blockedEscrowAmount(totalSupply, percentage) {
//     return totalSupply.mul(percentage).div(BN.from(POINT_BASE));
//   }

//   describe('Checking threshold', function () {
//     it('Threshold is passed', async () => {
//       const totalSupply = await defaultInstance.amountForSale();
//       //threshold is 50%
//       await createPool({thresholdPublicAmount: shift(totalSupply).mul(BN.from('50')).div(BN.from('100'))});

//       await setMaxAllocation();
//       await stake(alice, Tiers.EVANGELIST_TIER);

//       await time.increaseTo(
//         defaultParams.privateStart.add(duration.seconds(1)).toString()
//           );
//       // buy 49%
//       await defaultInstance.connect(alice).deposit({ 
//         value: calculateAmountByTokens(
//         calculateAmountByPercent(totalSupply, BN.from("49"))
//       )});
//       await time.increaseTo(
//         defaultParams.publicStart.add(duration.seconds(1)).toString()
//       );
//       await defaultInstance.deposit({value: parseEther('1')});
//       expect(await defaultInstance.epoch()).to.be.equal(BN.from('3'))

//     })
//     it('Threshold is not passed', async () => {
//       const totalSupply =
//       await defaultInstance.amountForSale();
//        //threshold is 50%
//       await createPool({
//         thresholdPublicAmount: shift(totalSupply).mul(BN.from('50')).div(BN.from('100')),
//       }
//         );
//       //So that the user has the opportunity to buy 51% of tokens
//       await setMaxAllocation(LockLevel.SECOND, TiersEnum.EVANGELIST);
//       await stake(alice, Tiers.EVANGELIST_TIER, LockLevel.SECOND);

//       await time.increaseTo(
//         defaultParams.privateStart.add(duration.seconds(1)).toString()
//           );
//       // buy 51%
//       await defaultInstance.connect(alice).deposit({ 
//         value: calculateAmountByTokens(
//         calculateAmountByPercent(totalSupply, BN.from("51"))
//       )});
//       await time.increaseTo(
//         defaultParams.publicStart.add(duration.seconds(10)).toString()
//       );
//       await expect(defaultInstance.deposit({value: parseEther('1')})).to.be.revertedWith("incorrect time");
//     })
//   })

//   describe("Deposit func", function () {
//     it("Should be revert: sale has not started ", async () => {
//       await expect(defaultInstance.deposit()).to.be.revertedWith(
//         "incorrect time'"
//       );
//     });
//     it("Should be revert: Sale is over", async () => {
//       await time.increaseTo(
//         defaultParams.publicEnd.add(duration.seconds(12)).toString()
//       );
//       await expect(defaultInstance.deposit()).to.be.revertedWith(
//         "incorrect time"
//       );
//     });
//     it("Should be revert: Cannot deposit 0", async () => {
//       await time.increaseTo(
//         defaultParams.privateStart.add(duration.minutes(61)).toString()
//       );
//       await expect(defaultInstance.deposit()).to.be.revertedWith(
//         "Cannot deposit 0"
//       );
//     });
//     describe("Private deposit", function () {
//       it("Should be revert: does not have tier", async () => {
//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.minutes(61)).toString()
//         );
//         await expect(
//           defaultInstance.deposit({ value: parseEther("1") })
//         ).to.be.revertedWith("does not have tier");
//       });

//       it("Should be private deposit made successfully", async () => {
//         await stake(alice, Tiers.INVESTOR_TIER, LockLevel.THIRD);
//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.minutes(61)).toString()
//         );
//         // Event
//         await expect(
//           defaultInstance.connect(alice).deposit({ value: parseEther("1") })
//         )
//           .to.emit(defaultInstance, "DepositPrivate")
//           .withArgs(alice.address, shift(calculateTokenAmount(parseEther("1"))));

//         const state = await defaultInstance.getState();
//         const epoch = await defaultInstance.epoch.call();
//         // exchange was set
//         expect(state[0]).to.be.equal(EXCHANGE_RATE);

//         // epoch was set on start
//         expect(epoch).to.be.equal(BN.from(1));

//         // privateSold is equal to deposit amount
//         expect(calculateTokenAmount(parseEther("1"))).to.be.equal(state[1]);
//       });
//       it("the amount should be calculated correctly according to the tier of user (for STARTER)", async () => {
//         const depositAlice = parseEther("25");
//         await stake(alice, Tiers.STARTER_TIER, LockLevel.SECOND);
//         // to Private time
//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.minutes(61)).toString()
//         );

//         const maxAllocation = maxTokeAllocation(defaultAllocation.SECOND.STARTER); //150$
//         const left = calculateAmountByTokens(
//           calculateTokenAmount(depositAlice).sub(maxAllocation)
//         );
//         await expect(() => defaultInstance
//         .connect(alice)
//         .deposit({ value: depositAlice })).to.changeEtherBalance(
//           alice,
//           BN.from(`-${depositAlice.sub(left)}`)
//         )
//         const stakeUser = await defaultInstance.stakes(alice.address);
//         expect(stakeUser[0]).to.be.equal(maxAllocation);
//       });
//       it("the amount should be calculated correctly according to the tier of user (for INVESTOR)", async () => {
//         const depositAlice = parseEther("25");
//         await stake(alice, Tiers.INVESTOR_TIER, LockLevel.FIRST);
//         // to Private time
//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.minutes(61)).toString()
//         );

//         const maxAllocation = maxTokeAllocation(defaultAllocation.FIRST.INVESTOR); //325$
//         const left = calculateAmountByTokens(
//           calculateTokenAmount(depositAlice).sub(maxAllocation)
//         );
//         await expect(() => defaultInstance
//         .connect(alice)
//         .deposit({ value: depositAlice })).to.changeEtherBalance(
//           alice,
//           BN.from(`-${depositAlice.sub(left)}`)
//         )
//         const stakeUser = await defaultInstance.stakes(alice.address);
//         expect(stakeUser[0]).to.be.equal(maxAllocation);
//       });

//       it("The private sold should be correctly calculated after three deposits", async () => {
//         await setMaxAllocation(LockLevel.THIRD, TiersEnum.EVANGELIST)
//         await stake(alice, Tiers.EVANGELIST_TIER, LockLevel.THIRD);
//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.minutes(61)).toString()
//         );
//         await defaultInstance
//           .connect(alice)
//           .deposit({ value: parseEther("1") });
//         await defaultInstance
//           .connect(alice)
//           .deposit({ value: parseEther("1") });
//         await defaultInstance
//           .connect(alice)
//           .deposit({ value: parseEther("1") });

//         // after three deposits
//         const state = await defaultInstance.getState.call();
//         expect(calculateTokenAmount(parseEther("3"))).to.be.closeTo(state[1], BN.from('5'));
//       });
//       it("The private sold should be correctly calculated after three deposits (with 5% fee)", async () => {
//         await setMaxAllocation(LockLevel.NONE, TiersEnum.EVANGELIST)
//         await stake(alice, Tiers.EVANGELIST_TIER);

//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.minutes(61)).toString()
//         );
//         await defaultInstance
//           .connect(alice)
//           .deposit({ value: parseEther("1") });
//         await defaultInstance
//           .connect(alice)
//           .deposit({ value: parseEther("1") });
//         await defaultInstance
//           .connect(alice)
//           .deposit({ value: parseEther("1") });

//         // after three deposits
//         const state = await defaultInstance.getState.call();
//         const expectAmount = calculateTokenAmount(parseEther("3").mul('95').div('100'))
//         expect(expectAmount).to.be.closeTo(state[1], BN.from('5'));
//       });

//       it("TotalSold should be calculated correctly", async () => {
//         //await setMaxAllocation(LockLevel.NONE, TiersEnum.EVANGELIST)
//         await stake(alice, Tiers.EVANGELIST_TIER, LockLevel.THIRD);

//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.minutes(61)).toString()
//         );
//         await defaultInstance
//           .connect(alice)
//           .deposit({ value: parseEther("1") });

//         // after three deposits
//         const state = await defaultInstance.getState.call();

//         expect(calculateTokenAmount(parseEther("1"))).to.be.equal(state[1]);
//       });

//       it("TotalSold should be calculated correctly after change tier", async () => {
//         //await setMaxAllocation(LockLevel.NONE, TiersEnum.STRATEGIST)
//         await stake(alice, Tiers.STRATEGIST_TIER, LockLevel.FIRST);

//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.minutes(61)).toString()
//         );
//         const firstDeposit = calculateAmountByTokens(maxTokeAllocation(defaultAllocation.NONE.STRATEGIST)) 
//         await defaultInstance
//           .connect(alice)
//           .deposit({ value: firstDeposit});

//         // // user got evangelist tier and deposit
//         await stake(alice, Tiers.EVANGELIST_TIER, LockLevel.FIRST);
//         const secondDeposit = parseEther('1')
//         const expectValue = secondDeposit.add(firstDeposit);
//         await defaultInstance
//           .connect(alice)
//           .deposit({ value: secondDeposit });

//         const state = await defaultInstance.getState.call();
//         expect(calculateTokenAmount(expectValue)).to.be.closeTo(state[1], BN.from('5'));
//       });
//       it("the fee should be calculated correctly ", async () => {
//         await stake(alice, Tiers.EVANGELIST_TIER_PRO, LockLevel.NONE);
//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.minutes(61)).toString()
//         );
//         const deposit = parseEther('1');
//         await defaultInstance
//           .connect(alice)
//           .deposit({ value: deposit});
//         //5% 
//         const fee = deposit.mul('5').div('100')
//         const expectValue = deposit.sub(fee);
//         const stakeUser = await defaultInstance.stakes(alice.address);
//         const state = await airdrops.saleStates(defaultInstance.address);
//         expect(stakeUser[0]).to.be.equal(calculateTokenAmount(expectValue))
//         expect(state[3]).to.be.equal(fee);
//       });
//     });

//     describe("Public deposit", () => {
//       it("successful buying", async () => {
//         const want = parseEther("10");
//         await time.increaseTo(
//           defaultParams.publicStart.add(duration.seconds(1)).toString()
//         );
//         const amount = calculatePublicTokenAmountWithBuyLimit(want);
//         // Event
//         await expect(defaultInstance.connect(alice).deposit({ value: want }))
//           .to.emit(defaultInstance, "DepositPublic")
//           .withArgs(alice.address, shift(amount));
//       });
//       it("Successful buying with buy limit", async () => {
//         await createPool({
//           publicBuyLimit: BN.from("250000").mul(BN.from("10").pow("18")),
//           privateTokenPrice: BN.from("399999999999999999612"),
//           publicTokenPrice: BN.from("499999999999999999760")
//         }); 
//         const want = parseEther("120");
//         // to public epoch
//         await time.increaseTo(
//           defaultParams.publicStart.add(duration.seconds(1)).toString()
//         );
//         // ~366
//         defaultInstance.connect(bob).deposit({ value: parseEther("120") });
//         defaultInstance.connect(tod).deposit({ value: parseEther("120") });
//         defaultInstance.connect(pol).deposit({ value: parseEther("120") });

//         const supply = await defaultInstance.amountForSale();

//         const leftForBuy = supply.sub(
//           calculatePublicTokenAmount(parseEther("360"))
//         );
//         const before = await provider.getBalance(alice.address);
//         const tx = await defaultInstance
//           .connect(alice)
//           .deposit({ value: want });

//         const receipt = await tx.wait();
//         const gas = await calculateGasCost(tx);
//         const event = receipt.events.filter((x) => x.event === "DepositPublic");
//         const state = await defaultInstance.getState();
//         const changeTokens = calculatePublicTokenAmount(want).sub(leftForBuy);
//         const changeBnb = changeTokens
//           .mul(setPublicPrice())
//           .div(PCT_BASE);
//         const after = before.sub(want).sub(gas).add(changeBnb);
//         expect(event[0].args.amount).to.be.closeTo(
//           shift(leftForBuy),
//           BN.from("5"),
//           ""
//         );
//         expect(after).to.be.closeTo(
//           await provider.getBalance(alice.address),
//           BN.from("5"),
//           ""
//         );
//         expect(state[2]).to.be.equal(supply);
//       });
//     });
//     describe("Black list", async () => {
//       let addresses;
//       let people;
//       before(async () => {
//         addresses = [alice.address, bob.address, tod.address];
//         people = [alice, bob, tod];
//       });
     
//       it("Should be add addresses successfully", async () => {
//         await adminContract.addToBlackList(defaultInstance.address, addresses);
//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.minutes(61)).toString()
//         );
//         // revert
//         people.forEach(async (el) => {
//           await expect(
//             defaultInstance.connect(el).deposit()
//           ).to.be.revertedWith("adr in the blacklist");
//         });
//         // for this address revert for another reason
//         await expect(
//           defaultInstance.connect(pol).deposit({ value: parseEther("1") })
//         ).to.be.revertedWith("does not have tier");
//       });
//     });
//   });
//   describe("Take Fee", () => {
//     it("Should be revert: sale isn't over", async () => {
//       // incoming time
//       await expect(defaultInstance.takeFee()).to.be.revertedWith(
//         "It is not time yet"
//       );
//       // private time
//       await time.increaseTo(
//         defaultParams.privateStart.add(duration.minutes(61)).toString()
//       );
//       await expect(defaultInstance.takeFee()).to.be.revertedWith(
//         "It is not time yet"
//       );
//     });
//     it("Should be revert: Already paid", async () => {
//       // to Private End time
//       await time.increaseTo(
//         defaultParams.privateEnd.add(duration.seconds(1)).toString()
//       );
//       await defaultInstance.takeFee();
//       await expect(defaultInstance.takeFee()).to.be.revertedWith(
//         "Already paid'"
//       );
//     });
//     it("Successful payment", async () => {
//       //to check takeEscrow correctly
//       await adminContract.setWallet(larry.address);
//       await deposit({account: alice, amount: parseEther('5'), stakeAmount: Tiers.EVANGELIST_TIER, lockLevel: LockLevel.THIRD});
//       // to Private End Time 
//       await time.increaseTo(
//         defaultParams.privateEnd.add(duration.seconds(1)).toString()
//       );
//       const earned = parseEther('5');
//       //sub one due to rounding
//       const fee = earned.mul(defaultParams.valueFeePct).div(POINT_BASE).sub(BN.from('1'));
//       const tokenFee = defaultParams.totalSupply.mul(defaultParams.tokenFeePct).div(POINT_BASE);
//       await expect(() => defaultInstance.takeFee()).to.changeEtherBalance(larry, fee)
//       expect(await defaultToken.balanceOf(larry.address)).to.be.equal(tokenFee);
//     });
//     it("Successful payment: sold out ", async () => {
//       await createPool({
//         publicBuyLimit: BN.from("99999999").mul(BN.from("10").pow("18")),
//       })
//       const totalSupply = await defaultInstance.amountForSale();
//       await setMaxAllocation(LockLevel.NONE, TiersEnum.EVANGELIST)
//       //buy 120 pct
//       await deposit({account: alice, amount: calculateAmountByTokens(calculateAmountByPercent(totalSupply, BN.from("120"))), stakeAmount: Tiers.EVANGELIST_TIER});
//       //to check takeEscrow correctly
//       await adminContract.setWallet(larry.address);
//       // to Private End Time 
//       await time.increaseTo(
//         defaultParams.privateEnd.add(duration.seconds(1)).toString()
//       );
//       const earned = calculateAmountByTokens(totalSupply);
//       const fee = earned.mul(defaultParams.valueFeePct).div(POINT_BASE);
//       const tokenFee = defaultParams.totalSupply.mul(defaultParams.tokenFeePct).div(POINT_BASE);
//       const [, totalPrivateSold, totalPublicSold] = await defaultInstance.getState()
//       expect((totalPrivateSold.add(totalPublicSold)).gt(totalSupply)).to.be.true;
//       await expect(() => defaultInstance.takeFee()).to.changeEtherBalance(larry, fee)
//       //sub one due to rounding
//       expect(await defaultToken.balanceOf(larry.address)).to.be.equal(tokenFee);
//     });
//   });
//   describe("Claim function", function(){
//     it("Should be revert: Incorrect time - Incoming", async () => {
//       const epoch = await defaultInstance.epoch.call();
//       expect(epoch).to.be.equal(BN.from("0"));

//       await expect(defaultInstance.connect(alice).claim()).to.be.revertedWith(
//         "incorrect time"
//       );
//     });
//     it("Should be revert: Incorrect time - Private", async () => {
//       await deposit({account: alice, amount: parseEther("1")});

//       const epoch = await defaultInstance.epoch.call();
//       expect(epoch).to.be.equal(BN.from("1"));

//       await expect(defaultInstance.connect(alice).claim()).to.be.revertedWith(
//         "incorrect time"
//       );
//     });
//     it("Should be revert: already claims", async () => {
//       async function allPointsClaim(user){
//         for(let i = 0; i < defaultParams.vestingPoints.length; i++){
//           // to point time
//           await time.increaseTo(
//             defaultParams.vestingPoints[i][0].toString()
//           );
//           await defaultInstance.connect(user).claim();
//         }
  
//       }

//       await deposit({account: alice, amount: parseEther("10")});
//       // first claim
//       await allPointsClaim(alice);
//       await expect(defaultInstance.connect(alice).claim()).to.be.revertedWith(
//         "already claims"
//       );
//     });
//     it("Should be revert: Doesn't have a deposit", async () => {
//       const users = [
//         alice,
//         bob,
//         tod
//       ]
//       //To Private End time 
//       await time.increaseTo(
//         defaultParams.privateEnd.add(duration.seconds(5)).toString()
//       );
//       for(let i = 0; i < users.length; i++){
//         await expect(defaultInstance.connect(users[i]).claim()).to.be.revertedWith(
//           "doest have a deposit"
//         );
//       } 
//     });
//     it("Should be revert: incorrect time", async () => {
//       const users = [
//         alice,
//         bob,
//         tod
//       ]
//       await adminContract.setClaimBlock(defaultInstance.address);
//       await time.increaseTo(
//         defaultParams.privateEnd.add(duration.seconds(5)).toString()
//       );
//       for(let i = 0; i < users.length; i++){
//         await expect(defaultInstance.connect(users[i]).claim()).to.be.revertedWith(
//           "incorrect time"
//         );
//       } 
//       await adminContract.removeClaimBlock(defaultInstance.address);
      
//       for(let i = 0; i < users.length; i++){
//         await expect(defaultInstance.connect(users[i]).claim()).to.be.revertedWith(
//           "doest have a deposit"
//         );
//       } 
//     });
//     it("Should be successfully claim", async () => {
//       await deposit({account: alice, amount: parseEther('1'), stakeAmount: Tiers.EVANGELIST_TIER, lockLevel: LockLevel.FIRST});
//       const balanceBefore = await defaultToken.balanceOf(alice.address);
//       let stake;
//       let sum = ZERO;
//       for(let i = 0; i < defaultParams.vestingPoints.length; i++){
//         // to point time
//         await time.increaseTo(
//           defaultParams.vestingPoints[i][0].toString()
//         );
//         const tx = await defaultInstance.connect(alice).claim();
//         if(i==0){
//           stake = await defaultInstance.stakes(alice.address);
//         }
//         const expectValue = stake[1].mul(defaultParams.vestingPoints[i][1]).div(POINT_BASE);
//         await expect(tx)
//         .to.emit(defaultInstance, "Claim")
//         .withArgs(alice.address, shift(expectValue), ZERO);
//         sum = sum.add(shift(expectValue));
//       }
//       const balanceAfter = await defaultToken.balanceOf(alice.address);
//       expect(balanceBefore).to.be.equal(BN.from("0"));
//       expect(balanceAfter).to.be.closeTo(
//         sum,
//         BN.from('5'),
//         ''
//       );
//     });
//     it("Should be successfully claim FIRST BNB", async () => {
//       const totalForSale = await defaultInstance.amountForSale();
//       // 120%
//       await setMaxAllocation(LockLevel.FIRST, TiersEnum.EVANGELIST);
//       await deposit({account: alice, amount: calculateAmountByTokens(calculateAmountByPercent(totalForSale, BN.from("120"))), stakeAmount: Tiers.EVANGELIST_TIER, lockLevel: LockLevel.FIRST});
//       const balanceBefore = await defaultToken.balanceOf(alice.address);
//       let stake;
//       let sum = ZERO;
//       //to private time 
//       await time.increaseTo(
//         defaultParams.privateEnd.add(duration.seconds(3)).toString()
//       );
//       await defaultInstance.connect(alice).claim();
      
//     });
//     it('Accumulate claim: first point', async () => {
//       await setMaxAllocation(LockLevel.FIRST, TiersEnum.EVANGELIST);
//       await deposit({account: alice, amount: parseEther("5"), stakeAmount: Tiers.EVANGELIST_TIER, lockLevel: LockLevel.FIRST});
//       // to first point time
//       await time.increaseTo(
//         defaultParams.vestingPoints[0][0].toString()
//       );
//       const expectValue = calculateTokenAmount(parseEther("5")).mul('100').div(POINT_BASE);
//       await expect(() => defaultInstance.connect(alice).claim())
//         .to.changeTokenBalance(defaultToken, alice, shift(expectValue));

//       const stake = await defaultInstance.stakes(alice.address);
//       expect(stake[0]).to.be.equal(calculateTokenAmount(parseEther("5")));
//       expect(stake[1]).to.be.equal(calculateTokenAmount(parseEther("5")));
//       expect(stake[2]).to.be.equal(expectValue);
//       expect(stake[3]).to.be.false
//       expect(stake[4]).to.be.equal(8);
//     })
//     it('Accumulate claim: second point', async () => {
//       await setMaxAllocation(LockLevel.FIRST, TiersEnum.EVANGELIST);
//       await deposit({account: alice, amount: parseEther("5"), stakeAmount: Tiers.EVANGELIST_TIER, lockLevel: LockLevel.FIRST});
//       // to second point time
//       await time.increaseTo(
//         defaultParams.vestingPoints[1][0].toString()
//       );
//       const expectValue = calculateTokenAmount(parseEther("5")).mul('200').div(POINT_BASE);
//       await expect(() => defaultInstance.connect(alice).claim())
//         .to.changeTokenBalance(defaultToken, alice, shift(expectValue));
//       const stake = await defaultInstance.stakes(alice.address);
//       expect(stake[0]).to.be.equal(calculateTokenAmount(parseEther("5")));
//       expect(stake[1]).to.be.equal(calculateTokenAmount(parseEther("5")));
//       expect(stake[2]).to.be.equal(expectValue);
//       expect(stake[3]).to.be.false
//       expect(stake[4]).to.be.equal(7);
//     })
//     it('Accumulate claim: 6th point', async () => {
//       await setMaxAllocation(LockLevel.FIRST, TiersEnum.EVANGELIST);
//       await deposit({account: alice, amount: parseEther("5"), stakeAmount: Tiers.EVANGELIST_TIER, lockLevel: LockLevel.FIRST});

//       // to 6th point time
//       await time.increaseTo(
//         defaultParams.vestingPoints[5][0].toString()
//       );
//       const expectValue = calculateTokenAmount(parseEther("5")).mul('600').div(POINT_BASE);
//       await expect(() => defaultInstance.connect(alice).claim())
//         .to.changeTokenBalance(defaultToken, alice, shift(expectValue));
//       const stake = await defaultInstance.stakes(alice.address);
//       expect(stake[0]).to.be.equal(calculateTokenAmount(parseEther("5")));
//       expect(stake[1]).to.be.equal(calculateTokenAmount(parseEther("5")));
//       expect(stake[2]).to.be.equal(expectValue);
//       expect(stake[3]).to.be.false
//       expect(stake[4]).to.be.equal(3);
//     })
//     it('Accumulate claim: the last point', async () => {
//       await setMaxAllocation(LockLevel.FIRST, TiersEnum.EVANGELIST);
//       await deposit({account: alice, amount: parseEther("5"), stakeAmount: Tiers.EVANGELIST_TIER, lockLevel: LockLevel.FIRST});
//       // to point time
//       await time.increaseTo(
//         defaultParams.vestingPoints[9][0].toString()
//       );
//       const expectValue = calculateTokenAmount(parseEther("5")).mul('1000').div(POINT_BASE);
//       await expect(() => defaultInstance.connect(alice).claim())
//         .to.changeTokenBalance(defaultToken, alice, shift(expectValue));
//       const stake = await defaultInstance.stakes(alice.address);
//       expect(stake[0]).to.be.equal(calculateTokenAmount(parseEther("5")));
//       expect(stake[1]).to.be.equal(calculateTokenAmount(parseEther("5")));
//       expect(stake[2]).to.be.equal(expectValue);
//       expect(stake[3]).to.be.false
//       expect(stake[4]).to.be.equal(-1);
//     })
//     it('Accumulate claim: after claim points', async () => {
//       await setMaxAllocation(LockLevel.FIRST, TiersEnum.EVANGELIST);
//       await deposit({account: alice, amount: parseEther("5"), stakeAmount: Tiers.EVANGELIST_TIER, lockLevel: LockLevel.FIRST});
//       // to point time
//       await time.increaseTo(
//         defaultParams.vestingPoints[9][0].add(duration.hours(5)).toString()
//       );
//       const expectValue = calculateTokenAmount(parseEther("5")).mul('1000').div(POINT_BASE);
//       await expect(() => defaultInstance.connect(alice).claim())
//         .to.changeTokenBalance(defaultToken, alice, shift(expectValue));
//       const stake = await defaultInstance.stakes(alice.address);
//       expect(stake[0]).to.be.equal(calculateTokenAmount(parseEther("5")));
//       expect(stake[1]).to.be.equal(calculateTokenAmount(parseEther("5")));
//       expect(stake[2]).to.be.equal(expectValue);
//       expect(stake[3]).to.be.false
//       expect(stake[4]).to.be.equal(-1);
//     })
    
//     it("Should be successfully claim when demand exceeds supply ", async () => {
//       const tokenPrice = BN.from("39999999999999999765");
//       const price = setPublicPrice(tokenPrice);
//       // amount for sale is ± 200t
//       await createPool({
//         privateTokenPrice: tokenPrice, 
//         escrowPercentage: BN.from("800"),
//         lockedToken: ZERO
//       }); 
//        // demand is ± 244t
//       const deposits = [
//         {user: alice, amount: parseEther("5"), claim: ZERO},
//         {user: bob, amount: parseEther("5"), claim: ZERO},
//         {user: tod, amount: parseEther("5"), claim: ZERO},
//         {user: pol, amount: parseEther("5"), claim: ZERO},
//       ]
//       await setMaxAllocation(LockLevel.FIRST, TiersEnum.EVANGELIST);
//       for(let i = 0; i < deposits.length; i++){
//         await deposit({account: deposits[i].user, amount: deposits[i].amount, stakeAmount: Tiers.EVANGELIST_TIER, lockLevel: LockLevel.FIRST, increase: i==0});
//       }
//       const state = await defaultInstance.getState.call();
//       const supply = await defaultInstance.amountForSale();

//       for(let j = 0; j < defaultParams.vestingPoints.length; j++){
//         // to point time
//         await time.increaseTo(
//           defaultParams.vestingPoints[j][0].toString()
//         );
//         for(let i = 0; i < deposits.length; i++){
//           const share = calculateWithRate(
//             calculateTokenAmount(deposits[i].amount, price),
//             supply,
//             state[1]
//           );
//           const tx = await defaultInstance.connect(deposits[i].user).claim();
//           const expectValue = share.mul(defaultParams.vestingPoints[j][1]).div(POINT_BASE);
//           const left  = calculateLeftBnB(calculateTokenAmount(deposits[i].amount, price), share, price);
//           deposits[i].claim = deposits[i].claim.add(expectValue);
//           await expect(tx)
//           .to.emit(defaultInstance, "Claim")
//           .withArgs(deposits[i].user.address, shift(expectValue), j==0 ? left : ZERO);
//           // get the change
//           await expect(() => tx)
//           .to.changeEtherBalance(deposits[i].user, j==0 ? left : ZERO)

//         }
//       }
//       //checkBalance
//       for(let i = 0; i < deposits.length; i++){
//         expect(await defaultToken.balanceOf(deposits[i].user.address)).to.be.closeTo(shift(deposits[i].claim), BN.from('10'), '');
//       }
//     });
//     it("Should be successfully claim when investing PRO tier", async () => {
//       const tokenPrice = BN.from("39999999999999999765");
//       const price = setPublicPrice(tokenPrice);
//       // amount for sale is ± 200t
//       await createPool({
//         privateTokenPrice: tokenPrice, 
//         escrowPercentage: BN.from("800"),
//         lockedToken: ZERO,
//         vestingPoints: [
//           [defaultParams.privateEnd.add(duration.hours(1)), BN.from('1000')]
//         ]
//       }); 
//        // demand is ± 244t
//        await setMaxAllocation(LockLevel.FIRST, TiersEnum.EVANGELIST);
//       const deposits = [
//         {user: alice, amount: parseEther("5"), claim: ZERO, stake: Tiers.EVANGELIST_TIER_PRO, lock: LockLevel.THIRD},
//         {user: larry, amount: parseEther("5"), claim: ZERO, stake: Tiers.EVANGELIST_TIER_PRO, lock: LockLevel.THIRD},
//         {user: bob, amount: parseEther("5"), claim: ZERO},
//         {user: tod, amount: parseEther("5"), claim: ZERO},
//         {user: pol, amount: parseEther("5"), claim: ZERO},
//       ]

//       const supply = await defaultInstance.amountForSale();

//       for(let i = 0; i < deposits.length; i++){
//         await deposit({
//           account: deposits[i].user, 
//           amount: deposits[i].amount, 
//           stakeAmount: deposits[i].stake ? deposits[i].stake : Tiers.EVANGELIST_TIER, 
//           lockLevel: deposits[i].lock ? deposits[i].lock : LockLevel.FIRST, 
//           increase: i==0
//         });
//       }
//       const [,totalPrivateSold, totalPublicSold, freePrivateSold] = await defaultInstance.getState.call();
//       const state = await defaultInstance.getState.call();
//       // to first point time
//       await time.increaseTo(
//         defaultParams.vestingPoints[0][0].toString()
//       );
//       const freeTokens = calculateTokenAmount(parseEther('10'), price)
//       for(let i = 0; i < deposits.length; i++){
//         const tx = await defaultInstance.connect(deposits[i].user).claim();
//         let share;
//         let left = ZERO;
//         if(deposits[i].lock == LockLevel.THIRD){
//           share = calculateTokenAmount(deposits[i].amount, price);
//         } else {
//           const amount = calculateTokenAmount(deposits[i].amount, price)
//           const rate = (supply.sub(freeTokens)).mul(PCT_BASE).div(totalPrivateSold.sub(freeTokens));
//           share = amount.mul(rate).div(PCT_BASE)
//           left = left.add(calculateLeftBnB(calculateTokenAmount(deposits[i].amount, price), share, price));
//         }
//         await expect(tx)
//         .to.emit(defaultInstance, "Claim")
//         .withArgs(deposits[i].user.address, shift(share), left);
//       }
//     })
//     it("supply < state.freePrivateSold", async () => {

//     })
//     describe("Vesting logic", function() {
//       let instance;
//       const pct = BN.from("40");
//       const base = BN.from("100");

//       async function create({ claimPct, claimTime }) {
//         const address = await createPool({
//           claimPct: claimPct || pct,
//           claimTime:
//             claimTime || defaultParams.privateEnd.add(duration.hours(5)),
//         });
//         instance = TokenSale.attach(address);
//       }
//       it("Revert with: Incorrect time", async () => {
//         await create({});
//         const now = (await time.latest()).toNumber();
//         const times = [
//           BN.from(now),
//           BN.from(now).add(duration.minutes(10)),
//           BN.from(now).add(duration.hours(1)),
//           BN.from(now).add(duration.hours(2)),
//           BN.from(now).add(duration.hours(3)),
//           defaultParams.privateEnd.sub(duration.seconds(6))
//         ]
//         for(let i = 0; i < times.length; i++){
//           await time.increaseTo(
//             times[i].toString()
//           );
//           await expect(instance.connect(alice).claim()).to.be.revertedWith(
//             "incorrect time"
//           );
//         }
//       });
//       it("Revert with: nothing to claim", async () => {
//         await setMaxAllocation(LockLevel.FIRST, TiersEnum.EVANGELIST);
//         await deposit({account: alice, amount: parseEther("10"), stakeAmount: Tiers.EVANGELIST_TIER, lockLevel: LockLevel.FIRST});

//         const end = defaultParams.privateEnd;
//         const times = [
//           end,
//           end.add(duration.minutes(1)),
//           end.add(duration.minutes(5)),
//           end.add(duration.minutes(10)),
//           end.add(duration.minutes(30)),
//           end.add(duration.minutes(40)),
//           end.add(duration.minutes(59)),
//         ]
//         //const stake = await 
//         //to Private End Time 
//         await time.increaseTo(
//           end.toString()
//         );
//         for(let i = 0; i < times.length; i++){
//           if((await time.latest()).toNumber() < times[i].toNumber()){
//             await time.increaseTo(
//               times[i].toString()
//             );
//           }
//           await expect(defaultInstance.connect(alice).claim()).to.be.revertedWith(
//             "nothing to claim"
//           );
//         }
//       });
//       it("Revert with: nothing to claim", async () => {
//         await setMaxAllocation(LockLevel.FIRST, TiersEnum.EVANGELIST);
//         await deposit({account: alice, amount: parseEther("10"), stakeAmount: Tiers.EVANGELIST_TIER, lockLevel: LockLevel.FIRST});
//         const end = defaultParams.privateEnd;
//         const times = [
//           end,
//           end.add(duration.minutes(1)),
//           end.add(duration.minutes(5)),
//           end.add(duration.minutes(10)),
//           end.add(duration.minutes(30)),
//           end.add(duration.minutes(40)),
//           end.add(duration.minutes(59)),
//         ]
//         //const stake = await 
//         //to Private End Time 
//         await time.increaseTo(
//           end.toString()
//         );
//         for(let i = 0; i < times.length; i++){
//           if((await time.latest()).toNumber() < times[i].toNumber()){
//             await time.increaseTo(
//               times[i].toString()
//             );
//           }
//           await expect(defaultInstance.connect(alice).claim()).to.be.revertedWith(
//             "nothing to claim"
//           );
//         }
//       });
//     });
//     describe("Take Leftovers", function () {
//       it("Should be revert: It is not time yet - incorrect epoch", async () => {
//         // incoming time
//         await expect(defaultInstance.takeLeftovers()).to.be.revertedWith(
//           "It is not time yet"
//         );
//         // private time
//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.minutes(61)).toString()
//         );
//         await deposit({account: alice, amount: parseEther('1'), lockLevel: LockLevel.FIRST, increase: false});
//         await expect(defaultInstance.takeLeftovers()).to.be.revertedWith(
//           "It is not time yet"
//         );
//         // public time
//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.hours(7)).toString()
//         );
//         // to change epoch
//         await deposit({account: alice, amount: parseEther('1'), lockLevel: LockLevel.FIRST, increase: false});
//         await expect(defaultInstance.takeLeftovers()).to.be.revertedWith(
//           "It is not time yet"
//         );
//       });
//       it("Should be revert: Already paid", async () => {
//         // to Finished time
//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.hours(12)).toString()
//         );
//         await defaultInstance.takeLeftovers();
//         await expect(defaultInstance.takeLeftovers()).to.be.revertedWith(
//           "Already paid"
//         );
//       });

//       it("Success sold 30%", async () => {
//         await createPool({publicBuyLimit: BN.from("100000").mul(BN.from("10").pow("18"))})
//         const totalSupply =
//           await defaultInstance.amountForSale();
        
//         //to check takeEscrow correctly
//         await adminContract.setWallet(larry.address);
//         //to Public Time
//         await time.increaseTo(
//           defaultParams.publicStart.add(duration.seconds(1)).toString()
//         );
//         // buy 30%
//         await defaultInstance.connect(alice).deposit({ 
//           value: calculateAmountByTokensPublic(
//           calculateAmountByPercent(totalSupply, BN.from("21"))
//         )});

//         await defaultInstance.connect(bob).deposit({ 
//           value: calculateAmountByTokensPublic(
//           calculateAmountByPercent(totalSupply, BN.from("21"))
//         )});
//         // to Finished time
//         await time.increaseTo(
//           defaultParams.publicEnd.add(duration.seconds(1)).toString()
//         );
//         const blocked = blockedEscrowAmount(
//           multiply(defaultParams.totalSupply),
//           defaultParams.escrowPercentage
//         );
//         const returnEscrow = returnEscrowAmount(
//           blocked,
//           defaultParams.escrowReturnMilestones[0][1]
//         );
//         const [, totalPrivateSold, totalPublicSold] = await defaultInstance.getState()
//         const saleAmount =
//           await defaultInstance.amountForSale();
//         const leftovers = returnEscrow.add(
//           saleAmount.sub(totalPrivateSold.add(totalPublicSold))
//         );
//         const feeEscrow = blocked.sub(returnEscrow);
//         let eared = totalPublicSold.mul(setPublicPrice()).div(PCT_BASE);
//         //because nothing is sold in private time 
//         const fee = ZERO;
//         eared = eared.sub(fee);
//         await expect(() =>
//         expect(defaultInstance.takeLeftovers())
//           .to.emit(defaultInstance, "TransferLeftovers")
//           .withArgs(shift(leftovers), shift(feeEscrow), eared))
//         .to.changeTokenBalances(
//           defaultToken,
//           [larry, owner],
//           [shift(feeEscrow), shift(leftovers)]
//         );
//       });
//       it("Leftovers should be paid correctly: first milestone", async () => {
//         //to check takeEscrow correctly
//         await adminContract.setWallet(larry.address);

//         //in tokens
//         const blocked = blockedEscrowAmount(
//           defaultParams.totalSupply,
//           defaultParams.escrowPercentage
//         );
        
//         const tokenFee = defaultParams.totalSupply.mul(defaultParams.tokenFeePct).div(POINT_BASE);
//         //in tokens
//         const totalForSale = defaultParams.totalSupply
//           .sub(blocked)
//           .sub(tokenFee);
        
//         const _depositWei = calculateAmountByTokens(
//           multiply(calculateAmountByPercent(totalForSale, BN.from("31")))
//         );
//         // sold 30%
//         await setMaxAllocation(LockLevel.FIRST, TiersEnum.EVANGELIST);
//         await deposit({account: alice, amount: _depositWei, stakeAmount: Tiers.EVANGELIST_TIER, lockLevel: LockLevel.FIRST});
//         // to Finished time
//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.hours(12)).toString()
//         );
//         //in tokens
//         const returnEscrow = returnEscrowAmount(
//           blocked,
//           defaultParams.escrowReturnMilestones[0][1]
//         );

//         const saleAmount =
//           await defaultInstance.amountForSale();
        
//         const [, totalPrivateSold, totalPublicSold] = await defaultInstance.getState()
//         const leftovers = multiply(returnEscrow).add(
//           saleAmount.sub(totalPrivateSold.add(totalPublicSold))
//         );
//         const feeEscrow = blocked.sub(returnEscrow);
//         let eared = totalPrivateSold.mul(setPrivatePrice()).div(PCT_BASE);
//         const fee = eared.mul(defaultParams.valueFeePct).div(POINT_BASE);
//         eared = eared.sub(fee);
//         await expect(() =>
//         expect(defaultInstance.takeLeftovers())
//           .to.emit(defaultInstance, "TransferLeftovers")
//           .withArgs(shift(leftovers), feeEscrow, eared))
//         .to.changeTokenBalances(
//           defaultToken,
//           [larry, owner],
//           [feeEscrow, shift(leftovers)]
//         );
//       });
//       it("Leftovers should be paid correctly: nothing is sold out", async () => {
//         const blocked = blockedEscrowAmount(
//           multiply(defaultParams.totalSupply),
//           defaultParams.escrowPercentage
//         );
//         //to check takeEscrow correctly
//         await adminContract.setWallet(larry.address);

//         // to Finished time
//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.hours(12)).toString()
//         );
//         const returnEscrow = BN.from("0");
//         const saleAmount =
//           await defaultInstance.amountForSale();
//         const [, totalPrivateSold, totalPublicSold] = await defaultInstance.getState()
//         const leftovers = returnEscrow.add(
//           saleAmount.sub(totalPrivateSold.add(totalPublicSold))
//         );
//         const feeEscrow = blocked.sub(returnEscrow);
        
//         let eared = BN.from("0");
//         await expect(() =>
//         expect(defaultInstance.takeLeftovers())
//           .to.emit(defaultInstance, "TransferLeftovers")
//           .withArgs(shift(leftovers), shift(feeEscrow), eared))
//         .to.changeTokenBalances(
//           defaultToken,
//           [larry, owner],
//           [shift(feeEscrow), shift(leftovers)]
//         );
//       });
//       it("Leftovers should be paid correctly: second milestone", async () => {
//         await createPool({})
//         //to check takeEscrow correctly
//         await adminContract.setWallet(larry.address);
//         const blocked = blockedEscrowAmount(
//           defaultParams.totalSupply,
//           defaultParams.escrowPercentage
//         );
//         const tokenFee = defaultParams.totalSupply.mul(defaultParams.tokenFeePct).div(POINT_BASE);

//         const totalForSale = defaultParams.totalSupply
//           .sub(blocked)
//           .sub(tokenFee);
        
//         const _depositWei = calculateAmountByTokens(
//           multiply(calculateAmountByPercent(totalForSale, BN.from("61"))));

//         // sold 60%
//         await setMaxAllocation(LockLevel.FIRST, TiersEnum.EVANGELIST);
//         await deposit({account: alice, amount: _depositWei, stakeAmount: Tiers.EVANGELIST_TIER, lockLevel: LockLevel.FIRST});
//         // to Finished time
//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.hours(12)).toString()
//         );
//         const returnEscrow = returnEscrowAmount(
//           blocked,
//           defaultParams.escrowReturnMilestones[1][1]
//         );
//         const saleAmount =
//           await defaultInstance.amountForSale();
//         const [, totalPrivateSold, totalPublicSold] = await defaultInstance.getState()
//         const leftovers = multiply(returnEscrow).add(
//           saleAmount.sub(totalPrivateSold.add(totalPublicSold))
//         );
//         const feeEscrow = blocked.sub(returnEscrow);
//         //const totalPrivateSold = await defaultInstance.totalPrivateSold();
//         let eared = totalPrivateSold.mul(setPrivatePrice()).div(PCT_BASE);
//         const fee = eared.mul(defaultParams.valueFeePct).div(POINT_BASE);
//         eared = eared.sub(fee);
//         await expect(() =>
//         expect(defaultInstance.takeLeftovers())
//           .to.emit(defaultInstance, "TransferLeftovers")
//           .withArgs(shift(leftovers), feeEscrow, eared))
//         .to.changeTokenBalances(
//           defaultToken,
//           [larry, owner],
//           [feeEscrow, shift(leftovers)]
//         );
//       });
//       it("Leftovers should be paid correctly: third milestone", async () => {
//         await createPool({
//           publicBuyLimit: BN.from("99999999").mul(BN.from("10").pow("18"))
//         })
//         //to check takeEscrow correctly
//         await adminContract.setWallet(larry.address);
//         const tokenFee = defaultParams.totalSupply.mul(defaultParams.tokenFeePct).div(POINT_BASE);
//         const blocked = blockedEscrowAmount(
//           defaultParams.totalSupply,
//           defaultParams.escrowPercentage
//         );
//         const totalForSale = defaultParams.totalSupply
//           .sub(blocked)
//           .sub(tokenFee);
//         const _depositAliceWei = calculateAmountByTokens(
//             multiply(calculateAmountByPercent(totalForSale, BN.from("45"))));
//         const _depositAlicePublicWei = calculateAmountByTokensPublic(
//          multiply(calculateAmountByPercent(totalForSale, BN.from("47"))))
//         await setMaxAllocation(LockLevel.FIRST, TiersEnum.EVANGELIST);
//         // sold 90%
//         await deposit({account: alice, amount: _depositAliceWei, stakeAmount: Tiers.EVANGELIST_TIER, lockLevel: LockLevel.FIRST});
//         // To public time
//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.hours(7)).toString()
//         );
//         await deposit({account: alice, amount: _depositAlicePublicWei, stakeAmount: BN.from('1'), lockLevel: LockLevel.FIRST, increase: false});

//         // to Finished time
//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.hours(12)).toString()
//         );
//         const returnEscrow = returnEscrowAmount(
//           blocked,
//           defaultParams.escrowReturnMilestones[2][1]
//         );
//         const saleAmount =
//           await defaultInstance.amountForSale();
        
//         const [, totalPrivateSold, totalPublicSold] = await defaultInstance.getState()
//         const leftovers = multiply(returnEscrow).add(
//           saleAmount.sub(totalPrivateSold.add(totalPublicSold))
//         );
//         const feeEscrow = blocked.sub(returnEscrow);
//         const publicEarned = totalPublicSold.mul(setPublicPrice()).div(PCT_BASE);
//         const privateEarned = totalPrivateSold.mul(setPrivatePrice()).div(PCT_BASE);
//         let earned = publicEarned.add(privateEarned);
//         const fee = _depositAliceWei.mul(defaultParams.valueFeePct).div(POINT_BASE);
//         earned = earned.sub(fee).add(BN.from('1'))
//         // Event
//         await expect(() =>
//         expect(defaultInstance.takeLeftovers())
//           .to.emit(defaultInstance, "TransferLeftovers")
//           .withArgs(shift(leftovers), feeEscrow, earned))
//         .to.changeTokenBalances(
//           defaultToken,
//           [larry, owner],
//           [feeEscrow, shift(leftovers)]
//         );
//       });
//       it("Leftovers should be paid correctly: sold out", async () => {
//         await createPool({
//           publicBuyLimit: BN.from("999999999").mul(BN.from("10").pow("18"))})
//          //to check takeEscrow correctly
//          await adminContract.setWallet(larry.address);

//         const blocked = blockedEscrowAmount(
//           defaultParams.totalSupply,
//           defaultParams.escrowPercentage
//         );
//         const totalForSale = await defaultInstance.amountForSale();
//         // 120%
//         await setMaxAllocation(LockLevel.FIRST, TiersEnum.EVANGELIST);
//         // sold 90%
//         await deposit({account: alice, amount: calculateAmountByTokens(calculateAmountByPercent(totalForSale, BN.from("120"))), stakeAmount: Tiers.EVANGELIST_TIER, lockLevel: LockLevel.FIRST});
//         // to Finished time
//         await time.increaseTo(
//           defaultParams.privateStart.add(duration.hours(12)).toString()
//         );
//         const returnEscrow = returnEscrowAmount(
//           blocked,
//           defaultParams.escrowReturnMilestones[3][1]
//         );
//         const [, totalPrivateSold, totalPublicSold] = await defaultInstance.getState()

//         const totalSold = totalPrivateSold.add(totalPublicSold);
//         const leftovers = returnEscrow;
//         const feeEscrow = blocked.sub(returnEscrow);
//         const privateEarned = calculateAmountByTokens(totalForSale)
//         let eared = privateEarned;
//         const fee = eared.mul(defaultParams.valueFeePct).div(POINT_BASE);
//         eared = eared.sub(fee);
//         expect(totalSold.gt(totalForSale)).to.be.true;
//         await expect(() =>
//         expect(defaultInstance.takeLeftovers())
//           .to.emit(defaultInstance, "TransferLeftovers")
//           .withArgs(leftovers, feeEscrow, eared))
//         .to.changeTokenBalances(
//           defaultToken,
//           [larry, owner],
//           [feeEscrow, leftovers]
//         );
//       });
//     });
//     describe("Take locked tokens and bnb", function () {
//       const unlocksTime = BN.from(2592000);
//       const timesIncrease = [0, 25, 165, 24900, 2591500, 2591990];
//       let snapshotId;
//       beforeEach(async () => {
//         snapshotId = await ethers.provider.send("evm_snapshot");
//       });
//       afterEach(async () => {
//         await ethers.provider.send("evm_revert", [snapshotId]);
//       });

//       timesIncrease.forEach((el) => {
//         it(`Should be revert: It is not time yet time: ${el}`, async () => {
//           await time.increaseTo(
//             defaultParams.publicEnd.add(BN.from(el)).toString()
//           );
//           await expect(defaultInstance.takeLocked()).to.be.revertedWith(
//             "It is not time yet"
//           );
//         });
//       });
//       it("Should be revert: Sender is not an admin", async () => {
//         await time.increaseTo(
//           defaultParams.publicEnd.add(BN.from(unlocksTime)).toString()
//         );
//         await expect(defaultInstance.connect(alice).takeLocked()).to.be.revertedWith(
//           "Sender is not an admin"
//         );
//       });
//       it("Successful withdrawal of blocked tokens", async () => {
//         await time.increaseTo(
//           defaultParams.publicEnd.add(BN.from(unlocksTime)).toString()
//         );
//         await expect(() =>defaultInstance.takeLocked())
//         .to.changeTokenBalance(defaultToken, owner, defaultParams.totalSupply);
//       });
//       it("Successful withdrawal of blocked bnb", async () => {
//         await deposit({account: alice, amount: parseEther("1"), stakeAmount: Tiers.EVANGELIST_TIER, lockLevel: LockLevel.THIRD, increase: true});
//         await time.increaseTo(
//           defaultParams.publicEnd.add(BN.from(unlocksTime)).toString()
//         );
//         await expect(() =>defaultInstance.takeLocked())
//         .to.changeEtherBalance(owner, parseEther("1"));
//       });
//     });
//   });
// });
