import { expect } from "chai";
import { prepare, deploy, getBigNumber, createSLP } from "./utilities"

describe("MilkyMaker", function () {
  before(async function () {
    await prepare(this, ["MilkyMaker", "CreamyToken", "FeeDistributor", "MilkyMakerExploitMock", "ERC20Mock", "UniswapV2Factory", "UniswapV2Pair"])
  })

  beforeEach(async function () {
    await deploy(this, [
      ["milky", this.ERC20Mock, ["MILKY", "MILKY", getBigNumber("10000000")]],
      ["dai", this.ERC20Mock, ["DAI", "DAI", getBigNumber("10000000")]],
      ["mic", this.ERC20Mock, ["MIC", "MIC", getBigNumber("10000000")]],
      ["usdc", this.ERC20Mock, ["USDC", "USDC", getBigNumber("10000000")]],
      ["weth", this.ERC20Mock, ["WETH", "ETH", getBigNumber("10000000")]],
      ["strudel", this.ERC20Mock, ["$TRDL", "$TRDL", getBigNumber("10000000")]],
      ["factory", this.UniswapV2Factory, [this.alice.address]],
    ])
    await deploy(this, [["creamy", this.CreamyToken, [this.milky.address, "Creamy Token", "CREAMY", "1"]]])
    await deploy(this, [["feeDist", this.FeeDistributor, [this.creamy.address, 1, this.milky.address, '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266']]])
    await deploy(this, [["milkyMaker", this.MilkyMaker, [this.factory.address, this.milky.address, this.weth.address]]])
    await deploy(this, [["exploiter", this.MilkyMakerExploitMock, [this.milkyMaker.address]]])
    await createSLP(this, "milkyEth", this.milky, this.weth, getBigNumber(10))
    await createSLP(this, "strudelEth", this.strudel, this.weth, getBigNumber(10))
    await createSLP(this, "daiEth", this.dai, this.weth, getBigNumber(10))
    await createSLP(this, "usdcEth", this.usdc, this.weth, getBigNumber(10))
    await createSLP(this, "micUSDC", this.mic, this.usdc, getBigNumber(10))
    await createSLP(this, "milkyUSDC", this.milky, this.usdc, getBigNumber(10))
    await createSLP(this, "daiUSDC", this.dai, this.usdc, getBigNumber(10))
    await createSLP(this, "daiMIC", this.dai, this.mic, getBigNumber(10))
  })
  describe("setDest", function () {
    it("sets dest to zero", async function () {
      await expect(await this.milkyMaker.dest()).to.equal("0x0000000000000000000000000000000000000000")
    })
    
    it("only let's owner change dest", async function () {
      await expect(this.milkyMaker.connect(this.bob).setDest(this.alice.address)).to.be.revertedWith('Ownable: caller is not the owner')
      await this.milkyMaker.setDest(this.alice.address)
      await expect(await this.milkyMaker.dest()).to.equal(this.alice.address)
    })
  })

  describe("setBridge", function () {
    it("does not allow to set bridge for Milky", async function () {
      await expect(this.milkyMaker.setBridge(this.milky.address, this.weth.address)).to.be.revertedWith("MilkyMaker: Invalid bridge")
    })

    it("does not allow to set bridge for WETH", async function () {
      await expect(this.milkyMaker.setBridge(this.weth.address, this.milky.address)).to.be.revertedWith("MilkyMaker: Invalid bridge")
    })

    it("does not allow to set bridge to itself", async function () {
      await expect(this.milkyMaker.setBridge(this.dai.address, this.dai.address)).to.be.revertedWith("MilkyMaker: Invalid bridge")
    })

    it("emits correct event on bridge", async function () {
      await expect(this.milkyMaker.setBridge(this.dai.address, this.milky.address))
        .to.emit(this.milkyMaker, "LogBridgeSet")
        .withArgs(this.dai.address, this.milky.address)
    })
  })
  describe("convert", function () {
    it("will not let you convert if dest is not set", async function () {
      await this.milkyEth.transfer(this.milkyMaker.address, getBigNumber(1))
      await expect(this.milkyMaker.convert(this.milky.address, this.weth.address)).to.revertedWith("dest is not set")
    })

    it("should convert MILKY - ETH", async function () {
      await this.milkyEth.transfer(this.milkyMaker.address, getBigNumber(1))
      await this.milkyMaker.convert(this.milky.address, this.weth.address)
      expect(await this.milky.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.milkyEth.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.milky.balanceOf(this.feeDist.address)).to.equal("1897569270781234370")
    })

    it("should convert USDC - ETH", async function () {
      await this.usdcEth.transfer(this.milkyMaker.address, getBigNumber(1))
      await this.milkyMaker.convert(this.usdc.address, this.weth.address)
      expect(await this.milky.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.usdcEth.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.milky.balanceOf(this.feeDist.address)).to.equal("1590898251382934275")
    })

    it("should convert $TRDL - ETH", async function () {
      await this.strudelEth.transfer(this.milkyMaker.address, getBigNumber(1))
      await this.milkyMaker.convert(this.strudel.address, this.weth.address)
      expect(await this.milky.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.strudelEth.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.milky.balanceOf(this.feeDist.address)).to.equal("1590898251382934275")
    })

    it("should convert USDC - MILKY", async function () {
      await this.milkyUSDC.transfer(this.milkyMaker.address, getBigNumber(1))
      await this.milkyMaker.convert(this.usdc.address, this.milky.address)
      expect(await this.milky.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.milkyUSDC.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.milky.balanceOf(this.feeDist.address)).to.equal("1897569270781234370")
    })

    it("should convert using standard ETH path", async function () {
      await this.daiEth.transfer(this.milkyMaker.address, getBigNumber(1))
      await this.milkyMaker.convert(this.dai.address, this.weth.address)
      expect(await this.milky.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.daiEth.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.milky.balanceOf(this.feeDist.address)).to.equal("1590898251382934275")
    })

    it("converts MIC/USDC using more complex path", async function () {
      await this.micUSDC.transfer(this.milkyMaker.address, getBigNumber(1))
      await this.milkyMaker.setBridge(this.usdc.address, this.milky.address)
      await this.milkyMaker.setBridge(this.mic.address, this.usdc.address)
      await this.milkyMaker.convert(this.mic.address, this.usdc.address)
      expect(await this.milky.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.micUSDC.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.milky.balanceOf(this.feeDist.address)).to.equal("1590898251382934275")
    })

    it("converts DAI/USDC using more complex path", async function () {
      await this.daiUSDC.transfer(this.milkyMaker.address, getBigNumber(1))
      await this.milkyMaker.setBridge(this.usdc.address, this.milky.address)
      await this.milkyMaker.setBridge(this.dai.address, this.usdc.address)
      await this.milkyMaker.convert(this.dai.address, this.usdc.address)
      expect(await this.milky.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.daiUSDC.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.milky.balanceOf(this.feeDist.address)).to.equal("1590898251382934275")
    })

    it("converts DAI/MIC using two step path", async function () {
      await this.daiMIC.transfer(this.milkyMaker.address, getBigNumber(1))
      await this.milkyMaker.setBridge(this.dai.address, this.usdc.address)
      await this.milkyMaker.setBridge(this.mic.address, this.dai.address)
      await this.milkyMaker.convert(this.dai.address, this.mic.address)
      expect(await this.milky.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.daiMIC.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.milky.balanceOf(this.feeDist.address)).to.equal("1200963016721363748")
    })

    it("reverts if it loops back", async function () {
      await this.daiMIC.transfer(this.milkyMaker.address, getBigNumber(1))
      await this.milkyMaker.setBridge(this.dai.address, this.mic.address)
      await this.milkyMaker.setBridge(this.mic.address, this.dai.address)
      await expect(this.milkyMaker.convert(this.dai.address, this.mic.address)).to.be.reverted
    })

    it("reverts if caller is not EOA", async function () {
      await this.milkyEth.transfer(this.milkyMaker.address, getBigNumber(1))
      await expect(this.exploiter.convert(this.milky.address, this.weth.address)).to.be.revertedWith("MilkyMaker: must use EOA")
    })

    it("reverts if pair does not exist", async function () {
      await expect(this.milkyMaker.convert(this.mic.address, this.micUSDC.address)).to.be.revertedWith("MilkyMaker: Invalid pair")
    })

    it("reverts if no path is available", async function () {
      await this.micUSDC.transfer(this.milkyMaker.address, getBigNumber(1))
      await expect(this.milkyMaker.convert(this.mic.address, this.usdc.address)).to.be.revertedWith("MilkyMaker: Cannot convert")
      expect(await this.milky.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.micUSDC.balanceOf(this.milkyMaker.address)).to.equal(getBigNumber(1))
      expect(await this.milky.balanceOf(this.feeDist.address)).to.equal(0)
    })
  })

  describe("convertMultiple", function () {
    it("should allow to convert multiple", async function () {
      await this.daiEth.transfer(this.milkyMaker.address, getBigNumber(1))
      await this.milkyEth.transfer(this.milkyMaker.address, getBigNumber(1))
      await this.milkyMaker.convertMultiple([this.dai.address, this.milky.address], [this.weth.address, this.weth.address])
      expect(await this.milky.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.daiEth.balanceOf(this.milkyMaker.address)).to.equal(0)
      expect(await this.milky.balanceOf(this.feeDist.address)).to.equal("3186583558687783097")
    })
  })
})
