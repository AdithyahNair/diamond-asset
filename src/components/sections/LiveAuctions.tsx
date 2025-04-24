import React, { useState } from 'react';
import { Heart, Clock, ExternalLink } from 'lucide-react';

// Sample live auctions data
const liveAuctions = [
  {
    id: 1,
    name: "Celestial Harmony #3",
    creator: {
      name: "Aria Moon",
      avatar: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg"
    },
    image: "https://images.pexels.com/photos/3889855/pexels-photo-3889855.jpeg",
    currentBid: 2.55,
    endTime: new Date(Date.now() + 86400000 * 1.5), // 1.5 days from now
    likes: 183
  },
  {
    id: 2,
    name: "Digital Genesis",
    creator: {
      name: "Cryptic Art",
      avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg"
    },
    image: "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg",
    currentBid: 1.87,
    endTime: new Date(Date.now() + 86400000 * 0.5), // 12 hours from now
    likes: 137
  },
  {
    id: 3,
    name: "Neon Dreams",
    creator: {
      name: "Electro Visuals",
      avatar: "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"
    },
    image: "https://images.pexels.com/photos/2549537/pexels-photo-2549537.jpeg",
    currentBid: 3.22,
    endTime: new Date(Date.now() + 86400000 * 2), // 2 days from now
    likes: 256
  },
  {
    id: 4,
    name: "Future Relic",
    creator: {
      name: "Time Capsule",
      avatar: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg"
    },
    image: "https://images.pexels.com/photos/2440061/pexels-photo-2440061.jpeg",
    currentBid: 4.10,
    endTime: new Date(Date.now() + 86400000 * 0.25), // 6 hours from now
    likes: 321
  }
];

// Calculate remaining time
const getRemainingTime = (endTime) => {
  const total = Date.parse(endTime) - Date.parse(new Date().toString());
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  
  return {
    total,
    hours: hours < 10 ? `0${hours}` : hours,
    minutes: minutes < 10 ? `0${minutes}` : minutes,
    seconds: seconds < 10 ? `0${seconds}` : seconds
  };
};

const LiveAuctions = () => {
  // For likes functionality
  const [likedItems, setLikedItems] = useState<number[]>([]);
  
  const toggleLike = (id: number) => {
    if (likedItems.includes(id)) {
      setLikedItems(likedItems.filter(itemId => itemId !== id));
    } else {
      setLikedItems([...likedItems, id]);
    }
  };
  
  // Format for countdown
  const formatTime = (auction) => {
    const time = getRemainingTime(auction.endTime);
    return `${time.hours}h ${time.minutes}m`;
  };

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Live Auctions</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Bid on exclusive NFTs before they're gone. Don't miss your chance to own unique digital art.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {liveAuctions.map((auction) => (
            <div 
              key={auction.id} 
              className="glass-card overflow-hidden group hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={auction.image} 
                  alt={auction.name} 
                  className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                
                {/* Auction timer */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full py-1 px-3 flex items-center space-x-1">
                  <Clock size={14} className="text-[#FFD700]" />
                  <span className="text-sm font-medium">{formatTime(auction)}</span>
                </div>
                
                {/* Auction details overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex justify-between items-center">
                    <button className="bg-white/20 backdrop-blur-sm rounded-full py-2 px-4 text-sm hover:bg-white/30 transition-colors">
                      Place a bid
                    </button>
                    <button className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors">
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <img 
                    src={auction.creator.avatar} 
                    alt={auction.creator.name} 
                    className="w-8 h-8 rounded-full object-cover border-2 border-[#8A33FD]" 
                  />
                  <span className="text-sm text-gray-300">@{auction.creator.name}</span>
                </div>
                
                <h3 className="text-lg font-bold mb-2">{auction.name}</h3>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400">Current Bid</p>
                    <p className="text-base font-semibold">{auction.currentBid} ETH</p>
                  </div>
                  
                  <button 
                    className="flex items-center space-x-1"
                    onClick={() => toggleLike(auction.id)}
                  >
                    <Heart 
                      size={18} 
                      className={likedItems.includes(auction.id) ? "text-red-500 fill-red-500" : "text-gray-400"}
                    />
                    <span className="text-sm">
                      {likedItems.includes(auction.id) ? auction.likes + 1 : auction.likes}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <button className="btn-primary">View All Auctions</button>
        </div>
      </div>
    </section>
  );
};

export default LiveAuctions;