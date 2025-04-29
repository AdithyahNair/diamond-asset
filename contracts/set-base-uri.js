const { JsonRpcProvider, Wallet, Contract } = require("ethers");
const fs = require("fs");
require("dotenv").config();

async function main() {
  // Get contract info
  let contractInfo = JSON.parse(
    fs.readFileSync("./contract-info.json", "utf8")
  );

  // Get private key from .env file
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("Please set your PRIVATE_KEY in the .env file");
    return;
  }

  // Get Sepolia RPC URL from .env file
  const sepoliaRPC = process.env.SEPOLIA_RPC_URL;
  if (!sepoliaRPC) {
    console.error("Please set your SEPOLIA_RPC_URL in the .env file");
    return;
  }

  // Connect to the network
  const provider = new JsonRpcProvider(sepoliaRPC);
  const wallet = new Wallet(privateKey, provider);

  console.log("Setting base URI with the account:", wallet.address);

  // Create contract instance
  const nftContract = new Contract(
    contractInfo.address,
    contractInfo.abi,
    wallet
  );

  // Get metadata CID from .env
  const metadataCID = process.env.IPFS_METADATA_FOLDER_CID;
  if (!metadataCID) {
    console.error("Please set IPFS_METADATA_FOLDER_CID in your .env file");
    return;
  }

  const ipfsBaseURI = `ipfs://${metadataCID}/`;
  console.log("Setting base URI to:", ipfsBaseURI);

  try {
    const txSetBaseURI = await nftContract.setBaseURI(ipfsBaseURI);
    console.log("Transaction sent:", txSetBaseURI.hash);
    console.log("Waiting for confirmation...");
    await txSetBaseURI.wait();
    console.log("Base URI set successfully!");
  } catch (error) {
    console.error("Error setting base URI:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });
