const { ethers } = require("ethers");
require("dotenv").config();
const contractInfo = require("../contract-info.json");

async function setBaseURI() {
  try {
    // Connect to the network
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Get contract instance
    const contract = new ethers.Contract(
      contractInfo.address,
      contractInfo.abi,
      wallet
    );

    // Set the base URI
    const baseURI = `ipfs://QmbgoDSbtuVqFxzoizjSGJKLKeF8DJ8cH4wEB84xiRSGiu/`;
    console.log("Setting base URI to:", baseURI);

    const tx = await contract.setBaseURI(baseURI);
    console.log("Transaction hash:", tx.hash);

    await tx.wait();
    console.log("Base URI set successfully!");
  } catch (error) {
    console.error("Error setting base URI:", error);
  }
}

setBaseURI();
