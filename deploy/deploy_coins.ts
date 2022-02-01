import { run, ethers, network } from "hardhat";
import {
    TestnetERC20__factory,
} from "../dist/types";
import fs from 'fs';

async function main() {
    await run("compile");

    const [deployer] = await ethers.getSigners();
  
    console.log(`Deploying contracts with from: ${deployer.address}`);
      
    const TestUSDC = new TestnetERC20__factory(deployer);
    const testUSDC = await TestUSDC.deploy("Test USDC", "USDC-TEST", 6);
    await testUSDC.deployed();
    console.log(`Test USDC deployed to ${testUSDC.address}`);

    const TestWBTC = new TestnetERC20__factory(deployer);
    const testWBTC = await TestWBTC.deploy("Test Wrapped BTC", "WBTC-TEST", 8);
    await testWBTC.deployed();
    console.log(`Test Wrapped BTC deployed to ${testWBTC.address}`);

    const TestUSDT = new TestnetERC20__factory(deployer);
    const testUSDT = await TestUSDT.deploy("Test Tether USD", "USDT-TEST", 6);
    await testUSDT.deployed();
    console.log(`Test Tether USD deployed to ${testUSDT.address}`);

    const TestWETH = new TestnetERC20__factory(deployer);
    const testWETH = await TestWETH.deploy("Test Wrapped ETH", "WETH-TEST", 18);
    await testWETH.deployed();
    console.log(`Test Wrapped ETH deployed to ${testWETH.address}`);

    const TestDAI = new TestnetERC20__factory(deployer);
    const testDAI = await TestDAI.deploy("Test DAI", "DAI-TEST", 18);
    await testDAI.deployed();
    console.log(`Test DAI deployed to ${testDAI.address}`);

    const TestWSTR = new TestnetERC20__factory(deployer);
    const testWSTR = await TestWSTR.deploy("Test Wraped Star", "WSTR-TEST", 18);
    await testWSTR.deployed();
    console.log(`Test Wraped Star deployed to ${testWSTR.address}`);

    const testnetAddressPath = `${process.cwd()}/addresses/${network.config.chainId}/test.json`;
    const testAddressBook = {
        weth: testWETH.address,
        wbtc: testWBTC.address,
        usdc: testUSDC.address,
        usdt: testUSDT.address,
        dai: testDAI.address,
        wstr: testWSTR.address,
    }

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
