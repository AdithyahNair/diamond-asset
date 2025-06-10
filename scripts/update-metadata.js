const fs = require("fs");
const path = require("path");

// Constants for our assets
const IMAGE_CID = "bafybeihsdpkdbyyeaqkvilr4ikfl6aduuabofk4we5aqgocx5dnu56aqfa";
const VIDEO_CID = "QmPvMK2GW1s9dfNN3aBV7MW41k9XshDDXY31VV81RhUYtr";

async function updateMetadata() {
  try {
    const metadataPath = path.join(__dirname, "../contracts/metadata");
    const files = fs
      .readdirSync(metadataPath)
      .filter((file) => file.endsWith(".json"))
      .sort((a, b) => parseInt(a) - parseInt(b));

    console.log(`Found ${files.length} metadata files to update`);

    for (const file of files) {
      const tokenId = parseInt(file);
      const filePath = path.join(metadataPath, file);

      // Create metadata with OpenSea's expected format
      const metadata = {
        name: `Turtle Timepiece Genesis #${tokenId}`,
        description:
          "Number " +
          tokenId +
          " in the series of the Turtle Timepiece Collection. A timeless asset with historical significance.",
        image: `ipfs://${IMAGE_CID}`,
        animation_url: `ipfs://${VIDEO_CID}`,
        animation_type: "video/mp4",
        external_url: `https://ipfs.io/ipfs/${VIDEO_CID}`,
        background_color: "000000",
        attributes: [
          {
            trait_type: "Serial Number",
            value: `TT-${tokenId.toString().padStart(3, "0")}-GEN`,
          },
          {
            trait_type: "Media Type",
            value: "Video NFT",
          },
          {
            trait_type: "Collection",
            value: "Genesis",
          },
        ],
        properties: {
          files: [
            {
              uri: `ipfs://${VIDEO_CID}`,
              type: "video/mp4",
            },
            {
              uri: `ipfs://${IMAGE_CID}`,
              type: "image/png",
            },
          ],
          category: "video",
        },
      };

      // Write updated metadata
      fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
      console.log(`✅ Updated ${file}`);
    }

    console.log("\n✨ All metadata files updated successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Upload metadata folder to IPFS using upload-metadata.js");
    console.log("2. Set new baseURI on contract");
    console.log("3. Wait for IPFS propagation (~30 mins)");
    console.log("4. Test on OpenSea");
  } catch (error) {
    console.error("❌ Error updating metadata:", error);
    throw error;
  }
}

// Execute the update
updateMetadata().catch(console.error);
