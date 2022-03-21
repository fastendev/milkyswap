import { run, ethers, network } from "hardhat";
import { BigNumber } from 'ethers';
import {
    MilkyToken__factory,
    CreamyToken__factory,
    FeeDistributor__factory,
    MilkyMaker__factory,
    MasterMilker__factory,
    UniswapV2Factory__factory
} from '../dist/types'
import fs from 'fs';

const DECIMALS = BigNumber.from('1000000000000000000')
const FEE_DISTRIBUTOR_START_TIME = 1644954162;
const MILKY_PER_BLOCK = BigNumber.from('6000000000000000000'); // 6 $MILKY per block
const START_BLOCK = 2034265; // current unix 1647880114 = block 1891594, future unix 1648450800 = (roughly) block 2034265
const BONUS_END_BLOCK = 2034266; // plus one
const PREMINE = BigNumber.from('36400000').mul(DECIMALS);

type MilkyAddressBook = {
    factory: string;
    weth: string;
}

async function main() {
    await run("compile");

    const [,,,deployer] = await ethers.getSigners();
  
    console.log(`Deploying contracts with from: ${deployer.address}`);

    const addresses: MilkyAddressBook = require(`${process.cwd()}/addresses/${network.config.chainId}/core.json`);

    // deploy MILKY
    const MilkyToken = new MilkyToken__factory(deployer);
    const milkyToken = await MilkyToken.deploy();
    await milkyToken.deployed();
    console.log(`MilkyToken deployed to ${milkyToken.address}`);

    // deploy CREAMY
    // const CreamyToken = new CreamyToken__factory(deployer)
    // const creamyToken = await CreamyToken.deploy(
    //     milkyToken.address,
    //     'Vote Escrowed MILKY (CREAMY)',
    //     'CREAMY',
    //     '1',
    // );
    // await creamyToken.deployed();
    // console.log(`CreamyToken deployed to ${creamyToken.address}`);

    // deploy FeeDistributor
    // const FeeDistributor = new FeeDistributor__factory(deployer);
    // const feeDistributor = await FeeDistributor.deploy(
    //     creamyToken.address,
    //     FEE_DISTRIBUTOR_START_TIME,
    //     milkyToken.address,
    //     deployer.address,
    //     deployer.address,
    // );
    // await feeDistributor.deployed()
    // console.log(`FeeDistributor deployed to ${feeDistributor.address}`);

    // deploy MilkyMaker
    // const MilkyMaker = new MilkyMaker__factory(deployer);
    // const milkyMaker = await MilkyMaker.deploy(
    //     addresses.factory,
    //     feeDistributor.address,
    //     milkyToken.address,
    //     addresses.weth,
    // );
    // await milkyMaker.deployed();
    // console.log(`MilkyMaker deployed to ${milkyMaker.address}`);

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

    // configuration transactions
    // const factory = UniswapV2Factory__factory.connect(addresses.factory, deployer);
    // const txFee = await factory.setFeeTo(milkyMaker.address);
    // await txFee.wait();
    // console.log(`Factory feeTo set at tx ${txFee.hash}`);

    const txPremine = await milkyToken.mint(deployer.address, PREMINE);
    await txPremine.wait();
    console.log(`MILKY premined at tx ${txPremine.hash}`);

    const txOwnership = await milkyToken.transferOwnership(masterMilker.address);
    await txOwnership.wait();
    console.log(`$MILKY ownership transferred to MasterMilker at tx ${txOwnership.hash}`)

    const coreAddressPath = `${process.cwd()}/addresses/${network.config.chainId}/farm.json`;
    const coreAddressBook = {
        deployer: deployer.address,
        milky: milkyToken.address,
        creamy: '', // creamyToken.address,
        feeDistributor: '', // feeDistributor.address,
        milkyMaker: '', // milkyMaker.address,
        masterMilker: masterMilker.address,
        txFeeTo: '', // txFee.hash,
        txPremine: txPremine.hash,
        txOwnership: txOwnership.hash
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
