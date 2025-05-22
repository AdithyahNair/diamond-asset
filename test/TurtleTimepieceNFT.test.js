const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TurtleTimepieceNFT", function () {
  let nftContract;
  let owner;
  let buyer1;
  let buyer2;
  const MINT_PRICE = ethers.parseEther("0.001");

  beforeEach(async function () {
    // Get signers
    [owner, buyer1, buyer2] = await ethers.getSigners();

    // Deploy the contract
    const TurtleTimepieceNFT = await ethers.getContractFactory(
      "TurtleTimepieceNFT"
    );
    nftContract = await TurtleTimepieceNFT.deploy();
    await nftContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nftContract.owner()).to.equal(owner.address);
    });

    it("Should pre-mint all NFTs to the owner", async function () {
      const totalSupply = 8; // MAX_SUPPLY from contract
      for (let i = 1; i <= totalSupply; i++) {
        expect(await nftContract.ownerOf(i)).to.equal(owner.address);
        expect(await nftContract.isTokenForSale(i)).to.equal(true);
      }
    });
  });

  describe("Direct Purchase", function () {
    it("Should allow purchase with correct ETH amount", async function () {
      const tokenId = 1;
      await expect(
        nftContract.connect(buyer1).purchaseNFT(tokenId, { value: MINT_PRICE })
      )
        .to.emit(nftContract, "NFTSold")
        .withArgs(owner.address, buyer1.address, tokenId, MINT_PRICE);

      expect(await nftContract.ownerOf(tokenId)).to.equal(buyer1.address);
      expect(await nftContract.isTokenForSale(tokenId)).to.equal(false);
    });

    it("Should fail purchase with insufficient ETH", async function () {
      const tokenId = 1;
      await expect(
        nftContract
          .connect(buyer1)
          .purchaseNFT(tokenId, { value: ethers.parseEther("0.0005") })
      ).to.be.revertedWith("Insufficient ETH sent");
    });
  });

  describe("Pre-purchase Flow", function () {
    it("Should allow owner to mark token as pre-purchased", async function () {
      const tokenId = 1;
      await expect(nftContract.markTokenAsPrePurchased(tokenId, buyer1.address))
        .to.emit(nftContract, "TokenPrePurchased")
        .withArgs(tokenId, buyer1.address);

      expect(await nftContract.isTokenForSale(tokenId)).to.equal(false);
      expect(await nftContract.getPrePurchaser(tokenId)).to.equal(
        buyer1.address
      );
    });

    it("Should not allow non-owner to mark token as pre-purchased", async function () {
      const tokenId = 1;
      await expect(
        nftContract
          .connect(buyer1)
          .markTokenAsPrePurchased(tokenId, buyer2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow authorized user to claim pre-purchased token", async function () {
      const tokenId = 1;
      // Mark token as pre-purchased for buyer1
      await nftContract.markTokenAsPrePurchased(tokenId, buyer1.address);

      // Buyer1 claims the token
      await expect(nftContract.connect(buyer1).claimToken(tokenId))
        .to.emit(nftContract, "TokenClaimed")
        .withArgs(tokenId, buyer1.address);

      // Verify ownership and status
      expect(await nftContract.ownerOf(tokenId)).to.equal(buyer1.address);
      expect(await nftContract.getPrePurchaser(tokenId)).to.equal(
        ethers.ZeroAddress
      );
    });

    it("Should not allow unauthorized user to claim pre-purchased token", async function () {
      const tokenId = 1;
      await nftContract.markTokenAsPrePurchased(tokenId, buyer1.address);

      await expect(
        nftContract.connect(buyer2).claimToken(tokenId)
      ).to.be.revertedWith("Not authorized to claim");
    });

    it("Should not allow claiming a token that hasn't been pre-purchased", async function () {
      const tokenId = 1;
      await expect(
        nftContract.connect(buyer1).claimToken(tokenId)
      ).to.be.revertedWith("Not authorized to claim");
    });
  });

  describe("Token Status", function () {
    it("Should correctly track token sale status", async function () {
      const tokenId = 1;

      // Initially for sale
      expect(await nftContract.isTokenForSale(tokenId)).to.equal(true);

      // After pre-purchase
      await nftContract.markTokenAsPrePurchased(tokenId, buyer1.address);
      expect(await nftContract.isTokenForSale(tokenId)).to.equal(false);

      // After claiming
      await nftContract.connect(buyer1).claimToken(tokenId);
      expect(await nftContract.isTokenForSale(tokenId)).to.equal(false);
    });

    it("Should not allow double pre-purchase", async function () {
      const tokenId = 1;
      await nftContract.markTokenAsPrePurchased(tokenId, buyer1.address);

      await expect(
        nftContract.markTokenAsPrePurchased(tokenId, buyer2.address)
      ).to.be.revertedWith("Token is not for sale");
    });

    it("Should not allow direct purchase of pre-purchased token", async function () {
      const tokenId = 1;
      await nftContract.markTokenAsPrePurchased(tokenId, buyer1.address);

      await expect(
        nftContract.connect(buyer2).purchaseNFT(tokenId, { value: MINT_PRICE })
      ).to.be.revertedWith("Token is not for sale");
    });
  });
});
