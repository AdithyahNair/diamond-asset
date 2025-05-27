import React from "react";
import { motion } from "framer-motion";

// Benefit category icons
const CollectibleIcon = () => (
  <svg
    className="w-12 h-12"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M24 12L36 24L24 36L12 24L24 12Z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="24" cy="24" r="4" fill="currentColor" />
  </svg>
);

const FinancialIcon = () => (
  <svg
    className="w-12 h-12"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="24"
      cy="24"
      r="16"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M24 16V32M20 20H28M20 28H28"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const EventIcon = () => (
  <svg
    className="w-12 h-12"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="12"
      y="16"
      width="24"
      height="20"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M16 12V16M32 12V16M12 22H36"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const ArtisticIcon = () => (
  <svg
    className="w-12 h-12"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12,24 C12,16 18,12 24,12 C30,12 36,16 36,24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="24" cy="24" r="4" fill="currentColor" />
  </svg>
);

const CommunityIcon = () => (
  <svg
    className="w-12 h-12"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="24"
      cy="20"
      r="6"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M14,36 C14,31 18,28 24,28 C30,28 34,31 34,36"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

interface BenefitCardProps {
  icon: React.FC;
  title: string;
  benefits: string[];
  delay: number;
}

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
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-navy-800/50 rounded-2xl p-8 border border-gold-400/10 hover:border-gold-400/30 transition-all duration-300"
    >
      <div className="flex flex-col h-full">
        <div className="text-cyan-400 mb-6">
          <Icon />
        </div>
        <h3 className="text-2xl font-serif text-white mb-6">{title}</h3>
        <ul className="space-y-4 text-white/80 flex-grow">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <span className="text-cyan-400 mr-3">•</span>
              <span className="leading-relaxed">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const NftBenefits = () => {
  const benefits = [
    {
      icon: CollectibleIcon,
      title: "One of a kind collectible",
      benefits: ["Exclusive piece designed by JPX"],
    },
    {
      icon: FinancialIcon,
      title: "Financial Benefits",
      benefits: [
        "Discounts on any assets set on the turtle",
        "Discounts to producing a couture jewelry piece with JPX",
        "Priority access to future pieces made for Aquaduct",
      ],
    },
    {
      icon: EventIcon,
      title: "Event Benefits",
      benefits: [
        "Access to exclusive inauguration showcasing the piece",
        "Photo op with piece",
      ],
    },
    {
      icon: ArtisticIcon,
      title: "Artistic Involvement",
      benefits: [
        "Creative input in the design process of the turtle",
        "Input on inscriptions to be placed on the shell of the turtle",
      ],
    },
    {
      icon: CommunityIcon,
      title: "Community",
      benefits: ["Tapping into a network of other luxury asset members"],
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: "1px",
                height: "1px",
                backgroundColor: "#D4AF37",
                boxShadow: "0 0 15px 2px #D4AF37",
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-24">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">
            NFT Holder Benefits
          </h2>
          <p className="text-xl text-white/80 mb-8">
            An NFT collection will be launched for those of you interested in
            the storyline of the timeless turtle. Benefits to NFT holders:
          </p>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto" />
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              benefits={benefit.benefits}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NftBenefits;
