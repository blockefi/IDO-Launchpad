const BN = require('ethers').BigNumber;
const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  const {chainId} = await ethers.provider.getNetwork()

  let Admin, TokenSale, LPToken, Staking, Oracle, Airdrops;
  let staking;
  let token;
  let admin;
  let master; 
  let airdrops;
  
  const network = chainId == 56 ? 'mainnet' : 'testnet';

  const settings = {
    mainnet: {
      backend: '0xF547b338FA93485158d3A843E4C20edb9E939eeb',
      oracle: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE'
    },
    testnet: {
      backend: '0xF547b338FA93485158d3A843E4C20edb9E939eeb',
      oracle: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526'
    }
  }
  

  Admin = await ethers.getContractFactory("Admin");
  TokenSale = await ethers.getContractFactory("TokenSale");
  LPToken = await ethers.getContractFactory("LPToken");
  Staking = await ethers.getContractFactory("Staking");
  Airdrops = await ethers.getContractFactory("Airdrops");

  admin = await Admin.deploy();
  await admin.deployed();

  master = await TokenSale.deploy();
  await master.deployed();

  token = await LPToken.deploy("LPToken", "LPT");
  await token.deployed();

  staking = await Staking.deploy(
    token.address,
    admin.address
  );

  await staking.deployed();

  airdrops = await Airdrops.deploy(staking.address, admin.address, token.address);
  await airdrops.deployed();

  await admin.addOperator(settings[network].backend);
  await admin.setMasterContract(master.address);
  await admin.setOracleContract(settings[network].oracle);
  await admin.setAirdrop(airdrops.address);
  await admin.setStakingContract(staking.address);

  console.log(staking.address, 'Staking Contract')
  console.log(token.address, 'LPtoken Contract')
  console.log(admin.address, 'Admin Contract')
  console.log(master.address, 'TokenSale(Master) Contract')
  console.log(airdrops.address, 'Airdrops Contract');
// verify
    try {
      await hre.run("verify:verify", {
      address: master.address,
      constructorArguments: [],
      });
    }catch(e) {
      console.log('Error');
    }
    try {
      await hre.run("verify:verify", {
        address: token.address,
        constructorArguments: ["LPToken", "LPT"],
      });
    }catch(e) {
      console.log('Error');
    }
    try {
      await hre.run("verify:verify", {
        address: staking.address,
        constructorArguments: [token.address, admin.address],
      });
    }catch(e) {
      console.log('Error');
    }
    
    try {
      await hre.run("verify:verify", {
        address: admin.address,
        constructorArguments: [],
      });
    }catch(e) {
      console.log('Error');
    }

    try {
      await hre.run("verify:verify", {
        address: airdrops.address,
        constructorArguments: [staking.address, admin.address, token.address],
      });
    }catch(e) {
      console.log('Error');
    }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
	console.error(error);
	process.exit(1);
  });