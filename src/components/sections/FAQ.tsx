import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How many memberships are available?",
    answer:
      "Only 88 Timeless Experience memberships are available. This limited quantity ensures exclusivity and a deeply personalized experience for each member.",
  },
  {
    question: "Is this a one-time purchase or an ongoing subscription?",
    answer:
      "The Timeless Experience is a one-time membership purchase that unlocks lifetime access to its benefits. However, some future experiences or assets may have separate costs or optional upgrades.",
  },
  {
    question: "Who is this for?",
    answer:
      "This membership is ideal for:\n• Collectors of rare or meaningful assets\n• Early believers in alternative investments\n• Story-driven explorers of web3 and cultural capital\n• Patrons looking to support a visionary community",
  },
  {
    question: "How do I get started?",
    answer:
      "You can purchase your pass right here. Early bird pricing and perks are available for the first 20 members before June 23rd.",
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
