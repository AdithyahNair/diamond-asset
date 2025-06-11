const hre = require("hardhat");

async function main() {
  console.log("Deploying TurtleTimepieceNFT contract...");

  // Deploy the contract
  const TurtleTimepieceNFT = await hre.ethers.getContractFactory(
    "TurtleTimepieceNFT"
  );
  const nft = await TurtleTimepieceNFT.deploy();

  await nft.waitForDeployment();
  const address = await nft.getAddress();

  console.log(`TurtleTimepieceNFT deployed to: ${address}`);

  // Wait for a few block confirmations
  const blockConfirmations = 6;
  await nft.deploymentTransaction().wait(blockConfirmations);

  // Verify the contract on Etherscan
  console.log("Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("Contract verified on Etherscan!");
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Contract already verified!");
    } else {
      console.error("Error verifying contract:", error);
    }
  }

  // Save contract info to a file
  const fs = require("fs");
  const artifact = require("../artifacts/contracts/TurtleTimepieceNFT.sol/TurtleTimepieceNFT.json");

  const contractInfo = {
    address: address,
    abi: artifact.abi,
  };

  fs.writeFileSync("contract-info.json", JSON.stringify(contractInfo, null, 2));
  console.log("Contract information saved to contract-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
