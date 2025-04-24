import React, { useState } from "react";
import {
  ArrowLeft,
  Eye,
  Heart,
  Share2,
  RefreshCw,
  Minus,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import AuthModal from "../auth/AuthModal";

const CollectionDetails = () => {
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { isFullyAuthenticated, user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity < 8) setQuantity(quantity + 1);
  };

  const handlePurchase = () => {
    if (!isFullyAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    // If fully authenticated, add to cart
    addToCart({
      id: "turtle-timepiece-genesis",
      name: "Turtle Timepiece Genesis",
      price: 1.45,
      quantity,
      image: "/videos/nft-video.mp4",
    });

    // Open the cart after adding
    setIsCartOpen(true);
  };

  const handleMakeOffer = () => {
    if (!isFullyAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    // Handle make offer logic
    alert("Making an offer for Turtle Timepiece Genesis");
  };

  return (
    <>
      <div className="min-h-screen bg-[#0B1120] pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8 lg:px-20 xl:px-24">
          <Link
            to="/"
            className="inline-flex items-center text-gray-400 hover:text-white mb-8"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to collections
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Video */}
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-black/40">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="/videos/nft-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                <button
                  className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 ${
                    liked
                      ? "bg-red-500/20 text-red-500"
                      : "bg-black/20 text-gray-300 hover:bg-black/40"
                  }`}
                  onClick={() => setLiked(!liked)}
                >
                  <Heart size={20} fill={liked ? "currentColor" : "none"} />
                </button>

                <div className="flex gap-2">
                  <button className="p-3 rounded-full bg-black/20 backdrop-blur-md text-gray-300 hover:bg-black/40 transition-all duration-300">
                    <Share2 size={20} />
                  </button>
                  <button className="p-3 rounded-full bg-black/20 backdrop-blur-md text-gray-300 hover:bg-black/40 transition-all duration-300">
                    <RefreshCw size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div>
              <div className="mb-8">
                <div className="text-[#3BA7DB] text-sm mb-2">
                  Turtle Timepiece
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                  Turtle Timepiece Genesis
                </h1>

                <div className="flex items-center gap-6 text-gray-400">
                  <div className="flex items-center">
                    <Eye size={18} className="mr-2" />
                    <span>192 views</span>
                  </div>
                  <div className="flex items-center">
                    <Heart size={18} className="mr-2" />
                    <span>22 favorites</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#13111C]/60 p-6 rounded-xl mb-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">
                      Current Price
                    </div>
                    <div className="text-2xl font-bold text-white">
                      1.45 ETH{" "}
                      <span className="text-gray-400 text-lg">($5,075)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-sm mb-1">Available</div>
                    <div className="text-xl font-bold text-white">8 NFTs</div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-gray-400 text-sm mb-2 block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={decreaseQuantity}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="text-xl font-medium text-white min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={increaseQuantity}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {!isFullyAuthenticated && (
                  <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-800/30 rounded-lg text-yellow-300 text-sm">
                    {!user
                      ? "Please login to purchase this item"
                      : "Please connect your wallet to purchase this item"}
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={handlePurchase}
                    className="flex-1 bg-[#00BCD4] hover:bg-[#00ACC1] text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={handleMakeOffer}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-lg border border-white/10 transition-colors"
                  >
                    Make Offer
                  </button>
                </div>
              </div>

              <div className="bg-[#13111C]/60 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-4">
                  Description
                </h2>
                <p className="text-gray-300 mb-6">
                  Be part of history with this exclusive NFT that grants you
                  unprecedented access and privileges:
                </p>

                <div className="space-y-6">
                  <div className="flex gap-3">
                    <span className="text-[#FFD700]">✨</span>
                    <p className="text-gray-300">
                      One-of-a-Kind Collectible – A limited edition physical
                      piece designed by JPX, for you to carry with you as a
                      token of our appreciation.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-red-500">📹</span>
                    <p className="text-gray-300">
                      Exclusive Inauguration Event – Witness the unveiling of
                      the Turtle Timepiece, for the first time in history there
                      will be a public offering of a tokenized diamond and you
                      (and an additional guest) can be there to witness it.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-blue-500">💎</span>
                    <p className="text-gray-300">
                      Silent Auction Access – Only members will have the ability
                      to bid on the 7 Argyle stones housed by the turtle.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-purple-500">🖌️</span>
                    <p className="text-gray-300">
                      Co-Creation Influence – Participate in the artistic
                      development of the timeless turtle by influencing its
                      design details.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-green-500">🌐</span>
                    <p className="text-gray-300">
                      Exclusive Community – Connect with fellow collectors and
                      visionaries in this groundbreaking project.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default CollectionDetails;
