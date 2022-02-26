const { ethers } = require('hardhat');

/* eslint-disable no-undef */
const BN = require('ethers').BigNumber;

const duration = {
  seconds(val) {
    return BN.from(val);
  },
  minutes(val) {
    return BN.from(val).mul(this.seconds("60"));
  },
  hours(val) {
    return new BN.from(val).mul(this.minutes("60"));
  },
  days(val) {
    return new BN.from(val).mul(this.hours("24"));
  },
  weeks(val) {
    return new BN.from(val).mul(this.days("7"));
  },
  years(val) {
    return new BN.from(val).mul(this.days("365"));
  },
};


async function main() {

  const [deployer] = await ethers.getSigners();
  const {chainId} = await ethers.provider.getNetwork()
  console.log(chainId)

	console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
    
    let masterContract;
    let adminContract;
    let stakingContract;
    let lpToken;
    let defaultParams; 
    let oracle = '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526';
    let backend = '0x141509b940c24f86aa05c1daf5f706133a9a2150';
    const totalSupply = BN.from('1000000').mul(BN.from('10').pow('9'))

    async function createPool({privateStart, privateEnd, publicStart, publicEnd}, num){
      const { deploy } = deployments;


      let token;

      await deploy('LPToken', {
        from: deployer.address,
        args: ['DefaultToken', 'def'],
        log: true,
      });

      token = await ethers.getContract("LPToken"); 
      await token.mint(deployer.address, totalSupply);
      await token.approve(adminContract.address, totalSupply);

      defaultParams.token = token.address;
      defaultParams.privateStart = privateStart;
      defaultParams.privateEnd = privateEnd;
      defaultParams.publicStart = publicStart;
      defaultParams.publicEnd = publicEnd;
      defaultParams.vestingPoints = [
        [BN.from(defaultParams.publicStart).add(duration.seconds(1)), BN.from('1000')],
        [BN.from(defaultParams.privateEnd).add(duration.hours(2)), BN.from('100')],
        [BN.from(defaultParams.privateEnd).add(duration.hours(3)), BN.from('100')],
        [BN.from(defaultParams.privateEnd).add(duration.hours(4)), BN.from('100')],
        [BN.from(defaultParams.privateEnd).add(duration.hours(5)), BN.from('100')],
        [BN.from(defaultParams.privateEnd).add(duration.hours(6)), BN.from('100')],
        [BN.from(defaultParams.privateEnd).add(duration.hours(7)), BN.from('100')],
        [BN.from(defaultParams.privateEnd).add(duration.hours(8)), BN.from('100')],
        [BN.from(defaultParams.privateEnd).add(duration.hours(9)), BN.from('100')],
        [BN.from(defaultParams.privateEnd).add(duration.hours(10)), BN.from('100')],
      ]

      const tx = await adminContract.createPool(defaultParams, {gasLimit: 2000000});
      let receipt = await tx.wait();
      const event = receipt.events?.filter((x) => {return x.event == "CreateTokenSale"});
      console.log(`Pool ${num}: ${event[0].args.instanceAddress}`)
      console.log(`PoolToken ${num}: ${token.address}`)


    } 

      accounts = await ethers.getNamedSigners();
      const { deploy } = deployments;

      const Admin = await ethers.getContractFactory("Admin");
      const admin = Admin.attach('0x0C0351aD7B0878d7c8a3f6fC54a0f7C7eA75d0CA');

      const Token = await ethers.getContractFactory("AstraGuild");
      const token = Token.attach('0xbDd7617E1B15139a5496dB07B3Ad3139265A6b3A');


      const LpToken = await ethers.getContractFactory("LPToken");
      const lptoken = LpToken.attach('0x201c40Bf1251c6BcdA8B4513e64d0DCd1a59A6Fb');

      const Staking = await ethers.getContractFactory("Staking");
      const staking = Staking.attach('0x774633f17DA48A40DeD30D841A92170D9955874B');
      
      // await lptoken.mint(deployer.address, BN.from('7000000').mul(BN.from("10").pow('9')))
      // await lptoken.approve(staking.address, BN.from('7000000').mul(BN.from("10").pow('9')))
      // await staking.stake(BN.from('7000000').mul(BN.from("10").pow('9')),  {gasLimit: 2000000})
      console.log(await staking.getTierOf(deployer.address))
      //await token.approve(admin.address, BN.from('1500000').mul(BN.from("10").pow('18')));

      // // address initial;
      // // address token;
      // // uint256 totalSupply; //MUST BE 10**18;
      // // uint256 privateStart;
      // // uint256 privateEnd;
      // // uint256 publicStart;
      // // uint256 publicEnd;
      // // uint256 privateTokenPrice; // MUST BE 10**18 in bnb
      // // uint256 publicTokenPrice; // MUST BE 10**18 in bnb
      // // uint256 publicBuyLimit; //// MUST BE 10**18 in $
      // // uint256 escrowPercentage; // Percentage base is 1000
      // // uint256[4] tierLimits; // MUST BE 10**18 in $
      // // uint256[2][] escrowReturnMilestones; // Percentage base is 1000
      // // //in erc decimals
      // // uint256 thresholdPublicAmount;
      // // uint256 airdrop;
      // // //[timeStamp, pct]
      // // uint256[2][] vestingPoints; // Percentage base is 1000
      // // uint256 tokenFeePct; // Percentage base is 1000
      // // uint256 valueFeePct; // Percentage base is 1000

        // defaultParams = {
        //     initial: deployer.address,
        //     token: '0xbDd7617E1B15139a5496dB07B3Ad3139265A6b3A',
        //     totalSupply: BN.from('1500000').mul(BN.from("10").pow('18')),
        //     privateTokenPrice: BN.from('10000000000000'), 
        //     publicTokenPrice: BN.from('10000000000000'),
        //     privateStart: 1638980429,
        //     privateEnd: 1638981329,
        //     publicStart: 1638981629,
        //     publicEnd: 1638982229,
        //     publicBuyLimit: BN.from('100').mul(BN.from('10').pow('18')), 
        //     escrowPercentage: 0,
        //     tierLimits: [
        //         BN.from('200').mul(BN.from('10').pow('18')), 
        //         BN.from('500').mul(BN.from('10').pow('18')), 
        //         BN.from('1000').mul(BN.from('10').pow('18')), 
        //         BN.from('2500').mul(BN.from('10').pow('18'))],
        //     escrowReturnMilestones: [],
        //     thresholdPublicAmount: BN.from('99'),
        //     airdrop: BN.from('0'),
        //     vestingPoints: [[1670515200, BN.from('1000')]],
        //     tokenFeePct: 0,
        //     valueFeePct: 0
        // }

        // const tx = await admin.createPool(defaultParams, {gasLimit: 2000000});
        // let receipt = await tx.wait();
        // const event = receipt.events?.filter((x) => {return x.event == "CreateTokenSale"});
        // console.log(`Pool: ${event[0].args.instanceAddress}`)

        await deploy('LPToken', {
          from: deployer.address,
          args: ['LPToken', 'lp'],
          log: true,
        });
        lpToken = await ethers.getContract("LPToken");

        await deploy('Staking', {
          from: deployer.address,
          args: [lpToken.address, adminContract.address],
          log: true,
        });
        stakingContract = await ethers.getContract("Staking");
        
          await adminContract.addOperator(deployer.address)
          //backend address
          await adminContract.addOperator(backend)
          await adminContract.setMasterContract(masterContract.address);
          await adminContract.setOracleContract(oracle);
          await adminContract.setStakingContract(stakingContract.address)

          defaultParams = {
              initial: deployer.address,
              totalSupply: totalSupply,
              privateTokenPrice: BN.from("240297408185753"), 
              publicTokenPrice: BN.from("360446112278630"),
              publicBuyLimit: BN.from('1000').mul(BN.from('10').pow('18')), 
              escrowPercentage: BN.from("0"),
              tierLimits: [
                  BN.from('200').mul(BN.from('10').pow('18')), 
                  BN.from('500').mul(BN.from('10').pow('18')), 
                  BN.from('1000').mul(BN.from('10').pow('18')), 
                  BN.from('2500').mul(BN.from('10').pow('18'))],
              escrowReturnMilestones: [
              ],
              thresholdPublicAmount: totalSupply.mul(BN.from('5')).div(BN.from('100')),
              airdrop: totalSupply.div(BN.from('100')),
              tokenFeePct: BN.from('0'),
              valueFeePct: BN.from('800')
          }
        console.log(`Master: ${masterContract.address}`)
        console.log(`LPtoken: ${lpToken.address}`)
        console.log(`Admin: ${adminContract.address}`)
        console.log(`Staking: ${stakingContract.address}`)
        // verify
        await hre.run("verify:verify", {
        address: masterContract.address,
        constructorArguments: [],
        });

        await hre.run("verify:verify", {
          address: lpToken.address,
          constructorArguments: ['LPToken', 'lp'],
        });
        await hre.run("verify:verify", {
          address: stakingContract.address,
          constructorArguments: [lpToken.address, adminContract.address],
        });

        await hre.run("verify:verify", {
          address: adminContract.address,
          constructorArguments: [],
        });

      // await createPool({privateStart: '1634043600', privateEnd: '1634047200', publicStart: '1634047500', publicEnd: '1634051100'}, 1);
      // await createPool({privateStart: '1634058000', privateEnd: '1634061600', publicStart: '1634061900', publicEnd: '1634065500'}, 2);
      // await createPool({privateStart: '1634036400', privateEnd: '1634037600', publicStart: '1634038200', publicEnd: '1634040000'}, 3);
}
main()
  .then(() => process.exit(0))
  .catch(error => {
	console.error(error);
	process.exit(1);
  });