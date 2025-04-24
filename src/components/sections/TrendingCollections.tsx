import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

// Sample data
const trendingCollections = [
  {
    id: 1,
    name: "Cosmic Dreamers",
    creator: "DreamLabs",
    mainImage: "https://images.pexels.com/photos/8721318/pexels-photo-8721318.jpeg",
    smallImages: [
      "https://images.pexels.com/photos/2156881/pexels-photo-2156881.jpeg",
      "https://images.pexels.com/photos/5022847/pexels-photo-5022847.jpeg",
      "https://images.pexels.com/photos/6577900/pexels-photo-6577900.jpeg",
    ],
    items: 1425,
    floorPrice: 0.85
  },
  {
    id: 2,
    name: "Neo Tokyo",
    creator: "CyberArtworks",
    mainImage: "https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg",
    smallImages: [
      "https://images.pexels.com/photos/347139/pexels-photo-347139.jpeg",
      "https://images.pexels.com/photos/7135121/pexels-photo-7135121.jpeg",
      "https://images.pexels.com/photos/5011647/pexels-photo-5011647.jpeg",
    ],
    items: 983,
    floorPrice: 1.25
  },
  {
    id: 3,
    name: "Abstract Dimensions",
    creator: "ArtMatrix",
    mainImage: "https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg",
    smallImages: [
      "https://images.pexels.com/photos/8084508/pexels-photo-8084508.jpeg",
      "https://images.pexels.com/photos/1573434/pexels-photo-1573434.jpeg",
      "https://images.pexels.com/photos/1910236/pexels-photo-1910236.jpeg",
    ],
    items: 2105,
    floorPrice: 0.65
  }
];

const TrendingCollections = () => {
  // State for mobile slider
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === trendingCollections.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? trendingCollections.length - 1 : prevIndex - 1
    );
  };

  return (
    <section className="section-padding" id="collections">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Trending Collections</h2>
            <p className="text-gray-400">Discover the most sought-after collections in the NFT space</p>
          </div>
          
          <div className="hidden md:flex gap-3">
            <button
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              onClick={prevSlide}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              onClick={nextSlide}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Desktop view - show all cards */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trendingCollections.map((collection) => (
            <div key={collection.id} className="glass-card p-4 transition-all duration-300 hover:translate-y-[-8px]">
              <div className="mb-4 rounded-xl overflow-hidden">
                <img 
                  src={collection.mainImage} 
                  alt={collection.name} 
                  className="w-full h-52 object-cover hover:scale-105 transition-transform duration-500" 
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {collection.smallImages.map((img, index) => (
                  <div key={index} className="rounded-lg overflow-hidden h-20">
                    <img 
                      src={img} 
                      alt={`${collection.name} preview ${index + 1}`} 
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                ))}
              </div>
              
              <h3 className="text-xl font-bold mb-1">{collection.name}</h3>
              <p className="text-gray-400 mb-3">by {collection.creator}</p>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Items</p>
                  <p className="font-medium">{collection.items}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Floor Price</p>
                  <p className="font-medium">{collection.floorPrice} ETH</p>
                </div>
                <button className="btn-secondary py-2 px-4 text-sm">View</button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile view - show one card at a time */}
        <div className="md:hidden relative">
          <div className="glass-card p-4">
            <div className="mb-4 rounded-xl overflow-hidden">
              <img 
                src={trendingCollections[currentIndex].mainImage} 
                alt={trendingCollections[currentIndex].name} 
                className="w-full h-52 object-cover" 
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              {trendingCollections[currentIndex].smallImages.map((img, index) => (
                <div key={index} className="rounded-lg overflow-hidden h-20">
                  <img 
                    src={img} 
                    alt={`preview ${index + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))}
            </div>
            
            <h3 className="text-xl font-bold mb-1">{trendingCollections[currentIndex].name}</h3>
            <p className="text-gray-400 mb-3">by {trendingCollections[currentIndex].creator}</p>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Items</p>
                <p className="font-medium">{trendingCollections[currentIndex].items}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Floor Price</p>
                <p className="font-medium">{trendingCollections[currentIndex].floorPrice} ETH</p>
              </div>
              <button className="btn-secondary py-2 px-4 text-sm">View</button>
            </div>
          </div>
          
          <div className="flex justify-center mt-6 gap-2">
            {trendingCollections.map((_, index) => (
              <button 
                key={index} 
                className={`w-2.5 h-2.5 rounded-full ${
                  index === currentIndex ? 'bg-[#8A33FD]' : 'bg-white/30'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
          
          <button
            className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 p-2 bg-white/10 backdrop-blur-md rounded-full z-10"
            onClick={prevSlide}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 p-2 bg-white/10 backdrop-blur-md rounded-full z-10"
            onClick={nextSlide}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrendingCollections;