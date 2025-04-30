const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Setting baseURI with account:", deployer.address);

  // Get the contract instance
  const contractAddress = "0xA05051F67E1a4D8f81A42f7131d1333432aF259C"; // Your deployed contract address
  const contract = await hre.ethers.getContractAt(
    "TurtleTimepieceNFT",
    contractAddress
  );

  // Set the baseURI to the video URL
  const baseURI =
    "https://purple-bright-chinchilla-487.mypinata.cloud/ipfs/bafybeia24wi54ltggaeq3524gdzjv77cxwmcpa64g45mclkfx3ccjednwm";

  // Set the base URI
  const tx = await contract.setBaseURI(baseURI);
  await tx.wait();

  console.log("Base URI set to:", baseURI);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
