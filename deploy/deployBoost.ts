import { run, ethers, network } from "hardhat"
import { GaugeProxy__factory, MasterMilker__factory } from "../dist/types"
import fs from "fs"

interface FarmingAddresses {
  deployer: string
  milky: string
  creamy: string
  feeDistributor: string
  milkyMaker: string
  masterMilker: string
  txFeeTo: string
  txPremine: string
  txOwnership: string
}

async function main() {
  await run("compile")

  const [deployer] = await ethers.getSigners()

  console.log(`Deploying contracts with from: ${deployer.address}`)

  const args: FarmingAddresses = require(`${process.cwd()}/addresses/${network.config.chainId}/farm.json`);
  const gaugeProxyDeployer = new GaugeProxy__factory(deployer)
  const gaugeProxy = await gaugeProxyDeployer.deploy(args.milky, args.creamy, args.masterMilker)
  await gaugeProxy.deployed()
  console.log(`GaugeProxy deployed to ${gaugeProxy.address}`)
  const mCREAMY = await gaugeProxy.TOKEN()
  console.log(`mCREAMY deployed to ${mCREAMY}`)

  // After deploying, do all of these transactions manually
  // await masterMilker.add(boostAllocPoint, mCREAMY)
  // const pid = (await masterMilker.poolLength()).sub(1)
  // await gaugeProxy.setPID(pid)
  // await gaugeProxy.deposit()

  const coreAddressPath = `${process.cwd()}/addresses/${network.config.chainId}/boost.json`
  const coreAddressBook = {
    deployer: deployer.address,
    gaugeProxy: gaugeProxy.address,
    mCREAMY: mCREAMY,
    pid: '' // pid.toString(),
  }

  fs.writeFileSync(coreAddressPath, JSON.stringify(coreAddressBook, null, 2))
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});
