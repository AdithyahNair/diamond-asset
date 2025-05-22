import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getNftsOwnedBy } from "../../lib/nftContract";
import { ethers } from "ethers";

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

interface ImageUrls {
  primary: string;
  fallbacks: string[];
}

interface NFT {
  id: number;
  tokenURI: string;
  metadata: NFTMetadata | null;
  imageUrl: ImageUrls | null;
  forSale: boolean;
  prePurchaser: string;
  canClaim?: boolean;
}

const MyNFTs: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { walletAddress, isWalletConnected } = useAuth();

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!isWalletConnected || !walletAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const provider = new ethers.BrowserProvider(window.ethereum);
        const ownedNFTs = await getNftsOwnedBy(provider, walletAddress);
        console.log("[DEBUG] Owned NFTs:", ownedNFTs);

        // Map through NFTs and log each one's metadata
        ownedNFTs.forEach((nft: any) => {
          console.log(`[DEBUG] NFT #${nft.id} metadata:`, nft.metadata);
          console.log(`[DEBUG] NFT #${nft.id} image URL:`, nft.imageUrl);
        });

        setNfts(ownedNFTs as NFT[]);
      } catch (err) {
        console.error("[DEBUG] Error fetching NFTs:", err);
        setError("Failed to load your NFTs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [walletAddress, isWalletConnected]);

  // Function to get IPFS gateway URL
  const getIPFSGatewayUrl = (ipfsUrl: string | undefined) => {
    if (!ipfsUrl) return undefined;

    // If it's already a gateway URL, return as is
    if (ipfsUrl.startsWith("http")) {
      return ipfsUrl;
    }

    // Convert IPFS URL to gateway URL
    const ipfsHash = ipfsUrl.replace("ipfs://", "");
    const gatewayUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
    console.log("Converting IPFS URL:", ipfsUrl, "to gateway URL:", gatewayUrl);
    return gatewayUrl;
  };

  // Function to handle image errors and try fallback URLs
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    nft: NFT,
    fallbackIndex: number = 0
  ) => {
    const target = e.target as HTMLImageElement;
    console.log(
      `[DEBUG] Image load error for NFT #${nft.id}, trying fallback ${fallbackIndex}`
    );

    // Try gateway URLs in order
    const gatewayUrls = [
      "https://ipfs.io/ipfs/",
      "https://cloudflare-ipfs.com/ipfs/",
      "https://dweb.link/ipfs/",
      "https://gateway.pinata.cloud/ipfs/",
    ];

    if (nft.metadata?.image) {
      const ipfsHash = nft.metadata.image.replace("ipfs://", "");
      if (fallbackIndex < gatewayUrls.length) {
        const fallbackUrl = `${gatewayUrls[fallbackIndex]}${ipfsHash}`;
        console.log(`[DEBUG] Using fallback URL:`, fallbackUrl);
        target.src = fallbackUrl;
        // Update onError to try next fallback
        target.onerror = (e) =>
          handleImageError(e as any, nft, fallbackIndex + 1);
      } else {
        console.log(`[DEBUG] No more fallbacks available, using placeholder`);
        target.src = "/images/placeholder.png";
        target.onerror = null; // Remove error handler to prevent loops
      }
    } else {
      target.src = "/images/placeholder.png";
      target.onerror = null;
    }
  };

  if (!isWalletConnected) {
    return (
      <div className="min-h-screen bg-[#0B1120] pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">My NFTs</h1>
            <p>Please connect your wallet to view your NFTs.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">My NFTs</h1>
            <p>Loading your NFTs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B1120] pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">My NFTs</h1>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] pt-32 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-white mb-8">My NFTs</h1>

        {nfts.length === 0 ? (
          <div className="text-center text-white">
            <p>You don't own any NFTs yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <div
                key={nft.id}
                className="bg-[#13111C] rounded-xl overflow-hidden"
              >
                <div className="aspect-square relative">
                  {nft.metadata?.image ? (
                    <img
                      src={getIPFSGatewayUrl(nft.metadata.image)}
                      alt={nft.metadata.name}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, nft)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {nft.metadata?.name || `NFT #${nft.id}`}
                  </h3>
                  {nft.metadata && (
                    <div className="text-gray-400">
                      <p className="mb-2">{nft.metadata.description}</p>
                      {nft.metadata.attributes?.map((attr, index) => (
                        <div key={index} className="text-sm mb-1">
                          <span className="text-gray-500">
                            {attr.trait_type}:
                          </span>{" "}
                          {attr.value}
                        </div>
                      ))}
                    </div>
                  )}
                  {nft.canClaim && (
                    <div className="mt-4">
                      <button className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        Claim NFT
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNFTs;
