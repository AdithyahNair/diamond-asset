const fs = require("fs");
const path = require("path");

const baseMetadata = {
  description:
    "Number {number} in the series of the Turtle Timepiece Collection. A timeless asset with historical significance.",
  image: "ipfs://bafybeihsdpkdbyyeaqkvilr4ikfl6aduuabofk4we5aqgocx5dnu56aqfa",
  animation_url: "ipfs://QmPvMK2GW1s9dfNN3aBV7MW41k9XshDDXY31VV81RhUYtr",
  animation_type: "video/mp4",
  external_url:
    "https://ipfs.io/ipfs/QmPvMK2GW1s9dfNN3aBV7MW41k9XshDDXY31VV81RhUYtr",
  background_color: "000000",
};

// Generate metadata for tokens 4-20
for (let i = 4; i <= 20; i++) {
  const metadata = {
    ...baseMetadata,
    name: `Turtle Timepiece Genesis #${i}`,
    description: baseMetadata.description.replace("{number}", i),
    attributes: [
      {
        trait_type: "Serial Number",
        value: `TT-${i.toString().padStart(3, "0")}-GEN`,
      },
    ],
  };

  const filePath = path.join(
    __dirname,
    "..",
    "contracts",
    "metadata",
    `${i}.json`
  );
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
  console.log(`Generated metadata for token #${i}`);
}
