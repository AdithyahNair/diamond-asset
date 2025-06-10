require("dotenv").config();
const { ethers } = require("ethers");
const contractInfo = require("../contract-info.json");

async function setBaseURI(baseURI) {
  try {
    // Validate environment variables
    if (!process.env.MAINNET_RPC_URL) {
      throw new Error("MAINNET_RPC_URL not set in .env file");
    }
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY not set in .env file");
    }

    console.log("\n🔒 MAINNET DEPLOYMENT - Setting Base URI");
    console.log("=======================================\n");

    // Connect to mainnet
    const provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL);
    const network = await provider.getNetwork();

    // Ensure we're on mainnet
    if (network.chainId !== 1n) {
      throw new Error(
        `Not connected to mainnet. Connected to chain ID: ${network.chainId}`
      );
    }

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`🌐 Connected to: Ethereum Mainnet`);
    console.log(`📝 Using wallet address: ${wallet.address}\n`);

    // Get contract instance
    const contract = new ethers.Contract(
      contractInfo.address,
      contractInfo.abi,
      wallet
    );

    // Estimate gas for the transaction
    const gasEstimate = await contract.setBaseURI.estimateGas(baseURI);
    console.log(`⛽ Estimated gas: ${gasEstimate} units`);

    // Get current gas price
    const gasPrice = await provider.getFeeData();
    const gasCostInWei = gasEstimate * gasPrice.gasPrice;
    const gasCostInEth = ethers.formatEther(gasCostInWei);
    console.log(`💰 Estimated cost: ${gasCostInEth} ETH\n`);

    // Confirmation delay
    console.log("⏳ Waiting 10 seconds before sending transaction...");
    console.log("   Press Ctrl+C to cancel\n");
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Send transaction
    console.log("🚀 Sending transaction to set base URI...");
    const tx = await contract.setBaseURI(baseURI);
    console.log(`📋 Transaction hash: ${tx.hash}`);

    // Wait for confirmation
    console.log("\n⏳ Waiting for 5 block confirmations...");
    const receipt = await tx.wait(5);

    console.log("\n✅ Base URI set successfully!");
    console.log(`📋 Transaction: https://etherscan.io/tx/${receipt.hash}`);
  } catch (error) {
    console.log("\n❌ Error:", error.message);
    console.log("\n❌ Fatal Error:", error.message);
    process.exit(1);
  }
}

// Get baseURI from command line argument
const baseURI = process.argv[2];
if (!baseURI) {
  console.error("Please provide the base URI as a command line argument");
  process.exit(1);
}

setBaseURI(baseURI);
