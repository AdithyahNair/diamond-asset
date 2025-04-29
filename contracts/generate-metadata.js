const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Create metadata directory if it doesn't exist
const metadataDir = path.join(__dirname, "metadata");
if (!fs.existsSync(metadataDir)) {
  fs.mkdirSync(metadataDir, { recursive: true });
}

// Get the video CID from .env
const videoCID = process.env.IPFS_VIDEO_CID;
if (!videoCID) {
  console.error("Please set IPFS_VIDEO_CID in your .env file");
  process.exit(1);
}

// IPFS URL to the video
const videoUrl = `ipfs://${videoCID}`;
console.log(`Using video URL: ${videoUrl}`);

// Generate metadata for 8 NFTs
for (let i = 1; i <= 8; i++) {
  const metadata = {
    name: `Turtle Timepiece Genesis #${i}`,
    description: `Number ${i} in the series of the Turtle Timepiece Collection. A timeless asset with historical significance.`,
    image: videoUrl,
    animation_url: videoUrl,
    attributes: [
      {
        trait_type: "Collection",
        value: "Genesis",
      },
      {
        trait_type: "Rarity",
        value: i <= 2 ? "Legendary" : i <= 5 ? "Epic" : "Rare",
      },
      {
        trait_type: "Edition",
        value: `${i} of 8`,
      },
    ],
  };

  // Add unique attributes based on the NFT number
  if (i === 1) {
    metadata.attributes.push({
      trait_type: "Special Feature",
      value: "First Edition",
    });
  } else if (i === 8) {
    metadata.attributes.push({
      trait_type: "Special Feature",
      value: "Final Edition",
    });
  }

  // Add varying attributes to make each NFT unique
  metadata.attributes.push({
    trait_type: "Serial Number",
    value: `TT-${i.toString().padStart(3, "0")}-GEN`,
  });

  // Write metadata to file
  const metadataPath = path.join(metadataDir, `${i}.json`);
  try {
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`Generated metadata for NFT #${i}`);
  } catch (error) {
    console.error(`Error generating metadata for NFT #${i}:`, error.message);
    process.exit(1);
  }
}

console.log("\nAll metadata files generated successfully!");
console.log("\nNext steps:");
console.log("1. Upload the metadata folder to IPFS (Pinata)");
console.log("2. Set these values in your .env file:");
console.log(`   IPFS_VIDEO_CID=${videoCID}`);
console.log("   IPFS_METADATA_FOLDER_CID=<new-metadata-folder-cid>");
console.log("3. Run 'node contracts/set-base-uri.js' to update the contract");
