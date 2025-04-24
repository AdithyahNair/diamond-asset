import React from 'react';
import { Star, Award, TrendingUp } from 'lucide-react';

// Sample artists data
const featuredArtists = [
  {
    id: 1,
    name: "Elena Bright",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
    background: "https://images.pexels.com/photos/1774986/pexels-photo-1774986.jpeg",
    artworks: 126,
    followers: "45.8K",
    verified: true,
    featured: true
  },
  {
    id: 2,
    name: "Michael Rivera",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
    background: "https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg",
    artworks: 93,
    followers: "28.2K",
    verified: true,
    featured: false
  },
  {
    id: 3,
    name: "Jessica Chen",
    avatar: "https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg",
    background: "https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg",
    artworks: 78,
    followers: "33.5K",
    verified: true,
    featured: false
  }
];

const ArtistSpotlight = () => {
  return (
    <section className="section-padding" id="artists">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Artist Spotlight</h2>
            <p className="text-gray-400 max-w-xl">
              Discover the creative minds behind the most extraordinary NFT collections
            </p>
          </div>
          <button className="btn-secondary">View All Artists</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredArtists.map((artist) => (
            <div 
              key={artist.id} 
              className={`glass-card overflow-hidden group hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 ${
                artist.featured ? 'border-2 border-[#FFD700]' : ''
              }`}
            >
              {/* Background Image */}
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={artist.background} 
                  alt={`${artist.name}'s artwork`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                
                {artist.featured && (
                  <div className="absolute top-3 left-3 bg-[#FFD700] text-black font-medium rounded-full py-1 px-3 flex items-center space-x-1">
                    <Star size={14} />
                    <span className="text-xs">Featured Artist</span>
                  </div>
                )}
              </div>
              
              {/* Profile Section */}
              <div className="relative px-6 pb-6">
                {/* Avatar */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#171429]">
                    <img 
                      src={artist.avatar} 
                      alt={artist.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
                
                {/* Artist Info */}
                <div className="pt-16 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <h3 className="text-xl font-bold">{artist.name}</h3>
                    {artist.verified && (
                      <div className="ml-2 text-[#8A33FD]">
                        <Award size={16} fill="#8A33FD" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center space-x-6 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Artworks</p>
                      <p className="font-medium">{artist.artworks}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Followers</p>
                      <p className="font-medium">{artist.followers}</p>
                    </div>
                  </div>
                  
                  <button className="btn-secondary w-full group-hover:bg-[#8A33FD] group-hover:text-white transition-colors duration-300">
                    Follow Artist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 glass-card p-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="mb-6 md:mb-0 md:mr-8">
              <div className="bg-[#8A33FD]/20 p-3 rounded-full mb-4 inline-block">
                <TrendingUp size={24} className="text-[#8A33FD]" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Become a Featured Artist</h3>
              <p className="text-gray-400 max-w-lg">
                Get discovered by thousands of collectors and enthusiasts. Submit your portfolio for review and stand a chance to be featured.
              </p>
            </div>
            <div className="flex-shrink-0">
              <button className="btn-primary">Apply Now</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtistSpotlight;