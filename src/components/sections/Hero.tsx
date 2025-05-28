import React, { useEffect } from "react";
import { motion } from "framer-motion";

const Hero = () => {
  useEffect(() => {
    // Add scroll animation logic here if needed
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Main Container */}
      <div className="container mx-auto px-6 h-screen">
        <div className="flex h-full items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-1/2 pr-8"
          >
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-tight mb-4">
              The Timeless <span className="text-cyan-400">Experience</span>
            </h1>
            <h2 className="font-serif text-2xl md:text-3xl text-white/90 mb-4">
              Where luxury meets legacy
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-6 max-w-2xl font-light leading-relaxed">
              Join us on the journey to collect and curate our planets most
              historically desired artefacts.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-cyan-400 text-navy-900 text-lg font-medium rounded-full hover:bg-cyan-500 transition-colors duration-300"
            >
              Get My Membership
            </motion.button>
          </motion.div>

          {/* Right Video */}
          <div className="w-1/2 relative h-full flex items-center">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
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

      {/* Scroll Indicator */}
      <motion.div
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
