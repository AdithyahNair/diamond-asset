import React from 'react';
import { Cpu, Music, Camera, Brush, GamepadIcon, Globe } from 'lucide-react';

const categories = [
  {
    id: 1,
    name: "Digital Art",
    icon: <Brush size={24} />,
    image: "https://images.pexels.com/photos/7034109/pexels-photo-7034109.jpeg",
    count: 12875
  },
  {
    id: 2,
    name: "Music",
    icon: <Music size={24} />,
    image: "https://images.pexels.com/photos/1626481/pexels-photo-1626481.jpeg",
    count: 5324
  },
  {
    id: 3,
    name: "Photography",
    icon: <Camera size={24} />,
    image: "https://images.pexels.com/photos/1036808/pexels-photo-1036808.jpeg",
    count: 7852
  },
  {
    id: 4,
    name: "Virtual Worlds",
    icon: <Globe size={24} />,
    image: "https://images.pexels.com/photos/6976943/pexels-photo-6976943.jpeg",
    count: 3210
  },
  {
    id: 5,
    name: "Gaming",
    icon: <GamepadIcon size={24} />,
    image: "https://images.pexels.com/photos/7915357/pexels-photo-7915357.jpeg",
    count: 6527
  },
  {
    id: 6,
    name: "AI Generated",
    icon: <Cpu size={24} />,
    image: "https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg",
    count: 4836
  }
];

const Categories = () => {
  return (
    <section className="section-padding bg-black/30" id="explore">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Categories</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Browse through our diverse range of carefully curated NFT categories
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="glass-card group overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
            >
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#8A33FD]/20 p-2 rounded-lg text-[#8A33FD]">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-bold">{category.name}</h3>
                  </div>
                  <span className="text-gray-400 text-sm">{category.count} items</span>
                </div>
                
                <button className="w-full mt-3 btn-secondary group-hover:bg-[#8A33FD] group-hover:text-white transition-colors duration-300">
                  Browse Category
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;