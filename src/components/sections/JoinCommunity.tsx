import React from 'react';
import { Send } from 'lucide-react';

const JoinCommunity = () => {
  return (
    <section className="section-padding bg-gradient-to-r from-[#13111C] to-[#2D1B69]" id="community">
      <div className="container mx-auto">
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image side */}
            <div className="h-64 lg:h-auto relative overflow-hidden">
              <img 
                src="https://images.pexels.com/photos/1279813/pexels-photo-1279813.jpeg" 
                alt="NFT Community" 
                className="w-full h-full object-cover absolute inset-0"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent lg:bg-gradient-to-l"></div>
              
              <div className="absolute inset-0 flex items-center justify-center p-6 lg:hidden">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">Join Our Community</h2>
                  <p className="text-gray-300 max-w-md">
                    Get exclusive updates, early access to drops, and connect with other NFT enthusiasts
                  </p>
                </div>
              </div>
            </div>
            
            {/* Content side */}
            <div className="p-8 md:p-10">
              <div className="hidden lg:block mb-8">
                <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
                <p className="text-gray-300 max-w-md">
                  Get exclusive updates, early access to drops, and connect with other NFT enthusiasts
                </p>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="your@email.com" 
                    className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A33FD] text-white placeholder-gray-400"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      placeholder="First Name" 
                      className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A33FD] text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      placeholder="Last Name" 
                      className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A33FD] text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer mt-2">
                    <input 
                      type="checkbox" 
                      className="form-checkbox h-4 w-4 rounded text-[#8A33FD]" 
                    />
                    <span className="text-sm text-gray-300">
                      I agree to receive news and updates
                    </span>
                  </label>
                </div>
                
                <button type="submit" className="btn-accent w-full flex items-center justify-center space-x-2">
                  <span>Subscribe</span>
                  <Send size={16} />
                </button>
                
                <p className="text-xs text-gray-400 text-center mt-4">
                  By signing up, you agree to our <a href="#" className="text-[#8A33FD]">Terms of Service</a> and <a href="#" className="text-[#8A33FD]">Privacy Policy</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinCommunity;