// /* eslint-disable no-plusplus */
// /* eslint-disable new-cap */
// /* eslint-disable no-undef */
// const {
//     time, // time
//   } = require("@openzeppelin/test-helpers");
  
//   const chai = require("chai");

//   //const { BN } = require('@openzeppelin/test-helpers');
  
//   const { expect } = chai;

//   const BN = require("ethers").BigNumber;
//   const {Wallet} = require("ethers");
//   const { MerkleTree } = require('merkletreejs');
//   const keccak256 = require('keccak256');

  
//   const { parseEther, namehash, solidityKeccak256 } = require("ethers").utils;
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

//   describe('Airdrop contract', () => {
//     const totalMint = BN.from("1000").mul(BN.from("10").pow(BN.from('18')));

//     const Tiers = Object.freeze({
//       STARTER_TIER: BN.from(2e5).mul(BN.from("10").pow("9")),
//       INVESTOR_TIER:  BN.from(6e5).mul(BN.from("10").pow("9")),
//       STRATEGIST_TIER: BN.from(25e5).mul(BN.from("10").pow("9")),
//       EVANGELIST_TIER: BN.from(7e6).mul(BN.from("10").pow("9")),
//       EVANGELIST_TIER_PRO: BN.from(3e7).mul(BN.from("10").pow("9")),
//     });

//     const LockLevel = Object.freeze({
//       NONE: 0,
//       FIRST: 1,
//       SECOND: 2,
//       THIRD: 3,
//     });

//     let Admin, TokenSale, Staking, LPToken, Airdrops;
//     let provider;
//     let airdrop;
//     let admin;
//     let master;
//     let instance;
//     let lpToken;
//     let instanceToken;
//     let staking;
//     let oracle;

//     let owner;
//     let alice;
//     let bob;
//     let pol;
//     let tod;
//     let larry;

//     let params;
//     let snapshotId;

//     const { deploy } = deployments;
//     provider = ethers.provider;

//     async function createPool(defParams) {
//         instanceToken = await LPToken.deploy("Token", "tkn");
//         await instanceToken.deployed();
//         await instanceToken.mint(owner.address, totalMint);
//         await instanceToken.approve(admin.address, totalMint);
//         defParams.token = instanceToken.address;
    
//         const tx = await admin.createPool(defParams);
//         const receipt = await tx.wait();
//         const event = receipt.events.filter((x) => x.event === "CreateTokenSale");
//         instance = TokenSale.attach(event[0].args.instanceAddress);
//         return event[0].args.instanceAddress;
//       }
    
//     before(async () => {

//       [owner, alice, bob, pol, tod, larry] = await ethers.getSigners();

//       Admin = await ethers.getContractFactory("Admin");
//       TokenSale = await ethers.getContractFactory("TokenSale");
//       LPToken = await ethers.getContractFactory("LPToken");
//       Staking = await ethers.getContractFactory("Staking");
//       Oracle = await ethers.getContractFactory("ChainLink");
//       Airdrops = await ethers.getContractFactory("Airdrops");

//       admin = await Admin.deploy();
//       await admin.deployed();

//       master = await TokenSale.deploy();
//       await master.deployed();

//       lpToken = await LPToken.deploy("LPToken", "lptkn");
//       await lpToken.deployed();

//       staking = await Staking.deploy(
//         lpToken.address,
//         admin.address
//       );

//       await staking.deployed();

//       airdrop = await Airdrops.deploy(staking.address, admin.address, lpToken.address);
//       await airdrop.deployed();

//       await admin.addOperator(owner.address);
//       await admin.setMasterContract(master.address);
//       await admin.setStakingContract(staking.address);
//       await admin.setAirdrop(airdrop.address);
//       await lpToken.changeDecimals('9');

//         const now = (await time.latest()).toNumber();
//         const end = BN.from(now).add(duration.hours(5));
//           params = {
//             initial: owner.address,
//             totalSupply: totalMint,
//             privateStart: BN.from(now).add(duration.hours(1)),
//             privateEnd: end,
//             publicStart: BN.from(now).add(duration.hours(6)),
//             publicEnd: BN.from(now).add(duration.hours(11)),
//             privateTokenPrice: BN.from("399999999999999999612"),
//             publicTokenPrice: BN.from("499999999999999999760"),
//             publicBuyLimit: BN.from("1000").mul(BN.from("10").pow("18")),
//             escrowPercentage: BN.from("600"),
//             escrowReturnMilestones: [
//               [BN.from('300'), BN.from('300')],
//               [BN.from('600'), BN.from('600')],
//               [BN.from('900'), BN.from('900')],
//               [BN.from('950'), BN.from('0')],
//             ],
//             thresholdPublicAmount: BN.from("1"),
//             vestingPoints: [
//               [end.add(duration.hours(1)), BN.from('100')],
//               [end.add(duration.hours(2)), BN.from('100')],
//               [end.add(duration.hours(3)), BN.from('100')],
//               [end.add(duration.hours(4)), BN.from('100')],
//               [end.add(duration.hours(5)), BN.from('100')],
//               [end.add(duration.hours(6)), BN.from('100')],
//               [end.add(duration.hours(7)), BN.from('100')],
//               [end.add(duration.hours(8)), BN.from('100')],
//               [end.add(duration.hours(9)), BN.from('100')],
//               [end.add(duration.hours(10)), BN.from('100')],
//             ],
//             tokenFeePct: BN.from('10'),
//             valueFeePct: BN.from('30'),
//           };
//           await createPool(params);


//     })
//     beforeEach(async () => {
//       snapshotId = await ethers.provider.send("evm_snapshot");
//     });
//     afterEach(async () => {
//       await ethers.provider.send("evm_revert", [snapshotId]);
//     });

//     async function makeDrop (wallets, tokenAmounts, lpAmounts, valueAmounts) {
//         const hashedElements = wallets.map((w, i) => solidityKeccak256(['address', 'uint256', 'uint256', 'uint256'], [w.address, tokenAmounts[i], lpAmounts[i], valueAmounts[i]]))
//         const tree = new MerkleTree(hashedElements, keccak256, { hashLeaves: false, sort: true });
//         const root = tree.getHexRoot();
//         const leaves = tree.getHexLeaves();
//         const proofs = leaves.map(tree.getHexProof, tree);

//         return { hashedElements, leaves, root, proofs, tree };
//     }

//     async function stake(account, amount, level = LockLevel.NONE) {
//       await lpToken.mint(account.address, amount);
//       await lpToken.connect(account).approve(staking.address, amount);
//       await staking.connect(account).stake(level, amount);
//     }

//     async function mintToken(amount, account = owner){
//       await instanceToken.mint(account.address, amount);
//     }
//     async function mintLptoken(amount, account = owner){
//       await lpToken.mint(account.address, amount);
//     }
    
//     function amountsByShare(userAmounts, totalAmount, airdrop){
//         let shares = [];
//         userAmounts.map((amount) => {
//             const rate = (amount / totalAmount) * 100;
//             //BN.from(amount).mul(BN.from(totalAmount).div(BN.from(100)));
//             console.log(rate, 'rate');
//             shares.push(BN.from(airdrop).mul(BN.from(rate)).div('100')) 
//         })
//         return shares;
//     }

//     describe('Deposit assets', () => {
//       it('Should be reverted with: pool does not exist yet', async () => {
//         const mock = [alice, bob, tod, larry];
//         mock.forEach(async (i) => {
//           await expect(
//             airdrop.depositAssets(i.address, parseEther('1'), parseEther('1'), {value: parseEther('1')})
//           ).to.be.revertedWith("pool does not exist yet");
//         })
//       });
//       it('Should be depositAssets made successfully', async () => {
//         const valueAmount = parseEther('1');
//         const tokenAmount = parseEther('2');
//         const lpAmount = parseEther('3');
//         await mintToken(tokenAmount);
//         await mintLptoken(lpAmount);
//         await instanceToken.approve(airdrop.address, tokenAmount);
//         await lpToken.approve(airdrop.address, lpAmount);
//         await airdrop.depositAssets(instance.address, tokenAmount, lpAmount, {value: valueAmount});
//         const [, token, lp, value] = await airdrop.saleStates(instance.address);
//         expect(token).to.be.equal(tokenAmount);
//         expect(lp).to.be.equal(lpAmount);
//         expect(value).to.be.equal(valueAmount);
//         expect(await instanceToken.balanceOf(airdrop.address)).to.be.equal(tokenAmount);
//         expect(await lpToken.balanceOf(airdrop.address)).to.be.equal(lpAmount);
//         expect(await provider.getBalance(airdrop.address)).to.be.equal(valueAmount);
//       })
//     })
//     describe('Root Setting', () => {
//       it('Should be reverted with: sender is not an operator', async () => {
//         const mock = [alice, bob, tod, larry];
//         const root = namehash('hello');
//         mock.forEach(async (i) => {
//           await expect(
//             airdrop.connect(i).setRoot(instance.address, root)
//           ).to.be.revertedWith("sender is not an operator");
//         })
//       })
//       it('Should be reverted with: pool does not exist yet', async () => {
//         const mock = [alice, bob, tod, larry];
//         const root = namehash('hello');
//         mock.forEach(async (i) => {
//           await expect(
//             airdrop.setRoot(i.address, root)
//           ).to.be.revertedWith("pool does not exist yet");
//         })
//       })
//       it('Should be reverted with: root is already set', async () => {
//         const root = namehash('hello');
//         await airdrop.setRoot(instance.address, root)
//         await expect(
//           airdrop.setRoot(instance.address, root)
//         ).to.be.revertedWith("root is already set");
//       })
//       it('Should be setRoot made successfully', async () => {
//         const root = namehash('hello');
//         await airdrop.setRoot(instance.address, root)
//         const [rootFromContract] = await airdrop.saleStates(instance.address);
//         expect(rootFromContract).to.be.equal(root)
//       })
//     })
//     describe('Application', () => {
//       it('Should be reverted with: pool does not exist yet', async () => {
//         const mock = [alice, bob, tod, larry];
//         mock.forEach(async (i) => {
//           await expect(
//             airdrop.application(i.address)
//           ).to.be.revertedWith("pool does not exist yet");
//         })
//       })
//       it('Should be reverted with: root is already set"', async () => {
//         await stake(owner, Tiers.INVESTOR_TIER, LockLevel.THIRD)
//         await airdrop.setRoot(instance.address, namehash('hello'));
//         await expect(
//           airdrop.application(instance.address)
//         ).to.be.revertedWith("root is already set")
//       })
//       it('Should be reverted with: cannot apply', async () => {
//         let id;
//         async function _before(){
//           id = await ethers.provider.send("evm_snapshot");
//         }
//         async function _after(){
//           await ethers.provider.send("evm_revert", [id]);
//         }
//         const mock = [
//           [Tiers.STARTER_TIER, LockLevel.NONE],
//           [Tiers.INVESTOR_TIER, LockLevel.NONE],
//           [Tiers.STRATEGIST_TIER, LockLevel.NONE],
//           [Tiers.EVANGELIST_TIER_PRO, LockLevel.NONE],
//           [Tiers.STARTER_TIER, LockLevel.FIRST],
//           [Tiers.INVESTOR_TIER, LockLevel.FIRST],
//           [Tiers.STARTER_TIER, LockLevel.SECOND],
//           [Tiers.INVESTOR_TIER, LockLevel.SECOND]
//         ];
//         for(let i = 0; i < mock.length; i++){
//           _before();
//           await stake(owner, mock[i][0], mock[i][1])
//           await expect(
//             airdrop.application(instance.address)
//           ).to.be.revertedWith("cannot apply");
//           _after();
//         }
//        })
//        it('Should be application made successfully', async () => {
//         let id;
//         async function _before(){
//           id = await ethers.provider.send("evm_snapshot");
//         }
//         async function _after(){
//           await ethers.provider.send("evm_revert", [id]);
//         }
//         const mock = [
//           [Tiers.STRATEGIST_TIER, LockLevel.FIRST],
//           [Tiers.EVANGELIST_TIER, LockLevel.FIRST],
//           [Tiers.STRATEGIST_TIER, LockLevel.SECOND],
//           [Tiers.EVANGELIST_TIER, LockLevel.SECOND],
//           [Tiers.STARTER_TIER, LockLevel.THIRD],
//           [Tiers.INVESTOR_TIER, LockLevel.THIRD],
//           [Tiers.STARTER_TIER, LockLevel.THIRD],
//           [Tiers.EVANGELIST_TIER, LockLevel.THIRD],
//           [Tiers.EVANGELIST_TIER_PRO, LockLevel.THIRD],
//         ];
//         for(let i = 0; i < mock.length; i++){
//           _before();
//           await stake(owner, mock[i][0], mock[i][1])
//           await airdrop.application(instance.address)
//           const member = await airdrop.getParticipants(instance.address, 0, 1);
//           expect(member[0].toString()).to.be.equal(owner.address)
//           _after();
//         }
//        })
//     })
//     describe('Claim', () => {
//       async function setAirdrop(numberOfAcc, tokenAmount, lpAmount, valueAmount) {
//         const accounts = Array(numberOfAcc).fill().map(() => (Wallet.createRandom()));
//         const tokenAmounts = Array(accounts.length).fill().map((_, i) => i + 5);
//         const lpAmounts = Array(accounts.length).fill().map((_, i) => i + 3);
//         const valueAmounts = Array(accounts.length).fill().map((_, i) => i + 1);
//         const { hashedElements, leaves, root, proofs } = await makeDrop(accounts, tokenAmounts, lpAmounts, valueAmounts);
//         await instanceToken.mint(owner.address, tokenAmount);
//         await lpToken.mint(owner.address, lpAmount);
//         await instanceToken.approve(airdrop.address, tokenAmount);
//         await lpToken.approve(airdrop.address, lpAmount);
//         await airdrop.depositAssets(instance.address, tokenAmount, lpAmount, {value: valueAmount});
//         await airdrop.setRoot(instance.address, root);
//         return {accounts, tokenAmounts, lpAmounts, valueAmounts, hashedElements, leaves, proofs}
//       }

//       it('Should be reverted with: pool does not exist yet', async () => {
//         const mock = [alice, bob, tod, larry];
//         mock.forEach(async (i) => {
//           await expect(
//             airdrop.claim(i.address, owner.address, 10, 10, 10, [namehash('hello')])
//           ).to.be.revertedWith("pool does not exist yet");
//         })
//       })
//       it('Should be reverted with: pool does not have root', async () => {
//         await expect(
//           airdrop.claim(instance.address, owner.address, 10, 10, 10, [namehash('hello')])
//         ).to.be.revertedWith("pool does not have root");
//       })
//       it('Should be reverted with: pool has not started yet', async () => {
//         const { hashedElements, leaves, root, proofs } = await makeDrop([alice, bob, bob], [10,10,10], [10,10,10], [10,10,10]);
//         await instanceToken.mint(owner.address, parseEther('10'));
//         await lpToken.mint(owner.address, parseEther('10'));
//         await instanceToken.approve(airdrop.address, parseEther('10'));
//         await lpToken.approve(airdrop.address, parseEther('10'));
//         await airdrop.depositAssets(instance.address,  parseEther('10'), parseEther('10'), {value:  parseEther('10')});
//         await airdrop.setRoot(instance.address, root)
//         await expect(
//           airdrop.claim(instance.address, alice.address, 10, 10, 10, proofs[leaves.indexOf(hashedElements[0])])
//         ).to.be.revertedWith("pool has not started yet");
//       })
//       it('Should be reverted with: drop already claimed', async () => {
//         const {accounts, tokenAmounts, lpAmounts, valueAmounts, hashedElements, leaves, proofs} = await setAirdrop(10, parseEther('10'), parseEther('10'), parseEther('10'))
//         await time.increaseTo(
//           params.privateStart.toString()
//         );
//         //first time 
//         for(let i = 0; i < accounts.length; i++){
//           await airdrop.claim(instance.address, accounts[i].address, tokenAmounts[i], lpAmounts[i], valueAmounts[i], proofs[leaves.indexOf(hashedElements[i])])
//         }
//         //second time 
//         for(let i = 0; i < accounts.length; i++){
//           await expect(
//             airdrop.claim(instance.address, accounts[i].address, tokenAmounts[i], lpAmounts[i], valueAmounts[i], proofs[leaves.indexOf(hashedElements[i])])
//           ).to.be.revertedWith("drop already claimed");
//         }
//       })
//       it('Should be reverted with: invalid proof', async () => {
//         const { hashedElements, leaves, root, proofs } = await makeDrop([alice, bob, bob], [10,10,10], [10,10,10], [10,10,10]);
//         await instanceToken.mint(owner.address, parseEther('10'));
//         await lpToken.mint(owner.address, parseEther('10'));
//         await instanceToken.approve(airdrop.address, parseEther('10'));
//         await lpToken.approve(airdrop.address, parseEther('10'));
//         await airdrop.depositAssets(instance.address,  parseEther('10'), parseEther('10'), {value:  parseEther('10')});
//         await airdrop.setRoot(instance.address, root)
//         await time.increaseTo(
//           params.privateStart.toString()
//         );
//         //change address 
//         await expect(
//           airdrop.claim(instance.address, bob.address, 10, 10, 10, proofs[leaves.indexOf(hashedElements[0])])
//         ).to.be.revertedWith("invalid proof");
        
//         //change tokenAmount 
//         await expect(
//         airdrop.claim(instance.address, bob.address, 11, 10, 10, proofs[leaves.indexOf(hashedElements[0])])
//         ).to.be.revertedWith("invalid proof");
        
//         //change lpAmount 
//         await expect(
//           airdrop.claim(instance.address, bob.address, 10, 11, 10, proofs[leaves.indexOf(hashedElements[0])])
//           ).to.be.revertedWith("invalid proof");
      
//         //change valueAmount 
//         await expect(
//         airdrop.claim(instance.address, bob.address, 10, 10, 11, proofs[leaves.indexOf(hashedElements[0])])
//         ).to.be.revertedWith("invalid proof");
//       })
//       it('Should be reverted with: not enough assets(tokens)', async () => {
//         const {accounts, tokenAmounts, lpAmounts, valueAmounts, hashedElements, leaves, proofs} = await setAirdrop(10, 0, parseEther('10'), parseEther('10'))
//         await time.increaseTo(
//           params.privateStart.toString()
//         );
//         for(let i = 0; i < accounts.length; i++){
//           await expect(
//             airdrop.claim(instance.address, accounts[i].address, tokenAmounts[i], lpAmounts[i], valueAmounts[i], proofs[leaves.indexOf(hashedElements[i])])
//           ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
//         }
//       })
//       it('Should be reverted with: not enough assets(values)', async () => {
//         const {accounts, tokenAmounts, valueAmounts, hashedElements, leaves, proofs} = await setAirdrop(10, parseEther('10'), parseEther('10'), 0)
//         await time.increaseTo(
//           params.privateStart.toString()
//         );
//         for(let i = 0; i < accounts.length; i++){
//           await expect(
//             airdrop.claim(instance.address, accounts[i].address, tokenAmounts[i], valueAmounts[i], proofs[leaves.indexOf(hashedElements[i])])
//           ).to.be.reverted;
//         }
//       })
//       it('Should be claim made successfully', async () => {
//         const {accounts, tokenAmounts, lpAmounts, valueAmounts, hashedElements, leaves, proofs} = await setAirdrop(50, parseEther('10'), parseEther('10'), parseEther('10'))
//         await time.increaseTo(
//           params.privateStart.toString()
//         );
//         for(let i = 0; i < accounts.length; i++){
//           // Event
//         await expect(
//           await airdrop.claim(instance.address, accounts[i].address, tokenAmounts[i], lpAmounts[i], valueAmounts[i], proofs[leaves.indexOf(hashedElements[i])])
//         )
//           .to.emit(airdrop, "Claimed")
//           .withArgs(accounts[i].address, instance.address);
//         expect(await instanceToken.balanceOf(accounts[i].address)).to.be.equal(tokenAmounts[i])
//         expect(await lpToken.balanceOf(accounts[i].address)).to.be.equal(lpAmounts[i])
//         expect(await provider.getBalance(accounts[i].address)).to.be.equal(valueAmounts[i])
//         expect(await airdrop.claimed(instance.address, accounts[i].address)).to.be.equal(true)
//         }
//       })
//     })
//     describe('Send eth', () => {
//       it('Should be reverted without a reason', async () => {
//         expect(owner.sendTransaction({to: airdrop.address, value: parseEther('1')})).to.be.reverted;
//       })
//     })
//     describe('Take Locked Assets', () => {
//       it('Should be reverted with: pool does not exist yet', async () => {
//         const mock = [alice, bob, tod, larry];
//         mock.forEach(async (i) => {
//           await expect(
//             airdrop.takeLocked(i.address)
//           ).to.be.revertedWith("pool does not exist yet");
//         })
//       })
//       it('Should be reverted with: sender is not an operator', async () => {
//         const mock = [alice, bob, tod, larry];
//         mock.forEach(async (i) => {
//           await expect(
//             airdrop.takeLocked(instance.address)
//           ).to.be.revertedWith("sender is not an operator");e
//         })
//       })
//       it('Should be take locked made is successfully ', async () => {
//         await mintToken(parseEther('1'));
//         await mintLptoken(parseEther('1'));
//         await instanceToken.approve(airdrop.address, parseEther('1'));
//         await lpToken.approve(airdrop.address, parseEther('1'));
//         await airdrop.depositAssets(instance.address, parseEther('1'), parseEther('1'), {value: parseEther('2')})
//         await expect(() => airdrop.takeLocked(instance.address))
//         .to.changeEtherBalance(owner, parseEther('2'));
//         expect(await instanceToken.balanceOf(owner.address)).to.be.equal(parseEther('1'))
//         expect(await lpToken.balanceOf(owner.address)).to.be.equal(parseEther('1'))
//       })
//     })
//     describe('Get Participants', () => {
//       it('should be return', async () => {
//         const signers = await ethers.getSigners();
//         for(let i = 0; i < signers.length; i++){
//           await stake(signers[i], Tiers.EVANGELIST_TIER, LockLevel.THIRD)
//           await airdrop.connect(signers[i]).application(instance.address)
//           signers[i] = signers[i].address
//         }
//         let members = [];
//         for(let i = 0; i < (signers.length / 5); i++){
//           let curCursor = BN.from('0'); 
//           const get = await airdrop.getParticipants(instance.address, curCursor, 5)
//           curCursor = get[1];
//           members.push(...get[0])
//         }
//         expect(signers).to.include.members(members);
//       })
//     })
//   })