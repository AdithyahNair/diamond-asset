const hre = require("hardhat");

async function main() {
  console.log("Deploying TurtleTimepieceNFT contract...");

  // Get the contract factory
  const TurtleTimepieceNFT = await hre.ethers.getContractFactory(
    "TurtleTimepieceNFT"
  );

  // Deploy the contract
  const nftContract = await TurtleTimepieceNFT.deploy();

  // Wait for deployment to finish
  await nftContract.waitForDeployment();

  // Get the deployed contract address
  const address = await nftContract.getAddress();

  console.log("TurtleTimepieceNFT deployed to:", address);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  const deploymentTransaction = await nftContract.deploymentTransaction();
  await deploymentTransaction.wait(6);

  // Verify the contract on Etherscan
  console.log("Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

// Handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
