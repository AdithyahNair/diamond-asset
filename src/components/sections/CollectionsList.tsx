import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Clock } from "lucide-react";
import { motion } from "framer-motion";

const CollectionsList = () => {
  return (
    <div className="min-h-screen bg-black pt-32 pb-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">
            NFT Collection
          </h1>
          <p className="text-xl text-white/60">
            Explore our exclusive collection of premium diamond NFTs
          </p>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mt-6" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <Link
            to="/collection/turtle-timepiece"
            className="block bg-black/50 rounded-2xl p-8 border border-cyan-400/20 hover:border-cyan-400/30 transition-all duration-300 relative group"
          >
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-400/30" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyan-400/30" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-cyan-400/30" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyan-400/30" />

            <div className="flex flex-col md:flex-row items-center gap-8 relative">
              <div className="w-full md:w-72 h-72 rounded-xl overflow-hidden flex-shrink-0 border border-cyan-400/20">
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
                  <h3 className="text-2xl font-serif text-white flex items-center gap-3">
                    Timeless Experience
                    <span className="text-cyan-400 text-sm bg-cyan-400/10 px-3 py-1 rounded-full">
                      Genesis
                    </span>
                  </h3>
                  <ExternalLink size={24} className="text-cyan-400" />
                </div>

                <p className="text-white/60 text-lg mb-8 leading-relaxed">
                  A groundbreaking collection featuring the world's first public
                  offering of a tokenized diamond, housed within an exquisite
                  turtle timepiece.
                </p>

                <div className="grid grid-cols-3 gap-8 mb-8">
                  <div className="bg-black/60 rounded-xl p-4 border border-cyan-400/20">
                    <p className="text-sm text-white/60 mb-1">Items</p>
                    <p className="text-2xl font-serif text-white">8</p>
                  </div>
                  <div className="bg-black/60 rounded-xl p-4 border border-cyan-400/20">
                    <p className="text-sm text-white/60 mb-1">Floor</p>
                    <p className="text-2xl font-serif text-white">1.25 ETH</p>
                  </div>
                  <div className="bg-black/60 rounded-xl p-4 border border-cyan-400/20">
                    <p className="text-sm text-white/60 mb-1">Volume</p>
                    <p className="text-2xl font-serif text-white">45.8 ETH</p>
                  </div>
                </div>

                <div className="flex items-center text-cyan-400 bg-cyan-400/10 w-fit px-4 py-2 rounded-full">
                  <Clock size={18} className="mr-2" />
                  <span>Limited Time Collection</span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default CollectionsList;
