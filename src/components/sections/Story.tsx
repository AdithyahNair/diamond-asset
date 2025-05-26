import React from "react";
import { motion } from "framer-motion";

// SVG pattern for the background
const DiamondPattern = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="opacity-[0.03]"
  >
    <path d="M20 0L40 20L20 40L0 20L20 0Z" fill="currentColor" />
  </svg>
);

const Story = () => {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative py-24 md:py-32 bg-navy-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 text-gold-400">
        <div className="absolute inset-0 flex flex-wrap -rotate-[15deg] scale-150 opacity-30">
          {Array.from({ length: 100 }).map((_, i) => (
            <DiamondPattern key={i} />
          ))}
        </div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-radial from-gold-400/5 to-transparent opacity-30" />
        <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-radial from-gold-400/5 to-transparent opacity-30" />
        {/* Dark gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-transparent to-navy-900" />
      </div>

      <div className="relative container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Main Title */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.2 } },
            }}
            className="text-center mb-20"
          >
            <motion.h2
              variants={fadeUpVariants}
              className="font-serif text-5xl md:text-6xl lg:text-7xl text-white mb-4"
            >
              Be a part of <span className="text-gold-400">history</span>
            </motion.h2>
            <motion.h3
              variants={fadeUpVariants}
              className="font-serif text-2xl md:text-3xl text-white/90"
            >
              Timeless Assets
            </motion.h3>
          </motion.div>

          {/* Story Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: {
                transition: { staggerChildren: 0.2, delayChildren: 0.3 },
              },
            }}
            className="space-y-8"
          >
            <motion.p
              variants={fadeUpVariants}
              className="text-lg md:text-xl text-white/80 leading-relaxed"
            >
              Since the dawn of time, there have existed treasures formed under
              immense pressure, heat and the patience of millennia.
            </motion.p>

            <motion.p
              variants={fadeUpVariants}
              className="text-lg md:text-xl text-white/80 leading-relaxed"
            >
              Diamonds are amongst the rarest and most enduring assets in the
              natural world. They have witnessed the rise and fall of empires,
              been passed through the hands of monarchs and merchants alike, yet
              have always remained difficult to truly place.
            </motion.p>

            <motion.p
              variants={fadeUpVariants}
              className="text-2xl md:text-3xl font-serif text-gold-400 leading-relaxed"
            >
              Because while diamonds are forever, their custodians are not.
            </motion.p>

            <motion.p
              variants={fadeUpVariants}
              className="text-lg md:text-xl text-white/80 leading-relaxed"
            >
              The world changes. Custodians come and go. But these timeless
              assets often fall into slumber, hidden away in vaults, lost in
              uncertain markets, waiting for a worthy hand to carry them
              forward.
            </motion.p>

            {/* Decorative line */}
            <motion.div
              variants={{
                hidden: { scaleX: 0 },
                visible: { scaleX: 1 },
              }}
              transition={{ duration: 0.8 }}
              className="pt-8"
            >
              <div className="h-[1px] w-24 bg-gradient-to-r from-gold-400 to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Diamond */}
      <div className="absolute bottom-0 right-0 transform translate-y-1/2 translate-x-1/2 opacity-10">
        <svg
          width="400"
          height="400"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M200 0L400 200L200 400L0 200L200 0Z"
            fill="url(#diamond-gradient)"
          />
          <defs>
            <linearGradient
              id="diamond-gradient"
              x1="0"
              y1="0"
              x2="400"
              y2="400"
            >
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
};

export default Story;
