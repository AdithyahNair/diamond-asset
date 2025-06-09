const axios = require("axios");

async function testIPFSVideo(videoCID) {
  // List of IPFS gateways to try
  const gateways = [
    "https://ipfs.io/ipfs/",
    "https://gateway.pinata.cloud/ipfs/",
    "https://cloudflare-ipfs.com/ipfs/",
    "https://dweb.link/ipfs/",
  ];

  console.log("Testing video playback from different IPFS gateways...\n");

  for (const gateway of gateways) {
    const url = `${gateway}${videoCID}`;
    console.log(`Testing gateway: ${url}`);

    try {
      const response = await axios.head(url);
      console.log("✅ Gateway accessible");
      console.log("Content type:", response.headers["content-type"]);
      console.log("Content length:", response.headers["content-length"]);
      console.log("Status:", response.status);
      console.log("\nYou can test video playback at:");
      console.log(url);
      console.log("-------------------\n");
    } catch (error) {
      console.log("❌ Gateway failed");
      console.log("Error:", error.message);
      console.log("-------------------\n");
    }
  }
}

// Get video CID from command line or use default
const videoCID =
  process.argv[2] ||
  "bafybeihsdpkdbyyeaqkvilr4ikfl6aduuabofk4we5aqgocx5dnu56aqfa";

console.log(`Testing video CID: ${videoCID}\n`);
testIPFSVideo(videoCID);
