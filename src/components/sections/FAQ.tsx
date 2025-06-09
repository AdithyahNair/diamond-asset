import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

interface FAQItem {
  question: string;
  answer: string | JSX.Element;
}

const faqs: FAQItem[] = [
  {
    question: "What is the Timeless Experience?",
    answer:
      "The Timeless Experience is a token gated gems & jewelry community. Our members will have access to unrivaled gem & jewelry events, exclusive offers on the rarest and most sought after diamonds, and an elite community of industry experts, passionate collectors & jewelry lovers.",
  },
  {
    question: "How many memberships are available?",
    answer:
      "Only 88 Timeless Experience memberships are available. This limited quantity ensures a deeply personalized experience for each member.",
  },
  {
    question: "Is this a one-time purchase or an ongoing subscription?",
    answer:
      "The Timeless Experience is a one-time membership purchase that unlocks lifetime access to its benefits. However, some future offerings may have separate costs or optional upgrades.",
  },
  {
    question: "What is the connection between the turtle and the membership?",
    answer:
      "The turtle represents timeless wisdom and the journey across generations. In the narrative, it is the guardian of rare stones, traveling through time and dimensions to deliver them to their rightful custodians. As a member, you become part of this story and mission.",
  },
  {
    question: "Do I need to understand blockchain or NFTs to participate?",
    answer:
      "Not at all. While some benefits are powered by digital ownership, our onboarding makes it seamless, even for non-technical members. You'll receive step-by-step support to access and enjoy every aspect of your membership.",
  },
  {
    question: "Can I resell my membership?",
    answer:
      "Yes. Your membership is represented by a collectible digital pass, which can be resold on secondary marketplaces. However, resale may void some non-transferable benefits such as early co-creation rights.",
  },
  {
    question: "When and where can I use my membership?",
    answer:
      "Your membership unlocks experiences throughout the year, both online and in select global cities. You'll receive advance notice for each event or drop, and priority registration as a Timeless Member.",
  },
  {
    question: "Who is this for?",
    answer: (
      <ul className="space-y-2 list-none">
        <li className="flex items-start">
          <span className="text-cyan-400 mr-2">•</span>
          <span>Collectors of rare or meaningful assets</span>
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 mr-2">•</span>
          <span>Early believers in alternative investments</span>
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 mr-2">•</span>
          <span>Story-driven explorers of web3 and cultural capital</span>
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 mr-2">•</span>
          <span>Patrons looking to support a visionary community</span>
        </li>
      </ul>
    ),
  },
  {
    question: "How do I get started?",
    answer: (
      <>
        You can purchase your pass right{" "}
        <Link
          to="/collection/timeless-experience"
          className="text-cyan-400 hover:text-cyan-300"
        >
          here
        </Link>
        . Early bird pricing and perks are available for the first 20 members
        before June 23rd.
      </>
    ),
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative bg-black overflow-hidden py-8 md:py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Title */}
          <div className="text-left mb-6">
            <h2 className="font-serif text-4xl text-white mb-2">FAQs</h2>
            <p className="text-xl text-white/60">General</p>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-cyan-400/20 last:border-b-0"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-lg text-white hover:text-cyan-400 transition-colors">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 ml-4 text-cyan-400"
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-white/60 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
