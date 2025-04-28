import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getNftsOwnedBy } from "../../lib/nftContract";
import { ethers } from "ethers";

interface NFT {
  id: number;
  tokenURI: string;
  metadata: any;
  imageUrl: string | null;
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
        setNfts(ownedNFTs);
      } catch (err) {
        console.error("Error fetching NFTs:", err);
        setError("Failed to load your NFTs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [walletAddress, isWalletConnected]);

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
                  {nft.imageUrl ? (
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src={nft.imageUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <span className="text-gray-400">No video available</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    NFT #{nft.id}
                  </h3>
                  {nft.metadata && (
                    <div className="text-gray-400">
                      <p className="mb-1">{nft.metadata.name}</p>
                      <p className="text-sm">{nft.metadata.description}</p>
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
