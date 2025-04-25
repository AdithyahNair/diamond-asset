import { ethers } from "ethers";
import contractInfo from "../../contract-info.json";

// The address of our deployed contract
export const NFT_CONTRACT_ADDRESS = contractInfo.address;

// The ABI (Application Binary Interface) of our contract
export const NFT_CONTRACT_ABI = contractInfo.abi;

// NFT price in ETH
export const NFT_PRICE = 0.001;

// Get the NFT contract instance
export const getNftContract = async (
  signer: ethers.Signer | ethers.providers.Provider
) => {
  return new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
};

// Get available NFTs
export const getAvailableNfts = async (provider: ethers.providers.Provider) => {
  try {
    const contract = await getNftContract(provider);
    const maxSupply = 8;
    const currentSupply = await contract.getTokenCount();

    return maxSupply - currentSupply.toNumber();
  } catch (error) {
    console.error("Error getting available NFTs:", error);
    return 0;
  }
};

// Purchase an NFT
export const purchaseNft = async (signer: ethers.Signer, recipient: string) => {
  try {
    const contract = await getNftContract(signer);
    const tx = await contract.mintWithETH(recipient, {
      value: ethers.utils.parseEther(NFT_PRICE.toString()),
    });

    return {
      success: true,
      transaction: tx,
      hash: tx.hash,
    };
  } catch (error) {
    console.error("Error purchasing NFT:", error);
    return {
      success: false,
      error: error.message || "Failed to purchase NFT",
    };
  }
};

// Get NFTs owned by an address
export const getNftsOwnedBy = async (
  provider: ethers.providers.Provider,
  address: string
) => {
  try {
    const contract = await getNftContract(provider);
    const totalSupply = await contract.getTokenCount();
    const ownedNfts = [];

    // This is a simplified approach - in a real app you might want to use events
    for (let i = 1; i <= totalSupply; i++) {
      try {
        const owner = await contract.ownerOf(i);
        if (owner.toLowerCase() === address.toLowerCase()) {
          const tokenURI = await contract.tokenURI(i);
          ownedNfts.push({
            id: i,
            tokenURI,
          });
        }
      } catch (err) {
        // Token might not exist or be burned
        console.warn(`Error checking token ${i}:`, err);
      }
    }

    return ownedNfts;
  } catch (error) {
    console.error("Error getting owned NFTs:", error);
    return [];
  }
};
