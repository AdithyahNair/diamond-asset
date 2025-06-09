const pinataSDK = require("@pinata/sdk");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Initialize Pinata client
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_KEY,
});

async function uploadVideo(videoPath) {
  try {
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      console.error("Video file not found:", videoPath);
      return;
    }

    // Upload the video file to IPFS through Pinata
    const result = await pinata.pinFromFS(videoPath);

    console.log("Video uploaded successfully!");
    console.log("IPFS CID:", result.IpfsHash);
    console.log("IPFS URL:", `ipfs://${result.IpfsHash}`);

    // Test URLs
    console.log("\nYou can test the video at these gateways:");
    console.log(`https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
    console.log(`https://ipfs.io/ipfs/${result.IpfsHash}`);
    console.log(`https://dweb.link/ipfs/${result.IpfsHash}`);

    return result.IpfsHash;
  } catch (error) {
    console.error("Error uploading video:", error);
  }
}

// Get video path from command line
const videoPath = process.argv[2];
if (!videoPath) {
  console.error("Please provide the path to your video file");
  console.error("Usage: node upload-video.js path/to/your/video.mp4");
  process.exit(1);
}

uploadVideo(videoPath);
