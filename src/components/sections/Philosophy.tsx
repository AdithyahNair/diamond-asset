import React from "react";
import { motion } from "framer-motion";

const WavePattern = () => (
  <svg
    width="200"
    height="40"
    viewBox="0 0 200 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="opacity-20"
  >
    <path
      d="M0 20C50 20 50 35 100 35C150 35 150 20 200 20C150 20 150 5 100 5C50 5 50 20 0 20Z"
      stroke="currentColor"
      strokeWidth="0.5"
      fill="none"
    />
  </svg>
);

const Philosophy = () => {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative py-24 md:py-32 bg-navy-900 overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute inset-0 text-gold-400">
        <div className="absolute left-0 top-0 w-full h-full flex flex-col gap-20 opacity-10 -rotate-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <WavePattern key={i} />
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div className="relative container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Title Section */}
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
              className="font-serif text-4xl md:text-5xl text-white mb-6"
            >
              The Timeless Turtle
            </motion.h2>
            <motion.div
              variants={fadeUpVariants}
              className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto"
            />
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: {
                transition: { staggerChildren: 0.2, delayChildren: 0.3 },
              },
            }}
            className="space-y-12"
          >
            {/* Introduction */}
            <motion.div variants={fadeUpVariants} className="space-y-6">
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed">
                And so, the Timeless Turtle was born - not of flesh and bone,
                but of wisdom and patience. It was created as a guardian of
                these rare assets, a steady guide across turbulent seas of time.
              </p>
            </motion.div>

            {/* Journey Description */}
            <motion.div variants={fadeUpVariants} className="space-y-6">
              <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                The turtle carries no rush in its stride. With ancient
                understanding, it bridges the gaps between distant custodians,
                awakens sleeping treasures, and gently carries them towards
                those who will cherish and protect them for years to come.
              </p>
            </motion.div>

            {/* Key Principles */}
            <motion.div
              variants={fadeUpVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="bg-navy-800/50 p-8 rounded-2xl border border-gold-400/10">
                <p className="text-xl font-serif text-gold-400 leading-relaxed">
                  Where markets become turbulent and short-sighted, the Turtle
                  brings steadiness.
                </p>
              </div>
              <div className="bg-navy-800/50 p-8 rounded-2xl border border-gold-400/10">
                <p className="text-xl font-serif text-gold-400 leading-relaxed">
                  Where value risks being misunderstood or lost, the turtle
                  perseveres its essence and ensures its safe passage.
                </p>
              </div>
            </motion.div>

            {/* Purpose Statement */}
            <motion.div variants={fadeUpVariants} className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-serif text-white mb-4">
                It's purpose is simple yet profound:
              </h3>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                To ensure that these extraordinary relics of history continue
                their rightful journey - not lost to obscurity, but placed in
                the hands of those who understand their true, lasting value.
              </p>
            </motion.div>

            {/* Closing Statement */}
            <motion.div variants={fadeUpVariants} className="relative">
              <div className="absolute left-0 top-1/2 w-2 h-24 bg-gradient-to-b from-gold-400/30 to-transparent -translate-y-1/2" />
              <blockquote className="pl-8 border-l-2 border-gold-400">
                <p className="text-2xl md:text-3xl font-serif text-gold-400 leading-relaxed">
                  In the world of fleeting trends, the Timeless Turtle moves at
                  its own deliberate pace, honoring the eternal nature of the
                  treasures it protects.
                </p>
              </blockquote>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              variants={{
                hidden: { scaleX: 0 },
                visible: { scaleX: 1 },
              }}
              transition={{ duration: 0.8 }}
              className="pt-12"
            >
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Turtle Path */}
      <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden">
        <svg
          viewBox="0 0 1200 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full opacity-10"
        >
          <path
            d="M0,50 C300,80 600,20 900,50 C1200,80 1500,20 1800,50"
            stroke="url(#turtle-path)"
            strokeWidth="0.5"
            fill="none"
          />
          <defs>
            <linearGradient id="turtle-path" x1="0" y1="0" x2="100%" y2="0">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
};

export default Philosophy;
