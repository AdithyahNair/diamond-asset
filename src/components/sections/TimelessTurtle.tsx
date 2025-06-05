import React, { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

const TimelessTurtle = () => {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section
      ref={sectionRef}
      className="relative py-4 md:py-6 bg-black overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-radial from-cyan-400/5 to-transparent opacity-30" />
      </div>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Video Column */}
          <motion.div
            ref={imageRef}
            className="relative order-2 lg:order-1 -mt-24"
            style={{ y: imageY }}
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/50">
              {/* Image gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-transparent mix-blend-overlay z-10" />

              {/* Image container with crop */}
              <div className="relative w-full h-[108%] -mb-[8%]">
                <img
                  src="/images/timeless-turtle.png"
                  alt="Timeless Turtle"
                  className="w-full h-full object-cover scale-100 transform"
                />
              </div>

              {/* Decorative elements */}
              <div className="absolute inset-0 rounded-2xl z-20" />
              <div className="absolute -inset-1 blur-xl opacity-20 z-20" />
            </div>
          </motion.div>

          {/* Content Column */}
          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <div className="space-y-8">
              <div className="space-y-6">
                <p className="text-xl md:text-2xl text-white/80 leading-relaxed">
                  With this mission in mind, we are creating the timeless
                  turtle. A guardian and guide, that will venture in space, time
                  and the metaverse to ensure these rare artifacts find their
                  next stewards.
                </p>
              </div>

              <div className="pt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="inline-block"
                >
                  <p className="text-2xl md:text-3xl font-serif text-cyan-400 leading-relaxed">
                    This is your invitation to become a founding member of the
                    Timeless Experience.
                  </p>
                </motion.div>
              </div>

              {/* Decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="pt-8"
              >
                <div className="h-[1px] w-24 bg-gradient-to-r from-cyan-400 to-transparent" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TimelessTurtle;
