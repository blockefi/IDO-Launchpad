const { ethers } = require('hardhat');
const { parseEther } = require("ethers").utils;
/* eslint-disable no-undef */
const BN = require('ethers').BigNumber;

async function main() {
    const [deployer] = await ethers.getSigners();

     const { deploy } = deployments;
    await deploy('TokenSale', {
      from: deployer.address,
      args: [],
      log: true,
    });
    let masterContract = await ethers.getContract("TokenSale");

    await hre.run("verify:verify", {
          address: masterContract.address,
          constructorArguments: [],
      });

    console.log(masterContract.address, 'Tokensale')

    const Admin = await ethers.getContractFactory("Admin");
    const admin = Admin.attach('0x0C0351aD7B0878d7c8a3f6fC54a0f7C7eA75d0CA');

    await admin.setMasterContract(masterContract.address);


    // const pools = [
    //     '0x5a2DcA24FEbD52dc36c87FC9d3451d717c7E8BAb',
    //     '0x76cA0D9aa5e41d8009f8072C7bf294Ecc8103ca6',
    //     '0x5cF5F7dCa03aD3Fd83C70C087Cf15450151bd4f1',
    //     '0x22c314078F4546c2CCF1d499B4Fb26C401cEDB00',
    //     '0xE47d9fFb73040977523e5db9622a33DB553A949C',
    //     '0x63d0F8C03D33aAc1d17DF70219Fe391DB4A98de7',
    //     '0xF898146F3Ec03595b41a7582C50108C19307CDd6',
    //     '0xf3BF00dD29F9391e41B14ce8480980D236c26075',
    //     '0xdFf84F6cEa23f15EA14236d626E5F597F4082a6e',
    //     '0x61c77B7abf61298b35ee0C4AEAe7D4B8aBB7678C'
    // ]

    // const { deploy } = deployments;
    // await deploy('TokenSale', {
    //   from: deployer.address,
    //   args: [],
    //   log: true,
    // });
    // masterContract = await ethers.getContract("TokenSale"); ; 
    // console.log(masterContract.address, 'Tokensale')
    
    // await hre.run("verify:verify", {
    //   address: '0xdA5bEddFCccC37B7cf1716F6A6e6Fa496F0c09A6',
    //   constructorArguments: [],
    // });

    //const TokenSale = await ethers.getContractFactory("TokenSale");
     //const ERC20 = await ethers.getContractFactory("LPToken");
    // const Master = await ethers.getContractFactory("TokenSale");
    // const Staking = await ethers.getContractFactory("Staking");
    // const Admin = await ethers.getContractFactory("Admin");
    // const admin = Admin.attach('0x4C4e15A86852E8bf068BaBe93ae063e142d8e8Fa');
    // await admin.addOperator('0xf547b338fa93485158d3a843e4c20edb9e939eeb');

   // console.log(await admin.stakingContract.call())
    // await hre.run("verify:verify", {
    //       address: newMaster.address,
    //       constructorArguments: [],
    //     });
    //0xFe7C5D725A34E93C466f1C24d861196ad0E3Ed64
    //await admin.setMasterContract(newMaster.address);

    //await admin.setAirdrop(deployer.address)
    // const instance = ERC20.attach('0x4543e10b36522B569aB09CC3249E3dC4E80BB5C4');
    // await instance.mint('0xBdDCEA08dE9beb049F92C949E4D90119f9140Eb1', BN.from('1000000').mul(BN.from('10').pow('18')), {gasLimit: 2000000});
    
    // const time = await instance.getTimeParams.call();
    // console.log(time[0].toString());
    // console.log(time[1].toString());
    // console.log(time[2].toString());
    // console.log(time[3].toString());

    // const total = await instance.saleTokensAmountWithoutAirdrop.call();
    // console.log(total.toString());

    // const params = await instance.getParams.call();
    //console.log(params[9].toString());
    //await instance.deposit({value: '500000000000000000'})
    // await instance.takeAirdrop({gasLimit: 2000000})
    // await instance.takeLeftovers({gasLimit: 2000000});
    //     await instance.takeLeftovers({gasLimit: 2000000})
    // const totalPublic= await instance.totalPublicSold({gasLimit: 2000000});
    // const totalPrivate = await instance.totalPrivateSold({gasLimit: 2000000});
    // const total = await instance.totalTokenSold({gasLimit: 2000000});
    //const withoutAirdrop = await instance.saleTokensAmountWithoutAirdrop.call();
    // console.log(totalPublic.toString())
    // console.log(totalPrivate.toString())
    // console.log(total.toString())
    // console.log(withoutAirdrop.toString())

    // for(let i = 0; i < pools.length; i++){
    //     const instance = TokenSale.attach(pools[i]);
    //     await instance.takeAirdrop({gasLimit: 2000000})
    //     await instance.takeLeftovers({gasLimit: 2000000}); 
    // } 
}

main()
  .then(() => process.exit(0))
  .catch(error => {
	console.error(error);
	process.exit(1);
  });
