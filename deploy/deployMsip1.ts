import { run, ethers, network } from "hardhat";
import {
    MSIP1__factory,
} from '../dist/types';
import fs from 'fs'

type FarmAddressBook = {
    creamy: string;
}

async function main() {
    await run("compile");

    const [deployer] = await ethers.getSigners();
  
    console.log(`Deploying contracts with from: ${deployer.address}`);
    
    const addresses: FarmAddressBook = require(`${process.cwd()}/addresses/${network.config.chainId}/farm.json`);

    const MSIP1 = new MSIP1__factory(deployer);
    const msip1 = await MSIP1.deploy(addresses.creamy, 1749857354000);
    await msip1.deployed();
    console.log(`MSIP1 deployed to ${msip1.address}`);

    const msipAddressPath = `${process.cwd()}/addresses/${network.config.chainId}/msip.json`;
    const coreAddressBook = {
        deployer: deployer.address,
        'msip-1': msip1.address,
    };

    fs.writeFileSync(
        msipAddressPath,
        JSON.stringify(coreAddressBook, null, 2)
    );
}
  
main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
