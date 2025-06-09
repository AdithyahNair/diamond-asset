const hre = require("hardhat");

async function main() {
  console.log("Starting contract testing...");

  // Get test accounts
  const [owner, buyer1, buyer2] = await hre.ethers.getSigners();
  console.log("Testing with accounts:");
  console.log("Owner:", owner.address);
  console.log("Buyer1:", buyer1.address);
  console.log("Buyer2:", buyer2.address);

  // Deploy contract
  console.log("\nDeploying contract...");
  const TurtleTimepieceNFT = await hre.ethers.getContractFactory(
    "TurtleTimepieceNFT"
  );
  const nft = await TurtleTimepieceNFT.deploy();
  await nft.waitForDeployment();
  const contractAddress = await nft.getAddress();
  console.log("Contract deployed to:", contractAddress);

  // Test initial state
  console.log("\nTesting initial state...");
  const maxSupply = await nft.MAX_SUPPLY();
  const mintPrice = await nft.mintPrice();
  console.log("Max supply:", maxSupply.toString());
  console.log("Mint price:", hre.ethers.formatEther(mintPrice), "ETH");

  // Test token availability
  console.log("\nTesting token availability...");
  const availableTokens = await nft.getTokensForSale();
  console.log(
    "Available tokens:",
    availableTokens.map((t) => t.toString())
  );

  // Test Stripe pre-purchase flow
  console.log("\nTesting Stripe pre-purchase flow...");
  const tokenId = 1;
  console.log(
    `Marking token ${tokenId} as pre-purchased for ${buyer1.address}...`
  );
  const markTx = await nft.markTokenAsPrePurchased(tokenId, buyer1.address);
  await markTx.wait();

  // Verify pre-purchase
  const prePurchaser = await nft.getPrePurchaser(tokenId);
  console.log("Pre-purchaser for token 1:", prePurchaser);
  console.log("Pre-purchase successful:", prePurchaser === buyer1.address);

  // Test claiming
  console.log("\nTesting claiming process...");
  const claimTx = await nft.connect(buyer1).claimToken(tokenId);
  await claimTx.wait();

  // Verify ownership
  const newOwner = await nft.ownerOf(tokenId);
  console.log("New owner of token 1:", newOwner);
  console.log("Claim successful:", newOwner === buyer1.address);

  // Test direct purchase
  console.log("\nTesting direct purchase...");
  const tokenId2 = 2;
  console.log(`Buying token ${tokenId2} with ETH...`);
  const buyTx = await nft
    .connect(buyer2)
    .purchaseNFT(tokenId2, { value: mintPrice });
  await buyTx.wait();

  // Verify purchase
  const tokenOwner = await nft.ownerOf(tokenId2);
  console.log("Owner of token 2:", tokenOwner);
  console.log("Purchase successful:", tokenOwner === buyer2.address);

  console.log("\nAll tests completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
