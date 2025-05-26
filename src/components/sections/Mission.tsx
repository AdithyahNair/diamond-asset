import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";

const Mission = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-navy-900 to-navy-800 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold-400 rounded-full blur-[128px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-400 rounded-full blur-[128px] translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative container mx-auto px-6 max-w-4xl" ref={ref}>
        <motion.div
          className="text-center space-y-12"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
          }}
        >
          {/* Title */}
          <motion.h2
            variants={fadeUpVariants}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-16"
          >
            The Timeless Experience
          </motion.h2>

          {/* Main content */}
          <motion.div
            variants={fadeUpVariants}
            className="space-y-8 text-lg md:text-xl"
          >
            <p className="text-white/80 leading-relaxed">
              In an age where diamond simulants flood the world and digital
              illusions blur the line between truth and imitation, a quiet
              crisis unfolds:
            </p>

            <p className="font-serif text-2xl md:text-3xl text-gold-400 leading-relaxed">
              The most meaningful treasures — true, storied, and rare — risk
              being forgotten.
            </p>

            <p className="text-white/80 leading-relaxed max-w-3xl mx-auto">
              The mission of Aquaduct is to ensure these timeless assets are not
              only preserved but passed on to worthy custodians that can honor
              and build on their legacy.
            </p>
          </motion.div>

          {/* Decorative line */}
          <motion.div variants={fadeUpVariants} className="pt-12">
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Mission;
