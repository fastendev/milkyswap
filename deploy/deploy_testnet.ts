import { run, ethers, network } from "hardhat";
import {
    deployFactory,
    deployPeriphery,
    deployTokens,
} from "./helpers";
import fs from 'fs';

async function main() {
    await run("compile");

    const [deployer] = await ethers.getSigners();
  
    console.log(`Deploying contracts with from: ${deployer.address}`);
      
    const { factory } = await deployFactory(deployer);
    
    const INIT_CODE_PAIR_HASH = await factory.INIT_CODE_PAIR_HASH();
    console.log(`INIT_CODE_PAIR_HASH: ${INIT_CODE_PAIR_HASH}`)
    
    const { weth, router, multicall } = await deployPeriphery(deployer, factory.address);

    const { tokenA, tokenB } = await deployTokens(deployer); 

    const coreAddressPath = `${process.cwd()}/addresses/${network.config.chainId}/core.json`;
    const coreAddressBook = {
        deployer: deployer.address,
        factory: factory.address,
        weth: weth.address,
        router: router.address,
        multicall: multicall.address,
        INIT_CODE_PAIR_HASH: INIT_CODE_PAIR_HASH,
    };

    const testnetAddressPath = `${process.cwd()}/addresses/${network.config.chainId}/test.json`;
    const testAddressBook = {
        tokenA: tokenA.address,
        tokenB: tokenB.address,
    }

    fs.writeFileSync(
        coreAddressPath,
        JSON.stringify(coreAddressBook, null, 2)
    );

    fs.writeFileSync(
        testnetAddressPath,
        JSON.stringify(testAddressBook, null, 2)
    );
}
  
main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
