import React, { useEffect } from "react";
import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <nav className="absolute top-0 left-0 w-full z-50 px-6 py-8">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-3xl font-serif text-white">
          Aquaduct
        </a>
        <div className="hidden md:flex space-x-8">
          {["Collections", "About", "Journal", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-white hover:text-gold-400 transition-colors duration-300 text-lg"
            >
              {item}
            </a>
          ))}
        </div>
        <button className="md:hidden text-white">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
};

const Hero = () => {
  useEffect(() => {
    // Add scroll animation logic here if needed
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-navy-900">
      {/* Navigation */}
      <Navbar />

      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-black opacity-40 z-10" />
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

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 h-screen flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-tight mb-6">
            Timeless <span className="text-gold-400">Elegance</span>
          </h1>
          <h2 className="font-serif text-2xl md:text-3xl text-white/90 mb-8">
            Where luxury meets legacy
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl font-light leading-relaxed">
            Discover our curated collection of exquisite jewelry pieces, each
            telling a unique story of craftsmanship and timeless beauty.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gold-400 text-navy-900 text-lg font-medium rounded-full hover:bg-gold-500 transition-colors duration-300"
          >
            Explore Collection
          </motion.button>
        </motion.div>
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
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
