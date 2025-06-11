const { ethers } = require("ethers");

async function main() {
  const PRIVATE_KEY = process.env.VITE_PRIVATE_KEY;

  if (!PRIVATE_KEY) {
    console.error("Please set VITE_PRIVATE_KEY environment variable");
    process.exit(1);
  }

  const wallet = new ethers.Wallet(PRIVATE_KEY);
  console.log("Contract Owner Address:", wallet.address);
}

main().catch(console.error);
