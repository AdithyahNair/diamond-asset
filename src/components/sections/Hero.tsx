import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Hero = () => {
  useEffect(() => {
    // Add scroll animation logic here if needed
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black pt-20 sm:pt-6 md:pt-8">
      {/* Main Container */}
      <div className="container mx-auto px-4 sm:px-6 min-h-screen flex items-center">
        <div className="flex flex-col lg:flex-row w-full items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 lg:pr-8 mb-8 lg:mb-0 text-center lg:text-left"
          >
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-tight mb-4">
              The Timeless <span className="text-cyan-400">Experience</span>
            </h1>
            <h2 className="font-serif text-2xl md:text-3xl text-white/90 mb-4">
              Where luxury meets legacy
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-6 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
              Join an elite group of collectors and insiders. Get first-look
              access, private diamond viewings, and voting rights - all through
              one secure, digital pass.
            </p>
            <Link to="/collection/timeless-experience">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-cyan-400 text-navy-900 text-lg font-medium rounded-full hover:bg-cyan-500 transition-colors duration-300"
              >
                Become a member
              </motion.button>
            </Link>
          </motion.div>

          {/* Right Video */}
          <div className="w-full lg:w-1/2 relative flex items-center">
            <div className="rounded-2xl overflow-hidden shadow-2xl w-full">
              <video
                className="w-full h-auto object-cover"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/videos/nft-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
