import React from "react";
import { motion } from "framer-motion";

type IconComponent = () => JSX.Element;

interface BenefitCardProps {
  icon: IconComponent;
  title: string;
  benefits: string[];
  delay: number;
}

interface BenefitItem {
  icon: IconComponent;
  title: string;
  benefits: string[];
}

const CoCreateIcon = () => (
  <svg
    className="w-16 h-16"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="32"
      cy="32"
      r="30"
      stroke="currentColor"
      strokeWidth="2"
      strokeOpacity="0.2"
    />
    <path
      d="M20,32 C20,26 25,22 32,22 C39,22 44,26 44,32"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="32" cy="32" r="4" fill="currentColor" />
  </svg>
);

const CollectIcon = () => (
  <svg
    className="w-16 h-16"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16,32 L32,16 L48,32 L32,48 L16,32Z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path d="M24,32 L32,24 L40,32 L32,40 L24,32Z" fill="currentColor" />
  </svg>
);

const ConnectIcon = () => (
  <svg
    className="w-16 h-16"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="22" cy="32" r="6" fill="currentColor" />
    <circle cx="42" cy="32" r="6" fill="currentColor" />
    <path d="M28,32 L36,32" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const BenefitCard: React.FC<BenefitCardProps> = ({
  icon: Icon,
  title,
  benefits,
  delay,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-black/50 rounded-2xl p-8 border border-cyan-400/10 hover:border-cyan-400/30 transition-colors duration-300 relative group"
    >
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Top accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      <div className="flex flex-col items-center text-center relative">
        <div className="text-cyan-400 mb-6">
          <Icon />
        </div>
        <h3 className="font-serif text-2xl text-white mb-6">{title}</h3>
        <ul className="space-y-4 text-white/80">
          {benefits.map((benefit: string, index: number) => (
            <li key={index} className="leading-relaxed">
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const Benefits = () => {
  const benefits: BenefitItem[] = [
    {
      icon: CoCreateIcon,
      title: "Co-create",
      benefits: [
        "Engage in a behind the scenes experience where we will design a one-of-a-kind jewelry brooch crafted by the talented jewelry designer Jean Paul Xavier",
        "Shape the creative direction by voting on design elements such as motifs to be etched on the shell. Your ideas will leave a permanent imprint on what we build together",
      ],
    },
    {
      icon: CollectIcon,
      title: "Collect",
      benefits: [
        "Own a piece of history. Gain exclusive access to our curated vault of timeless assets, beginning with pink diamonds from Australia's now-closed Argyle mine",
        "Every piece in the collection is a part of a greater narrative, offering provenance, scarcity, and emotional resonance",
      ],
    },
    {
      icon: ConnectIcon,
      title: "Connect",
      benefits: [
        "Join an intimate community of gem lovers, art collectors and industry experts",
        "Meet in person at the unveiling of the Turtle and future events",
        "24/7 access to certified gemologists and diamond experts",
      ],
    },
  ];

  return (
    <section
      id="membership-benefits"
      className="relative py-8 md:py-12 bg-black overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-radial from-cyan-400/5 to-transparent opacity-30" />
        <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-radial from-cyan-400/5 to-transparent opacity-30" />
      </div>

      <div className="container mx-auto px-6">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-3">
            Membership Benefits
          </h2>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mb-8" />
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              benefits={benefit.benefits}
              delay={index * 0.2}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
