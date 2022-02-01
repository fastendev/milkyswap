import { run, ethers, network } from "hardhat";
import {

} from "./helpers";
import fs from 'fs';

async function main() {
    await run("compile");

    const [deployer] = await ethers.getSigners();
  
    console.log(`Deploying contracts with from: ${deployer.address}`);
    
    // deploy MasterMilker, MilkyToken, MilkyMaker, CreamyToken, and FeeDistributor

    const coreAddressPath = `${process.cwd()}/addresses/${network.config.chainId}/farm.json`;
    const coreAddressBook = {
        deployer: deployer.address,
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
