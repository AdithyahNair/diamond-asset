const fs = require("fs");
const path = require("path");

const VIDEO_CID = "QmPvMK2GW1s9dfNN3aBV7MW41k9XshDDXY31VV81RhUYtr";
const IMAGE_CID = "bafybeihsdpkdbyyeaqkvilr4ikfl6aduuabofk4we5aqgocx5dnu56aqfa";
const METADATA_DIR = path.join(__dirname, "../contracts/metadata");

async function updateMetadata() {
  try {
    // Read all files in the metadata directory
    const files = fs.readdirSync(METADATA_DIR);

    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(METADATA_DIR, file);
        const metadata = JSON.parse(fs.readFileSync(filePath, "utf8"));

        // Update the metadata with both image and video URLs
        metadata.image = `ipfs://${IMAGE_CID}`;
        metadata.animation_url = `ipfs://${VIDEO_CID}`;

        // Write the updated metadata back to file
        fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
        console.log(`Updated ${file} with new image and video CIDs`);
      }
    }

    console.log("\nAll metadata files updated successfully!");
    console.log("Image URL:", `ipfs://${IMAGE_CID}`);
    console.log("Video URL:", `ipfs://${VIDEO_CID}`);
    console.log("\nNext steps:");
    console.log(
      "1. Upload the updated metadata folder to IPFS using upload-metadata.js"
    );
    console.log(
      "2. Set the new metadata folder CID as the base URI in your contract"
    );
  } catch (error) {
    console.error("Error updating metadata:", error);
  }
}

updateMetadata();
