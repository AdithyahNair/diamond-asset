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

  // Set the base URI
  const baseURI = "ipfs://QmdeWAdt3NxbzRRAM6hdw8pxemgFY8Eje4jjZvZDFe5bni/";
  console.log("Setting base URI to:", baseURI);
  const tx = await nft.setBaseURI(baseURI);
  await tx.wait(2); // Wait for 2 block confirmations
  console.log("Base URI set successfully!");

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
    baseURI: baseURI,
  };

  fs.writeFileSync("contract-info.json", JSON.stringify(contractInfo, null, 2));
  console.log("Contract information saved to contract-info.json");

  // Verify the metadata is accessible
  console.log("\nVerifying metadata accessibility...");
  const tokenURI = await nft.tokenURI(1);
  console.log("Token #1 URI:", tokenURI);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
