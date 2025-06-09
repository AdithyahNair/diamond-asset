require("dotenv").config();
const pinataSDK = require("@pinata/sdk");
const fs = require("fs");
const path = require("path");

// Initialize Pinata client
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_KEY,
});

async function uploadMetadata() {
  try {
    // Path to metadata folder
    const metadataPath = path.join(__dirname, "../contracts/metadata");

    // Upload the metadata folder to IPFS through Pinata
    const result = await pinata.pinFromFS(metadataPath);

    console.log("Metadata folder uploaded successfully!");
    console.log("IPFS CID:", result.IpfsHash);
    console.log("Base URI to set:", `ipfs://${result.IpfsHash}/`);

    return result.IpfsHash;
  } catch (error) {
    console.error("Error uploading metadata:", error);
    throw error;
  }
}

// Execute the upload
uploadMetadata()
  .then((directoryCID) => {
    console.log("\nNext steps:");
    console.log(
      "1. Call setBaseURI on the contract with:",
      `ipfs://${directoryCID}/`
    );
    console.log(
      "2. Verify the metadata is accessible at:",
      `https://ipfs.io/ipfs/${directoryCID}/1.json`
    );
  })
  .catch(console.error);
