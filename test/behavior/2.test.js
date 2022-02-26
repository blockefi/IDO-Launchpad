// /* eslint-disable no-plusplus */
// /* eslint-disable new-cap */
// /* eslint-disable no-undef */
// const {
//     time,
//     expectEvent // time
//   } = require("@openzeppelin/test-helpers");
// const { assert } = require("chai");

  
//   const chai = require("chai");
  
//   const { expect } = chai;
//   const BN = require("ethers").BigNumber;
//   const { parseEther } = require("ethers").utils;
//   chai.use(require("chai-bignumber")());

//   const duration = {
//     seconds(val) {
//       return BN.from(val);
//     },
//     minutes(val) {
//       return BN.from(val).mul(this.seconds("60"));
//     },
//     hours(val) {
//       return new BN.from(val).mul(this.minutes("60"));
//     },
//     days(val) {
//       return new BN.from(val).mul(this.hours("24"));
//     },
//     weeks(val) {
//       return new BN.from(val).mul(this.days("7"));
//     },
//     years(val) {
//       return new BN.from(val).mul(this.days("365"));
//     },
//   };

// describe('Token behavior', async () => {
//     const decimals = BN.from("9");
//     const totalMint = BN.from("2000000").mul(BN.from("10").pow(decimals));
  
//     const EXCHANGE_RATE = BN.from(48887406263);
//     const POINT_BASE = BN.from('1000');
//     const PCT_BASE = BN.from("10").pow("18");
//     const ORACLE_MUL = BN.from("10").pow("10");
//     const ZERO = BN.from('0');
  
//     const STARTER_TIER = BN.from(2e5).mul(BN.from("10").pow("9"));
//     const INVESTOR_TIER = BN.from(6e5).mul(BN.from("10").pow("9"));
//     const STRATEGIST_TIER = BN.from(25e5).mul(BN.from("10").pow("9"));
//     const EVANGELIST_TIER = BN.from(7e6).mul(BN.from("10").pow("9"));
  
//     let provider;
  
//     let Admin;
//     let TokenSale;
//     let Token;
//     let Staking;
//     let Oracle;
  
//     let oracle;
//     let masterContract;
//     let adminContract;
//     let stakingContract;
//     let lpToken;
//     let owner;
//     let alice;
//     let bob;
//     let pol;
//     let tod;
//     let larry;
//     let airdropAccount;
//     let initialAccount;
//     let instance;
//     let defaultToken;
//     let params;
  
//     async function initialization({
//         initial,
//         token,
//         totalSupply,
//         privateStart,
//         privateEnd,
//         publicStart,
//         publicEnd,
//         privateTokenPrice,
//         publicTokenPrice,
//         publicBuyLimit,
//         escrowPercentage,
//         tierLimits,
//         escrowReturnMilestones,
//         thresholdPublicAmount,
//         airdrop,
//         vestingPoints,
//         tokenFeePct,
//         valueFeePct
//     }) {
//         Admin = await ethers.getContractFactory("Admin");
//         TokenSale = await ethers.getContractFactory("TokenSale");
//         Token = await ethers.getContractFactory("LPToken");
//         Staking = await ethers.getContractFactory("Staking");
//         Oracle = await ethers.getContractFactory("ChainLink");
    
//         [owner, alice, bob, pol, tod, larry, jimmy] = await ethers.getSigners();
//         provider = ethers.provider;
//         airdropAccount = larry;
//         initialAccount = jimmy;
    
//         masterContract = await TokenSale.deploy();
//         await masterContract.deployed();
    
//         oracle = await Oracle.deploy();
//         await oracle.deployed();
    
//         lpToken = await Token.deploy("LPToken", "lp");
//         await lpToken.deployed();
    
//         adminContract = await Admin.deploy();
//         await adminContract.deployed();
    
//         stakingContract = await Staking.deploy(
//           lpToken.address,
//           adminContract.address
//         );
//         await adminContract.addOperator(owner.address);
//         await adminContract.setMasterContract(masterContract.address);
//         await adminContract.setOracleContract(oracle.address);
//         await adminContract.setStakingContract(stakingContract.address);
//         await adminContract.setAirdrop(airdropAccount.address);
        
        
//         const now = (await time.latest()).toNumber();
//         const end = BN.from(now).add(duration.hours(5))
//         params = {
//           initial: initial || initialAccount.address,
//           totalSupply: totalSupply || totalMint,
//           privateStart: privateStart || BN.from(now).add(duration.hours(1)),
//           privateEnd: privateEnd || end,
//           publicStart: publicStart|| BN.from(now).add(duration.hours(6)),
//           publicEnd: publicEnd || BN.from(now).add(duration.hours(11)),
//           privateTokenPrice: privateTokenPrice || BN.from("240297408185753"),
//           publicTokenPrice: publicTokenPrice || BN.from("360446112278630"),
//           publicBuyLimit: publicBuyLimit || BN.from("25000").mul(BN.from("10").pow("18")),
//           escrowPercentage: escrowPercentage || BN.from("0"),
//           tierLimits: tierLimits || [
//             BN.from("200").mul(BN.from("10").pow("18")),
//             BN.from("500").mul(BN.from("10").pow("18")),
//             BN.from("1000").mul(BN.from("10").pow("18")),
//             BN.from("25000").mul(BN.from("10").pow("18")),
//           ],
//           escrowReturnMilestones: escrowReturnMilestones || [
//             [BN.from('950'), BN.from('0')],
//             [BN.from('900'), BN.from('900')],
//             [BN.from('600'), BN.from('600')],
//             [BN.from('300'), BN.from('300')],
//           ],
//           thresholdPublicAmount: thresholdPublicAmount || totalMint.mul(BN.from('5')).div(BN.from('100')),
//           airdrop: airdrop || totalMint.div("100"),
//           vestingPoints: vestingPoints || 
//             [
//                 [end.add(duration.hours(10)), BN.from('1000')],
        
//             ],
//             tokenFeePct: tokenFeePct || BN.from('0'),
//             valueFeePct: valueFeePct || BN.from('800'),
//         };
//         defaultToken = await Token.deploy("DefaultToken", "def");
//         await defaultToken.deployed();
//         await defaultToken.changeDecimals(decimals);
//         await defaultToken.mint(initialAccount.address, totalMint);
//         await defaultToken.connect(initialAccount).approve(adminContract.address, totalMint);
//         params.token = defaultToken.address;
        
//         const tx = await adminContract.createPool(params);
//         const receipt = await tx.wait();
//         const event = receipt.events.filter((x) => x.event === "CreateTokenSale");
//         instance = TokenSale.attach(event[0].args.instanceAddress);
//     }
//     beforeEach(async () => {
//         await initialization({});
//     })
//     async function stake(account, amount) {
//         await lpToken.mint(account.address, amount);
//         await lpToken.connect(account).approve(stakingContract.address, amount);
//         await stakingContract.connect(account).stake(amount);
//     }
    
//     async function deposit(
//         {
//         account,
//         amount,
//         stakeAmount,
//         increase = false,
//         }
//     ) {
//         await stake(account, stakeAmount || STARTER_TIER);
//         if (increase) {
//             await time.increaseTo(
//             params.privateStart.add(duration.minutes(61)).toString()
//             );
//         }
//         await instance.connect(account).deposit({ value: amount });
//     }
//     function calculateWithRate(want, totalSupply, totalPrivateSold) {
//         const rate = totalSupply.mul(PCT_BASE).div(totalPrivateSold);
//         return want.mul(rate).div(PCT_BASE);
//       }
//     function calculateLeftBnB(total, claim, price) {
//         return total.sub(claim).mul(price || params.privateTokenPrice).div(PCT_BASE);
//       }
//     function tierByAmount(amount) {
//         const MaxTiers = {
//             EVANGELIST_TIER: params?.tierLimits[3],
//             STRATEGIST_TIER: params?.tierLimits[2],
//             INVESTOR_TIER: params?.tierLimits[1],
//             STARTER_TIER: params?.tierLimits[0]
//         }
//         if (amount.gte(EVANGELIST_TIER)) {
//           return MaxTiers.EVANGELIST_TIER;
//         }
//         if (amount.gte(STRATEGIST_TIER)) {
//           return MaxTiers.STRATEGIST_TIER;
//         }
//         if (amount.gte(INVESTOR_TIER)) {
//           return MaxTiers.INVESTOR_TIER;
//         }
//         if (amount.gte(STARTER_TIER)) {
//           return MaxTiers.STARTER_TIER;
//         }
//       }
//     function numberOfTier(amount) {
//         if (amount.gte(EVANGELIST_TIER)) {
//             return BN.from('4');
//         }
//         if (amount.gte(STRATEGIST_TIER)) {
//             return BN.from('3');
//         }
//         if (amount.gte(INVESTOR_TIER)) {
//             return BN.from('2');
//         }
//         if (amount.gte(STARTER_TIER)) {
//             return BN.from('1')
//         } else {
//             return BN.from('0')
//         }
//     }
//     function maxByTier(tier) {
//         const tierOfUser = tierByAmount(tier)
//         if(tierOfUser){
//             return tierOfUser.mul(PCT_BASE).div(EXCHANGE_RATE.mul(ORACLE_MUL));
//         }
//     }
//     function shift(amount) {
//         if (decimals.toNumber() !== 18) {
//           return decimals.toNumber() < 18
//             ? amount.div(BN.from("10").pow(BN.from("18").sub(decimals)))
//             : amount.mul(BN.from("10").pow(decimals.sub(BN.from("18"))));
//         }
//         return amount;
//     }   
//     function multiply(amount) {
//         if (decimals.toNumber() !== 18) {
//           return decimals.toNumber() < 18
//             ? amount.mul(BN.from("10").pow(BN.from("18").sub(decimals)))
//             : amount.div(BN.from("10").pow(decimals.sub(BN.from("18"))));
//         }
//         return amount;
//       } 
//     function calculateTokenAmount(amount) {
//         return amount.mul(PCT_BASE).div(params.privateTokenPrice);
//     }
//     function overcameThreshold(saleAmount, totalPrivate){
//         if(saleAmount > totalPrivate){
//             return (saleAmount - totalPrivate) >= params.thresholdPublicAmount;
//         }else{
//             return false
//         }
//     }
//     function calculateAmountByTokens(tokens) {
//         return tokens.mul(params.privateTokenPrice).div(PCT_BASE);
//     }
//     function calculateLeftValue(total, claim) {
//         return total.eq(claim) ? BN.from('0') : (total.sub(claim).mul(params.privateTokenPrice).div(PCT_BASE));
//     }
//     function returnEscrowAmount(blocked, returnAmount) {
//         return returnAmount.toString() === "0"
//           ? blocked
//           : blocked.mul(returnAmount).div(BN.from(PCT_BASE));
//     }
//     function publicAmount(amount, left){
//         const maxValue = params.publicBuyLimit.mul(PCT_BASE).div(EXCHANGE_RATE.mul(ORACLE_MUL));
//         const maxToken = maxValue.mul(PCT_BASE).div(params.publicTokenPrice);
//         const amountToken = amount.mul(PCT_BASE).div(params.publicTokenPrice);
//         if(amountToken.gte(maxToken)){
//             return maxToken.gte(left) ? left : maxToken;
//         } else {
//             return amountToken.gte(left) ? left : amountToken
//         }
//     }
//     function escrow(blocked, saleTokenAmount, totalSold){
//         for(let i = 0; i < params.escrowReturnMilestones.length; i++){
//             const must = saleTokenAmount.mul(params.escrowReturnMilestones[i][0]).div(BN.from(PCT_BASE))
//             if(totalSold.gte(must)){
//                 if(params.escrowReturnMilestones[i][1].gt(BN.from('0'))){
//                     return blocked.mul(params.escrowReturnMilestones[i][1]).div(PCT_BASE);
//                 }else{
//                     return blocked;
//                 }
                
//             }
//             break;
//         }
//     }
//     it(`Deposits`, async () => {
//         const deposits = [
//             {user: alice, stakeAmount: STARTER_TIER, amount: maxByTier(STARTER_TIER), claim: ZERO},
//             {user: bob, stakeAmount: INVESTOR_TIER, amount: maxByTier(INVESTOR_TIER), claim: ZERO},
//             {user: tod, stakeAmount: STRATEGIST_TIER, amount: maxByTier(STRATEGIST_TIER), claim: ZERO},
//             {user: larry, stakeAmount: EVANGELIST_TIER, amount: maxByTier(EVANGELIST_TIER), claim: ZERO},
//             {user: pol, stakeAmount: EVANGELIST_TIER, amount: parseEther('100'), claim: ZERO}
//         ]
//         //deposits
//        for(let i = 0; i < deposits.length; i++){
//         await deposit({account: deposits[i].user, increase: i==0, stakeAmount: deposits[i].stakeAmount, amount: deposits[i].amount});
//         const stakeUser = await instance.stakes(deposits[i].user.address);

//         const expectValue = [
//             numberOfTier(deposits[i].stakeAmount).toNumber(),
//             calculateTokenAmount(maxByTier(deposits[i].stakeAmount)),
//             ZERO,
//             ZERO,
//             (BN.from(params.vestingPoints.length).sub(BN.from('1'))).toNumber()
//         ]
//         expect(expectValue).to.deep.equal(stakeUser);
//        }
       
//        //check totalSupply
//        let demand = ZERO;
//        deposits.forEach(({stakeAmount}) => {
//         demand = demand.add(calculateTokenAmount(maxByTier(stakeAmount)))
//        })
//        expect(demand).to.be.equal(await instance.totalPrivateSold())
//        //Claim
//         const totalPrivateSold = await instance.totalPrivateSold.call();
//         const supply = await instance.saleTokensAmountWithoutAirdrop();
//         for(let j = 0; j < params.vestingPoints.length; j++){
//             // to point time
//             await time.increaseTo(
//                 params.vestingPoints[j][0].toString()
//             );
//             for(let i = 0; i < deposits.length; i++){
//                 let share;
//                 const stakeUser = await instance.stakes(deposits[i].user.address);
//                 if(totalPrivateSold.gte(supply)){
//                     const rate = (supply.mul(PCT_BASE).div(totalPrivateSold))
//                     share = stakeUser[1].mul(rate).div(PCT_BASE);
//                 }else{
//                     share = stakeUser[1];
//                 }
//               const tx = await instance.connect(deposits[i].user).claim();
//               const expectValue = share.mul(params.vestingPoints[j][1]).div(POINT_BASE);
//               const change = calculateLeftValue(stakeUser[1], share);
//               deposits[i].claim = deposits[i].claim.add(expectValue);
//               //EVENT 
//               await expect(tx)
//               .to.emit(instance, "Claim")
//               .withArgs(deposits[i].user.address, shift(expectValue), j==0 ? change : ZERO);
//               // get the change
//               await expect(() => tx)
//               .to.changeEtherBalance(deposits[i].user, j==0 ? change : ZERO)
//             }
//         }
//         //check balances after payments
//         for(let i = 0; i < deposits.length; i++){
//             expect(await defaultToken.balanceOf(deposits[i].user.address)).to.be.closeTo(shift(deposits[i].claim), BN.from('10'), '');
//         }
//         console.log('Claim is passed')
//         //takeFee 
//         const earnedLa = calculateAmountByTokens(supply);
//         const valueFee = earnedLa.mul(params.valueFeePct).div(POINT_BASE);
//         const tokenFee = params.totalSupply.mul(params.tokenFeePct).div(POINT_BASE);
//         await instance.takeFee();
//         // await expect(() => instance.takeFee()).to.changeEtherBalance(owner, valueFee)
//         // expect(await defaultToken.balanceOf(owner.address)).to.be.equal(tokenFee);
//         console.log('Feee is passed')

//         //airdrop
//         await expect(() =>
//         expect(instance.takeAirdrop())
//           .to.emit(instance, "TransferAirdrop")
//           .withArgs(params.airdrop))
//         .to.changeTokenBalance(
//           defaultToken,
//           airdropAccount,
//           params.airdrop
//         );
//         console.log('AirDrop is passed')
//         // take Leftovers
//         const totalSold = await instance.totalTokenSold();
//         const blocked = multiply(params.totalSupply.mul(params.escrowPercentage).div(POINT_BASE));
//         let returnToken = escrow(blocked, supply, totalSold);
//         const feeEscrow = blocked.sub(returnToken);
//         let earned;
//         if(supply.gt(totalSold)){
//             returnToken = returnToken.add(supply.sub(totalSold));
//             earned = calculateAmountByTokens(totalSold);
//         }else{
//             earned = calculateAmountByTokens(supply)
//         }
//         const fee = earned.mul(params.valueFeePct).div(POINT_BASE);
//         earned = earned.sub(fee);
//         const walletBefore = await defaultToken.balanceOf(owner.address);
//         const initialBefore = await defaultToken.balanceOf(initialAccount.address);
//         const balanceInitialBefore = await provider.getBalance(initialAccount.address);
//         await expect(await instance.takeLeftovers())
//         .to.emit(instance, 'TransferLeftovers')
//         .withArgs(shift(returnToken), shift(feeEscrow), earned);
//         const expectWallet = walletBefore.add(shift(feeEscrow))
//         const expectInitial = initialBefore.add(shift(returnToken));
//         const expectBalanceInitial = balanceInitialBefore.add(earned);
//         expect(await defaultToken.balanceOf(owner.address)).to.be.equal(expectWallet);
//         expect(await defaultToken.balanceOf(initialAccount.address)).to.be.equal(expectInitial);
//         expect(await provider.getBalance(initialAccount.address)).to.be.closeTo(expectBalanceInitial, BN.from('10'), '');
        
//         console.log('Leftovers is passed')

//         //take Locked
//         const tokenContract = await defaultToken.balanceOf(instance.address);
//         const balanceContract = await provider.getBalance(instance.address);
//         if(tokenContract.gte(BN.from('0')) || balanceContract.gte(BN.from('0'))){
//             //to Locked time
//             await time.increaseTo(params.publicEnd.add(BN.from(2592e3)).toString());
//             await instance.takeLocked();
//             expect(await provider.getBalance(instance.address)).to.be.equal(BN.from('0'));
//             expect(await defaultToken.balanceOf(instance.address)).to.be.equal(BN.from('0'));
//         }
//     });
//     it('Deposit public', async () => {
//         const depositsPrivate = [
//             {user: alice, stakeAmount: STRATEGIST_TIER, amount: maxByTier(STRATEGIST_TIER), claim: ZERO},
//             {user: bob, stakeAmount: STRATEGIST_TIER, amount: maxByTier(STRATEGIST_TIER), claim: ZERO},
//             {user: tod, stakeAmount: STRATEGIST_TIER, amount: maxByTier(STRATEGIST_TIER), claim: ZERO},
//             {user: pol, stakeAmount: STRATEGIST_TIER, amount: maxByTier(STRATEGIST_TIER), claim: ZERO}
//         ]
//         const depositsPublic = [
//             {user: alice, amount: parseEther('5'), claim: ZERO},
//             {user: bob, amount: parseEther('7'), claim: ZERO},
//             {user: tod, amount: parseEther('3'), claim: ZERO},
//             {user: pol, amount: parseEther('200'), claim: ZERO}
//         ]
//         // Private deposits
//        for(let i = 0; i < depositsPrivate.length; i++){
//         await deposit({account: depositsPrivate[i].user, increase: i==0, stakeAmount: depositsPrivate[i].stakeAmount, amount: depositsPrivate[i].amount});
//         const stakeUser = await instance.stakes(depositsPrivate[i].user.address);

//         const expectValue = [
//             numberOfTier(depositsPrivate[i].stakeAmount).toNumber(),
//             calculateTokenAmount(maxByTier(depositsPrivate[i].stakeAmount)),
//             ZERO,
//             ZERO,
//             (BN.from(params.vestingPoints.length).sub(BN.from('1'))).toNumber()
//         ]
//         expect(expectValue).to.deep.equal(stakeUser);
//        }

//         //check totalSupply
//         let demand = ZERO;
//         depositsPrivate.forEach(({stakeAmount}) => {
//          demand = demand.add(calculateTokenAmount(maxByTier(stakeAmount)))
//         })
//         expect(demand).to.be.equal(await instance.totalPrivateSold())
//         const totalPrivateSold = await instance.totalPrivateSold.call();
//         const supply = await instance.saleTokensAmountWithoutAirdrop()

//         console.log('Claim is passed');

//        if((await time.latest()).toNumber() < params.publicStart.toNumber()){
//              //To public round
//             await time.increaseTo(params.publicStart.add(duration.seconds('1')).toString());
//        }

//        let factPublicSold = BN.from('0');
//        // Public round
//        const isOvercame = overcameThreshold(supply, totalPrivateSold);
//        if(isOvercame){
//         for(let i = 0; i < depositsPublic.length; i++){
//             const totalTokenSold = await instance.totalTokenSold();
//             const leftTokens = supply.sub(totalTokenSold);
//             const tx = await instance.connect(depositsPublic[i].user).deposit({ value: depositsPublic[i].amount });
//             const want = depositsPublic[i].amount.mul(PCT_BASE).div(params.publicTokenPrice);
//             const expectPublicAmount = publicAmount(depositsPublic[i].amount, leftTokens);
//             factPublicSold = factPublicSold.add(expectPublicAmount);
//             let change;
//             if(want > expectPublicAmount){
//                 change = expectPublicAmount.mul(params.publicTokenPrice).div(PCT_BASE)
//             }else {
//                 change = depositsPublic[i].amount
//             }
//             depositsPublic[i].claim = depositsPublic[i].claim.add(expectPublicAmount);
//             await expect(tx)
//             .to.emit(instance, 'DepositPublic')
//             .withArgs(depositsPublic[i].user.address, shift(expectPublicAmount));
//             await expect(() => tx)
//             .to.changeEtherBalance(depositsPublic[i].user, BN.from(`-${change.toString()}`))
//         }
//        }
//     const mustSum = factPublicSold.add(totalPrivateSold);
//     expect(mustSum).to.be.equal(await instance.totalTokenSold());

//     //Claim ф
//     //clam All at once
//     const lastPoint = BN.from(params.vestingPoints.length - 1);
//     if((await time.latest()).toNumber() < params.vestingPoints[lastPoint.toNumber()][0].toNumber()){
//         await time.increaseTo(
//             params.vestingPoints[lastPoint.toNumber()][0].toString()
//         );
//     }
//     for(let i = 0; i < depositsPrivate.length; i++){
//         let share;
//         const stakeUser = await instance.stakes(depositsPrivate[i].user.address);
//         if(totalPrivateSold.gte(supply)){
//             const rate = (supply.mul(PCT_BASE).div(totalPrivateSold))
//             share = stakeUser[1].mul(rate).div(PCT_BASE);
//         }else{
//             share = stakeUser[1];
//         }
//         const tx = await instance.connect(depositsPrivate[i].user).claim();
//         //100%
//         const expectValue = share.mul(POINT_BASE).div(POINT_BASE);
//         const change = calculateLeftValue(stakeUser[1], share);
//         depositsPrivate[i].claim = depositsPrivate[i].claim.add(expectValue);
//         //EVENT 
//         await expect(tx)
//         .to.emit(instance, "Claim")
//         .withArgs(depositsPrivate[i].user.address, shift(expectValue), change);
//         // get the change
//         await expect(() => tx)
//         .to.changeEtherBalance(depositsPrivate[i].user, change)
//     }
//     //check balances after payments
//     for(let i = 0; i < depositsPrivate.length; i++){
//         const expectValue = depositsPrivate[i].claim.add(depositsPublic[i].claim);
//         expect(await defaultToken.balanceOf(depositsPrivate[i].user.address)).to.be.closeTo(shift(expectValue), BN.from('10'), '');
//     }

//     //To Finished epoch
//     if((await time.latest()).toNumber() < params.publicEnd.toNumber()){
//         await time.increaseTo(params.publicEnd.add(duration.seconds('1')).toString());
//     }

//     //airdrop
//     await expect(() =>
//     expect(instance.takeAirdrop())
//       .to.emit(instance, "TransferAirdrop")
//       .withArgs(params.airdrop))
//     .to.changeTokenBalance(
//       defaultToken,
//       airdropAccount,
//       params.airdrop
//     );
//     console.log('AirDrop is passed')
//     //const earned = (factSold.mul(params.privateTokenPrice).add(factPublicSold.mul(params.publicTokenPrice))).div(PCT_BASE)

//     // take Leftovers
//     const totalSold = await instance.totalTokenSold();
//     const totalPublicSold = await instance.totalPublicSold();

//     const blocked = multiply(params.totalSupply.mul(params.escrowPercentage).div(POINT_BASE));
//     let returnToken = escrow(blocked, supply, totalSold);
//     const feeEscrow = blocked.sub(returnToken);
//     if(supply.gt(totalSold)){
//         console.log('true');
//         returnToken = returnToken.add(supply.sub(totalSold));
//     }
//     let earnedPrivate = (totalSold.sub(totalPublicSold)).mul(params.privateTokenPrice).div(PCT_BASE)
//     let earned = ((totalSold.sub(totalPublicSold)).mul(params.privateTokenPrice).add(totalPublicSold.mul(params.publicTokenPrice))).div(PCT_BASE)
//     const fee = earnedPrivate.mul(params.valueFeePct).div(POINT_BASE);
//     earned = earned.sub(fee);
//     const walletBefore = await defaultToken.balanceOf(owner.address);
//     const initialBefore = await defaultToken.balanceOf(initialAccount.address);
//     const balanceInitialBefore = await provider.getBalance(initialAccount.address);
//     await expect(await instance.takeLeftovers())
//     .to.emit(instance, 'TransferLeftovers')
//     .withArgs(shift(returnToken), shift(feeEscrow), earned);
//     const expectWallet = walletBefore.add(shift(feeEscrow))
//     const expectInitial = initialBefore.add(shift(returnToken));
//     const expectBalanceInitial = balanceInitialBefore.add(earned);
//     expect(await defaultToken.balanceOf(owner.address)).to.be.equal(expectWallet);
//     expect(await defaultToken.balanceOf(initialAccount.address)).to.be.equal(expectInitial);
//     expect(await provider.getBalance(initialAccount.address)).to.be.closeTo(expectBalanceInitial, BN.from('10'), '')

//     //take Locked
//     const tokenContract = await defaultToken.balanceOf(instance.address);
//     const balanceContract = await provider.getBalance(instance.address);
//     if(tokenContract.gt(BN.from('0')) || balanceContract.gt(BN.from('0'))){
//         //to Locked time
//         await time.increaseTo(params.publicEnd.add(BN.from(2592e3)).toString());
//         await instance.takeLocked();
//         expect(await provider.getBalance(instance.address)).to.be.equal(BN.from('0'));
//         expect(await defaultToken.balanceOf(instance.address)).to.be.equal(BN.from('0'));
//     }
//     })
// })