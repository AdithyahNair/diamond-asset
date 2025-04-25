const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

async function main() {
  // Get private key from .env file
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("Please set your PRIVATE_KEY in the .env file");
    return;
  }

  // Get Sepolia RPC URL from .env file
  const sepoliaRPC =
    process.env.SEPOLIA_RPC_URL ||
    "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY";

  // Connect to the network
  const provider = new ethers.providers.JsonRpcProvider(sepoliaRPC);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying contracts with the account:", wallet.address);

  // Read the compiled contract
  const contractJSON = JSON.parse(
    fs.readFileSync(
      "./artifacts/contracts/TurtleTimepieceNFT.sol/TurtleTimepieceNFT.json",
      "utf8"
    )
  );

  // Create factory
  const factory = new ethers.ContractFactory(
    contractJSON.abi,
    contractJSON.bytecode,
    wallet
  );

  // Deploy contract
  console.log("Deploying TurtleTimepieceNFT...");
  const contract = await factory.deploy();
  await contract.deployed();

  console.log("TurtleTimepieceNFT deployed to:", contract.address);

  // Wait for 5 block confirmations
  console.log("Waiting for 5 block confirmations...");
  await contract.deployTransaction.wait(5);

  // Verify contract on Etherscan (you'll need to add an API key to do this)
  console.log("Contract deployed and confirmed!");
  console.log("Contract address:", contract.address);

  // Save contract information
  const contractInfo = {
    address: contract.address,
    network: "sepolia",
    abi: contractJSON.abi,
  };

  fs.writeFileSync(
    "./contract-info.json",
    JSON.stringify(contractInfo, null, 2)
  );
  console.log("Contract information saved to contract-info.json");

  return {
    contract,
    address: contract.address,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
