import { run, ethers, network } from "hardhat"
import { GaugeProxy__factory, MasterMilker__factory } from "../dist/types"
import fs from "fs"
import * as testnet from "../addresses/200101/farm.json"
import * as mainnet from "../addresses/2001/farm.json"
import * as local from "../addresses/31337/farm.json"

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

  const [, , , , , deployer] = await ethers.getSigners()

  console.log(`Deploying contracts with from: ${deployer.address}`)

  let args: FarmingAddresses
  switch (network.name) {
    case "local":
      args = local
      break
    case "milkomedaTestnet":
      args = testnet
      break
    case "milkomeda":
      args = mainnet
      break
  }

  const gaugeProxyDeployer = new GaugeProxy__factory(deployer)
  const gaugeProxy = await gaugeProxyDeployer.deploy(args.milky, args.creamy, args.masterMilker)
  await gaugeProxy.deployed()
  console.log(`GaugeProxy deployed to ${gaugeProxy.address}`)
  const mCREAMY = await gaugeProxy.TOKEN()
  console.log(`mCREAMY deployed to ${mCREAMY}`)

  // Assign boosted pools 30% of total farming emissions
  const masterMilker = MasterMilker__factory.connect(args.masterMilker, deployer)
  const boostAllocPoint = (await masterMilker.totalAllocPoint()).div(10).mul(3)
  await masterMilker.add(boostAllocPoint, mCREAMY)
  // Notify GaugeProxy of its MasterMilker pid and deposit mCREAMY
  const pid = (await masterMilker.poolLength()).sub(1)
  await gaugeProxy.setPID(pid)
  await gaugeProxy.deposit()

  const coreAddressPath = `${process.cwd()}/addresses/${network.config.chainId}/boost.json`
  const coreAddressBook = {
    deployer: deployer.address,
    gaugeProxy: gaugeProxy.address,
    mCREAMY: mCREAMY,
    pid: pid.toString(),
  }

  fs.writeFileSync(coreAddressPath, JSON.stringify(coreAddressBook, null, 2))
}
