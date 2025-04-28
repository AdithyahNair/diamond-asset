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

  // Use a placeholder CID if needed
  const metadataCID =
    process.env.IPFS_METADATA_FOLDER_CID ||
    "bafybeigw2vgfqwuihkj5cxjqr6vtjdp475xzo7elalwd33bbkoo3fin4om";

  const ipfsBaseURI = `ipfs://${metadataCID}/`;
  console.log("Setting base URI to:", ipfsBaseURI);

  const txSetBaseURI = await nftContract.setBaseURI(ipfsBaseURI);
  await txSetBaseURI.wait();
  console.log("Base URI set successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
