const fs = require("fs");
const path = require("path");

const metadataDir = path.join(__dirname, "metadata");

function isIpfsUri(uri) {
  return typeof uri === "string" && uri.startsWith("ipfs://");
}

function checkMetadataFile(filename) {
  const filePath = path.join(metadataDir, filename);
  const content = fs.readFileSync(filePath, "utf8");
  let json;
  try {
    json = JSON.parse(content);
  } catch (e) {
    return { filename, valid: false, error: "Invalid JSON" };
  }
  const imageOk = isIpfsUri(json.image);
  const animOk = isIpfsUri(json.animation_url);
  return {
    filename,
    valid: imageOk && animOk,
    image: json.image,
    animation_url: json.animation_url,
    error: !imageOk
      ? "image field is not ipfs:// URI"
      : !animOk
      ? "animation_url field is not ipfs:// URI"
      : null,
  };
}

function main() {
  const files = fs.readdirSync(metadataDir).filter((f) => f.endsWith(".json"));
  let allValid = true;
  for (const file of files) {
    const result = checkMetadataFile(file);
    if (!result.valid) {
      allValid = false;
      console.error(`❌ ${file}: ${result.error}`);
    } else {
      console.log(`✅ ${file}: OK`);
    }
  }
  if (allValid) {
    console.log("\nAll metadata files are correctly formatted!");
  } else {
    console.log("\nSome metadata files have issues. See above.");
  }
}

main();
