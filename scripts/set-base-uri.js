require("dotenv").config();
const { ethers } = require("ethers");
const contractInfo = require("../contract-info.json");

async function setBaseURI(baseURI) {
  try {
    // Validate environment variables
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY not set in .env file");
    }

    // Always default to mainnet
    const MAINNET_RPC = process.env.MAINNET_RPC_URL || process.env.RPC_URL;
    if (!MAINNET_RPC) {
      throw new Error("No mainnet RPC URL found in environment variables");
    }

    // Connect to mainnet
    const provider = new ethers.JsonRpcProvider(MAINNET_RPC);
    const network = await provider.getNetwork();

    // FORCE mainnet only
    if (network.chainId !== 1n) {
      throw new Error(
        "MUST USE MAINNET. This script only runs on Ethereum mainnet."
      );
    }

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("\n🌐 Connected to: Ethereum Mainnet");
    console.log("📝 Using wallet address:", wallet.address);

    // Get contract instance
    const contract = new ethers.Contract(
      contractInfo.address,
      contractInfo.abi,
      wallet
    );

    // Validate baseURI format
    if (!baseURI.startsWith("ipfs://") || !baseURI.endsWith("/")) {
      throw new Error(
        "Invalid baseURI format. Must start with 'ipfs://' and end with '/'"
      );
    }

    // Get current baseURI for comparison
    const currentBaseURI = await contract._baseURI();
    console.log("\n📍 Current base URI:", currentBaseURI);
    console.log("🎯 New base URI to set:", baseURI);

    // Confirm if this is a change
    if (currentBaseURI === baseURI) {
      console.log(
        "⚠️ Base URI is already set to this value. No change needed."
      );
      return;
    }

    // Get current gas price and estimate transaction cost
    const feeData = await provider.getFeeData();
    const gasEstimate = await contract.setBaseURI.estimateGas(baseURI);
    const gasCost = gasEstimate * feeData.gasPrice;

    console.log("\n⛽ Gas Estimates:");
    console.log("   - Gas Units:", gasEstimate.toString());
    console.log(
      "   - Gas Price:",
      ethers.formatUnits(feeData.gasPrice, "gwei"),
      "gwei"
    );
    console.log("   - Est. Cost:", ethers.formatEther(gasCost), "ETH");

    // Extra confirmation for mainnet
    console.log(
      "\n⚠️ MAINNET TRANSACTION - Please verify all details above before proceeding"
    );
    console.log("Waiting 10 seconds before sending transaction...");
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Set the base URI
    console.log("\n🚀 Sending transaction...");
    const tx = await contract.setBaseURI(baseURI);
    console.log("📝 Transaction hash:", tx.hash);

    // Wait for more confirmations on mainnet
    console.log("\n⏳ Waiting for 5 block confirmations (mainnet security)...");
    await tx.wait(5);
    console.log("✅ Base URI set successfully!");

    // Verify the change
    console.log("\n🔍 Verifying metadata accessibility...");
    const tokenURI = await contract.tokenURI(1);
    console.log("📄 Token #1 URI:", tokenURI);

    // Verify metadata is accessible
    try {
      const ipfsGatewayUrl = tokenURI.replace(
        "ipfs://",
        "https://ipfs.io/ipfs/"
      );
      const response = await fetch(ipfsGatewayUrl);
      if (!response.ok) {
        console.warn("⚠️ Warning: Metadata not accessible via IPFS gateway");
      } else {
        console.log("✅ Metadata is accessible via IPFS gateway");
      }
    } catch (error) {
      console.warn(
        "⚠️ Warning: Could not verify metadata accessibility:",
        error.message
      );
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    throw error;
  }
}

// Check if baseURI was provided as command line argument
const baseURI = process.argv[2];
if (!baseURI) {
  console.error("\n❌ Please provide the base URI as a command line argument");
  console.error("Example: node scripts/set-base-uri.js ipfs://QmYourCID/");
  process.exit(1);
}

// Execute the script
console.log("\n🔒 MAINNET DEPLOYMENT - Setting Base URI");
console.log("=======================================");

setBaseURI(baseURI)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Fatal Error:", error.message);
    process.exit(1);
  });
