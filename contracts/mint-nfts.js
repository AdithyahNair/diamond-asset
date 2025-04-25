const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

async function main() {
  // Get contract info
  let contractInfo;
  try {
    contractInfo = JSON.parse(fs.readFileSync("./contract-info.json", "utf8"));
  } catch (error) {
    console.error(
      "Error reading contract-info.json. Make sure you've deployed the contract first."
    );
    return;
  }

  // Get private key from .env file
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("Please set your PRIVATE_KEY in the .env file");
    return;
  }

  // Get NFT recipient address (optional, defaults to the deployer)
  const recipientAddress = process.env.RECIPIENT_ADDRESS || null;

  // Get Sepolia RPC URL from .env file
  const sepoliaRPC =
    process.env.SEPOLIA_RPC_URL ||
    "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY";

  // Connect to the network
  const provider = new ethers.providers.JsonRpcProvider(sepoliaRPC);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Minting NFTs with the account:", wallet.address);

  // Create contract instance
  const nftContract = new ethers.Contract(
    contractInfo.address,
    contractInfo.abi,
    wallet
  );

  /*
   * IMPORTANT: Before running this script, you need to:
   * 1. Upload your NFT video (nft-video.mp4) to IPFS (e.g., using Pinata)
   * 2. Generate metadata files with the correct IPFS video URL
   * 3. Upload metadata folder to IPFS
   * 4. Set IPFS_METADATA_FOLDER_CID in your .env file
   */

  // Get the IPFS metadata folder CID from .env
  const metadataCID = process.env.IPFS_METADATA_FOLDER_CID;
  if (!metadataCID) {
    console.error("Please set IPFS_METADATA_FOLDER_CID in your .env file");
    return;
  }

  // Set the base URI to the IPFS metadata folder
  const ipfsBaseURI = `ipfs://${metadataCID}/`;

  console.log("Setting base URI to:", ipfsBaseURI);
  const txSetBaseURI = await nftContract.setBaseURI(ipfsBaseURI);
  await txSetBaseURI.wait();
  console.log("Base URI set successfully");

  // Mint NFTs to the recipient (or deployer if no recipient specified)
  const target = recipientAddress || wallet.address;
  console.log(`Minting 8 NFTs to ${target}...`);

  for (let i = 0; i < 8; i++) {
    try {
      console.log(`Minting NFT #${i + 1}...`);

      // Mint NFT directly (as owner)
      const mintTx = await nftContract.mintNFT(target, `${i + 1}.json`);
      const receipt = await mintTx.wait();

      console.log(
        `NFT #${i + 1} minted successfully! Transaction hash: ${
          receipt.transactionHash
        }`
      );
    } catch (error) {
      console.error(`Error minting NFT #${i + 1}:`, error.message);
    }
  }

  // Check the token count
  const tokenCount = await nftContract.getTokenCount();
  console.log(`Total NFTs minted: ${tokenCount}`);

  console.log("NFT minting complete!");

  // Log the marketplaces where the NFTs can be viewed
  console.log("\nYour NFTs can be viewed at:");
  console.log(`OpenSea: https://testnets.opensea.io/${target}`);
  console.log(`Rarible: https://testnet.rarible.com/user/${target}`);

  // Log the contract address for verification
  console.log("\nContract Address:", contractInfo.address);
  console.log(
    "Sepolia Etherscan:",
    `https://sepolia.etherscan.io/address/${contractInfo.address}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
