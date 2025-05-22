const pinataSDK = require("@pinata/sdk");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Initialize Pinata client
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_KEY,
});

async function uploadImage(imagePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.error("Image file not found:", imagePath);
      return;
    }

    // Upload the image file to IPFS through Pinata
    const result = await pinata.pinFromFS(imagePath);

    console.log("Image uploaded successfully!");
    console.log("IPFS CID:", result.IpfsHash);
    console.log("IPFS URL:", `ipfs://${result.IpfsHash}`);
    console.log(
      "Gateway URL:",
      `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    );

    return result.IpfsHash;
  } catch (error) {
    console.error("Error uploading image:", error);
  }
}

// Get image path from command line argument
const imagePath = process.argv[2];
if (!imagePath) {
  console.error("Please provide the image path as an argument");
  console.log("Usage: node upload-image.js path/to/your/image.png");
  process.exit(1);
}

uploadImage(imagePath);
