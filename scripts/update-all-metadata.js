const fs = require("fs");
const path = require("path");

const metadataDir = path.join(__dirname, "../contracts/metadata");
const videoCID = "QmPvMK2GW1s9dfNN3aBV7MW41k9XshDDXY31VV81RhUYtr";

// Update all metadata files
for (let i = 1; i <= 20; i++) {
  const filePath = path.join(metadataDir, `${i}.json`);

  // Format serial number with leading zeros
  const serialNum = i.toString().padStart(3, "0");

  const metadata = {
    name: `Turtle Timepiece Genesis #${i}`,
    description: `Number ${i} in the series of the Turtle Timepiece Collection. A timeless asset with historical significance.`,
    animation_url: `ipfs://${videoCID}`,
    animation_type: "video/mp4",
    external_url: `https://ipfs.io/ipfs/${videoCID}`,
    background_color: "000000",
    attributes: [
      {
        trait_type: "Serial Number",
        value: `TT-${serialNum}-GEN`,
      },
      {
        trait_type: "Media Type",
        value: "Video NFT",
      },
    ],
    properties: {
      files: [
        {
          uri: `ipfs://${videoCID}`,
          type: "video/mp4",
        },
      ],
      category: "video",
    },
  };

  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
}

console.log("Successfully updated all metadata files!");
