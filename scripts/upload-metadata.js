require("dotenv").config();
const pinataSDK = require("@pinata/sdk");
const fs = require("fs");
const path = require("path");

// Initialize Pinata client
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_KEY,
});

async function testPinataConnection() {
  try {
    const result = await pinata.testAuthentication();
    console.log("✅ Pinata connection successful:", result);
    return true;
  } catch (error) {
    console.error("❌ Pinata connection failed:", error.message);
    return false;
  }
}

async function validateMetadataFiles() {
  const metadataPath = path.join(__dirname, "../contracts/metadata");

  if (!fs.existsSync(metadataPath)) {
    throw new Error(`Metadata directory not found: ${metadataPath}`);
  }

  const files = fs
    .readdirSync(metadataPath)
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => parseInt(a) - parseInt(b)); // Sort numerically

  console.log(`Found ${files.length} metadata files:`, files);

  // Validate each JSON file
  for (const file of files) {
    try {
      const filePath = path.join(metadataPath, file);
      const content = JSON.parse(fs.readFileSync(filePath, "utf8"));

      // Check required fields for our specific case
      const requiredFields = [
        "name",
        "description",
        "image",
        "animation_url",
        "attributes",
      ];
      const missingFields = requiredFields.filter((field) => !content[field]);

      // Validate specific URLs
      const expectedImage =
        "https://ipfs.io/ipfs/bafybeihsdpkdbyyeaqkvilr4ikfl6aduuabofk4we5aqgocx5dnu56aqfa";
      const expectedVideo =
        "https://ipfs.io/ipfs/QmPvMK2GW1s9dfNN3aBV7MW41k9XshDDXY31VV81RhUYtr";

      if (content.image !== expectedImage) {
        console.warn(`⚠️  ${file} has incorrect image URL`);
      }

      if (content.animation_url !== expectedVideo) {
        console.warn(`⚠️  ${file} has incorrect video URL`);
      }

      if (missingFields.length > 0) {
        console.warn(`⚠️  ${file} missing fields:`, missingFields);
      } else {
        console.log(`✅ ${file} validated successfully`);
      }
    } catch (error) {
      console.error(`❌ Invalid JSON in ${file}:`, error.message);
    }
  }

  return files.length;
}

async function uploadMetadata() {
  try {
    // Test Pinata connection first
    const connectionOk = await testPinataConnection();
    if (!connectionOk) {
      throw new Error("Failed to connect to Pinata");
    }

    // Validate metadata files
    const fileCount = await validateMetadataFiles();
    if (fileCount === 0) {
      throw new Error("No metadata files found to upload");
    }
    if (fileCount !== 20) {
      // We expect exactly 20 NFTs
      throw new Error(`Expected 20 metadata files, but found ${fileCount}`);
    }

    // Path to metadata folder
    const metadataPath = path.join(__dirname, "../contracts/metadata");

    console.log("🚀 Uploading metadata folder to IPFS...");

    // Upload the metadata folder to IPFS through Pinata
    const options = {
      pinataMetadata: {
        name: "Turtle-Timepiece-Genesis-Metadata",
        keyvalues: {
          collection: "Turtle Timepiece",
          type: "metadata",
          count: fileCount.toString(),
          version: new Date().toISOString(), // Add version tracking
        },
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    const result = await pinata.pinFromFS(metadataPath, options);

    console.log("✅ Metadata folder uploaded successfully!");
    console.log("📁 IPFS CID:", result.IpfsHash);
    console.log("🔗 Base URI to set:", `ipfs://${result.IpfsHash}/`);
    console.log("🌐 Gateway URLs:");
    console.log(
      "   Pinata:",
      `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}/`
    );
    console.log("   IPFS.io:", `https://ipfs.io/ipfs/${result.IpfsHash}/`);

    // Test metadata files
    console.log("\n🧪 Testing metadata accessibility:");
    console.log(
      `Token 1: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}/1.json`
    );
    console.log(
      `Token 10: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}/10.json`
    );
    console.log(
      `Token 20: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}/20.json`
    );

    return result.IpfsHash;
  } catch (error) {
    console.error("❌ Error uploading metadata:", error);
    throw error;
  }
}

// Execute the upload
uploadMetadata()
  .then((directoryCID) => {
    console.log("\n📋 Next steps:");
    console.log(
      "1. 📝 Call setBaseURI on the contract with:",
      `ipfs://${directoryCID}/`
    );
    console.log(
      "2. ✅ Verify metadata is accessible at:",
      `https://gateway.pinata.cloud/ipfs/${directoryCID}/1.json`
    );
    console.log("3. 🔄 Wait ~30 minutes for IPFS propagation");
    console.log("4. 🔄 Refresh metadata on OpenSea");
    console.log("5. 📊 Check OpenSea collection page for proper display");
  })
  .catch(console.error);
