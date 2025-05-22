const fs = require("fs");
const path = require("path");

const IMAGE_CID = "QmPzzdtq6d8ePiap59rX2f2t3ykbHbAdU8sfBZ59mxK79b";
const METADATA_DIR = path.join(__dirname, "../contracts/metadata");

async function updateMetadata() {
  try {
    // Read all files in the metadata directory
    const files = fs.readdirSync(METADATA_DIR);

    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(METADATA_DIR, file);
        const metadata = JSON.parse(fs.readFileSync(filePath, "utf8"));

        // Update the image URL
        metadata.image = `ipfs://${IMAGE_CID}`;
        metadata.animation_url = `ipfs://${IMAGE_CID}`;

        // Write the updated metadata back to file
        fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
        console.log(`Updated ${file} with new image CID`);
      }
    }

    console.log("\nAll metadata files updated successfully!");
    console.log(
      "Now you can run the upload-metadata.js script to upload the updated metadata to IPFS"
    );
  } catch (error) {
    console.error("Error updating metadata:", error);
  }
}

updateMetadata();
