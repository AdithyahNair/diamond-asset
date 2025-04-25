import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Clock } from "lucide-react";

const CollectionsList = () => {
  return (
    <div className="min-h-screen bg-[#0B1120] pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-8 lg:px-20 xl:px-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            NFT Collection
          </h1>
          <p className="text-xl text-gray-400">
            Explore our exclusive collection of premium diamond NFTs
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Link
            to="/collections"
            className="block bg-[#13111C]/60 rounded-2xl p-8 hover:bg-[#13111C] transition-all duration-300 border border-white/10 hover:border-[#1E9AD3]/50"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-72 h-72 rounded-xl overflow-hidden flex-shrink-0">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="/videos/nft-video.mp4" type="video/mp4" />
                </video>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    Turtle Timepiece
                    <span className="text-[#1E9AD3] text-sm bg-[#1E9AD3]/10 px-3 py-1 rounded-full">
                      Genesis
                    </span>
                  </h3>
                  <ExternalLink size={24} className="text-gray-400" />
                </div>

                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  A groundbreaking collection featuring the world's first public
                  offering of a tokenized diamond, housed within an exquisite
                  turtle timepiece.
                </p>

                <div className="grid grid-cols-3 gap-8 mb-8">
                  <div className="bg-black/20 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Items</p>
                    <p className="text-2xl font-bold text-white">8</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Floor</p>
                    <p className="text-2xl font-bold text-white">1.25 ETH</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Volume</p>
                    <p className="text-2xl font-bold text-white">45.8 ETH</p>
                  </div>
                </div>

                <div className="flex items-center text-[#1E9AD3] bg-[#1E9AD3]/5 w-fit px-4 py-2 rounded-full">
                  <Clock size={18} className="mr-2" />
                  <span>Limited Time Collection</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CollectionsList;
