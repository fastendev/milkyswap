import { run, ethers, network } from "hardhat";
import {
    UniswapV2Factory__factory,
    WETH9__factory,
    UniswapV2Router02__factory,
    Multicall2__factory,
} from '../dist/types';
import fs from 'fs';

async function main() {
    await run("compile");

    const [deployer] = await ethers.getSigners();
  
    console.log(`Deploying contracts with from: ${deployer.address}`);
      
    const Factory = new UniswapV2Factory__factory(deployer);
    const factory = await Factory.deploy(deployer.address);
    await factory.deployed();
    console.log(`UniswapV2Factory deployed to ${factory.address}`);

    const INIT_CODE_PAIR_HASH = await factory.INIT_CODE_PAIR_HASH();
    console.log(`INIT_CODE_PAIR_HASH: ${INIT_CODE_PAIR_HASH}`)
    
    const Weth = new WETH9__factory(deployer);
    const weth = await Weth.deploy();
    await weth.deployed();
    console.log(`WETH deployed to ${weth.address}`);

    const Router = new UniswapV2Router02__factory(deployer);
    const router = await Router.deploy(factory.address, weth.address);
    await router.deployed();
    console.log(`Router deployed to ${router.address}`);

    const Multicall = new Multicall2__factory(deployer);
    const multicall = await Multicall.deploy();
    await multicall.deployed();
    console.log(`Multicall deployed to ${multicall.address}`);

    const coreAddressPath = `${process.cwd()}/addresses/${network.config.chainId}/core.json`;
    const coreAddressBook = {
        deployer: deployer.address,
        factory: factory.address,
        weth: weth.address,
        router: router.address,
        multicall: multicall.address,
        INIT_CODE_PAIR_HASH: INIT_CODE_PAIR_HASH,
    };

    fs.writeFileSync(
        coreAddressPath,
        JSON.stringify(coreAddressBook, null, 2)
    );
}
  
main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
