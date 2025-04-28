const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Deploying TurtleTimepieceNFT contract...");

  // Get the contract factory
  const TurtleTimepieceNFT = await ethers.getContractFactory(
    "TurtleTimepieceNFT"
  );

  // Deploy the contract
  const nftContract = await TurtleTimepieceNFT.deploy();

  // Wait for deployment to finish
  await nftContract.deployed();

  console.log("TurtleTimepieceNFT deployed to:", nftContract.address);

  // Save contract info to a JSON file
  const fs = require("fs");
  const contractInfo = {
    address: nftContract.address,
    abi: nftContract.interface.format(),
  };

  fs.writeFileSync(
    "./contract-info.json",
    JSON.stringify(contractInfo, null, 2)
  );

  console.log("Contract info saved to contract-info.json");

  // Wait for a few blocks to ensure the contract is properly deployed
  console.log("Waiting for 5 blocks to be mined...");
  await new Promise((resolve) => setTimeout(resolve, 30000));

  // Verify the contract on Etherscan
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: nftContract.address,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.error("Error verifying contract:", error);
    }
  } else {
    console.log("Skipping Etherscan verification (no API key provided)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
