import {
    UniswapV2Factory__factory,
    UniswapV2Factory,
    UniswapV2Router02__factory,
    UniswapV2Router02,
    WETH9__factory,
    WETH9,
    TestnetERC20__factory,
    TestnetERC20,
    Multicall2__factory,
    Multicall2
 } from "../dist/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export async function deployFactory(deployer: SignerWithAddress): Promise<{ factory: UniswapV2Factory }> {        
    const Factory = new UniswapV2Factory__factory(deployer);
    const factory = await Factory.deploy(deployer.address);
    await factory.deployed();
    console.log(`UniswapV2Factory deployed to ${factory.address}`);
    
    return { factory: UniswapV2Factory__factory.connect(factory.address, deployer)};
}

export async function deployPeriphery(
    deployer: SignerWithAddress,
    factory: string
): Promise<{
    weth: WETH9,
    router: UniswapV2Router02,
    multicall: Multicall2
}> {
    const Weth = new WETH9__factory(deployer);
    const weth = await Weth.deploy();
    await weth.deployed();
    console.log(`WETH deployed to ${weth.address}`);

    const Router = new UniswapV2Router02__factory(deployer);
    const router = await Router.deploy(factory, weth.address);
    await router.deployed();
    console.log(`Router deployed to ${router.address}`);

    const Multicall = new Multicall2__factory(deployer);
    const multicall = await Multicall.deploy();
    await multicall.deployed();
    console.log(`Multicall deployed to ${multicall.address}`);

    return {
        weth: WETH9__factory.connect(weth.address, deployer),
        router: UniswapV2Router02__factory.connect(router.address, deployer),
        multicall: Multicall2__factory.connect(multicall.address, deployer)
    }
}

export async function deployTokens(
    deployer: SignerWithAddress,
): Promise<{
    tokenA: TestnetERC20,
    tokenB: TestnetERC20,
}> {
    const TokenA = new TestnetERC20__factory(deployer);
    const tokenA = await TokenA.deploy("Token A", "A", 18);
    await tokenA.deployed();
    console.log(`TokenA deployed to ${tokenA.address}`);

    const TokenB = new TestnetERC20__factory(deployer);
    const tokenB = await TokenB.deploy("Token B", "B", 18);
    await tokenB.deployed();
    console.log(`TokenB deployed to ${tokenB.address}`);

    return {
        tokenA: TestnetERC20__factory.connect(tokenA.address, deployer),
        tokenB: TestnetERC20__factory.connect(tokenB.address, deployer),
    }
}
