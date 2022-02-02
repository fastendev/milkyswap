import { run, ethers, network } from "hardhat";
import {
    MilkyToken__factory,
    CreamyToken__factory,
    FeeDistributor__factory,
    MilkyMaker__factory,
    MasterMilker__factory,
    UniswapV2Factory__factory
} from '../dist/types'
import fs from 'fs';

const FEE_DISTRIBUTOR_START_TIME = 1;
const DEV_ADDRESS = ''; // just the deployer or dev
const MILKY_PER_BLOCK = 100;
const BONUS_END_BLOCK = 1;
const START_BLOCK = 1;

type MilkyAddressBook = {
    factory: string;
    weth: string;
}

async function main() {
    await run("compile");

    const [deployer] = await ethers.getSigners();
  
    console.log(`Deploying contracts with from: ${deployer.address}`);

    // deploy, and FeeDistributor, set feeTo
    const addresses: MilkyAddressBook = require(`${process.cwd()}/addresses/${network.config.chainId}/core.json`);

    // deploy MILKY
    const MilkyToken = new MilkyToken__factory(deployer);
    const milkyToken = await MilkyToken.deploy();
    await milkyToken.deployed();
    console.log(`MilkyToken deployed to ${milkyToken.address}`);

    // deploy CREAMY
    const CreamyToken = new CreamyToken__factory(deployer)
    const creamyToken = await CreamyToken.deploy(
        milkyToken.address,
        'Vote Escrowed MILKY (CREAMY)',
        'CREAMY',
        '1',
    );
    await creamyToken.deployed();
    console.log(`CreamyToken deployed to ${creamyToken.address}`);

    // deploy FeeDistributor
    const FeeDistributor = new FeeDistributor__factory(deployer);
    const feeDistributor = await FeeDistributor.deploy(
        creamyToken.address,
        FEE_DISTRIBUTOR_START_TIME,
        milkyToken.address,
        deployer.address,
        deployer.address,
    );
    await feeDistributor.deployed()
    console.log(`FeeDistributor deployed to ${feeDistributor.address}`);

    // deploy MilkyMaker
    const MilkyMaker = new MilkyMaker__factory(deployer);
    const milkyMaker = await MilkyMaker.deploy(
        addresses.factory,
        feeDistributor.address,
        milkyToken.address,
        addresses.weth,
    );
    await milkyMaker.deployed();
    console.log(`MilkyMaker deployed to ${milkyMaker.address}`);

    // deploy MasterMilker
    const MasterMilker = new MasterMilker__factory(deployer);
    const masterMilker = await MasterMilker.deploy(
        milkyToken.address,
        deployer.address, // DEV_ADDRESS
        MILKY_PER_BLOCK,
        BONUS_END_BLOCK,
        START_BLOCK,
    );
    await masterMilker.deployed();
    console.log(`MasterMilker deployed to ${masterMilker.address}`);

    // const factory = UniswapV2Factory__factory.connect(addresses.factory, deployer);
    // const tx = await factory.setFeeTo(milkyMaker.address);
    // await tx.wait();
    // console.log(`Factory feeTo set at tx ${tx.hash}`);

    // const tx = await milkyToken.transferOwnership(masterMilker.address);
    // await tx.wait();
    // console.log(`$MILKY ownership transferred to MasterMilker at tx ${tx.hash}`)

    const coreAddressPath = `${process.cwd()}/addresses/${network.config.chainId}/farm.json`;
    const coreAddressBook = {
        deployer: deployer.address,
        milky: milkyToken.address,
        creamy: creamyToken.address,
        feeDistributor: feeDistributor.address,
        milkyMaker: milkyMaker.address,
        masterMilker: masterMilker.address
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
