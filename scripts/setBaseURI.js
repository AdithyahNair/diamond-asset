const hre = require("hardhat");

async function main() {
  // Get the contract address from contract-info.json
  const contractInfo = require("../contract-info.json");
  const contractAddress = contractInfo.address;

  console.log("Setting baseURI for TurtleTimepieceNFT at", contractAddress);

  // Replace this with your actual IPFS or other metadata base URI
  // This should be the URI where your metadata files are hosted, ending with a trailing slash
  const newBaseURI =
    "https://gateway.pinata.cloud/ipfs/bafybeia24wi54ltggaeq3524gdzjv77cxwmcpa64g45mclkfx3ccjednwm/";

  // Connect to the contract
  const TurtleTimepieceNFT = await hre.ethers.getContractFactory(
    "TurtleTimepieceNFT"
  );
  const [signer] = await hre.ethers.getSigners();

  console.log("Using account:", signer.address);

  // Get contract instance
  const contract = TurtleTimepieceNFT.attach(contractAddress);

  // Set the new base URI
  console.log("Setting base URI to:", newBaseURI);
  const tx = await contract.setBaseURI(newBaseURI);

  console.log("Transaction hash:", tx.hash);
  console.log("Waiting for confirmation...");

  // Wait for the transaction to be mined
  await tx.wait();

  console.log("Base URI set successfully!");
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
