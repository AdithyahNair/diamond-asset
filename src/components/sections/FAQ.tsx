import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is the Timeless Experience Membership NFT?",
    answer:
      "The Timeless Experience Membership NFT is your exclusive access pass to our curated collection of rare and valuable artifacts. It represents your position as a founding member of our community, giving you priority access to new releases and special benefits.",
  },
  {
    question: "What benefits do Timeless Experience Members receive?",
    answer:
      "Members get exclusive access to pre-sales, private viewings, community events, and the ability to participate in the curation of our collection. You'll also receive regular insights about rare artifacts and investment opportunities.",
  },
  {
    question: "Why is the membership offered as an NFT?",
    answer:
      "NFT technology allows us to provide verifiable ownership, transparent trading, and the ability to embed ongoing benefits into your membership. It also enables us to create a more engaging and interactive experience for our community.",
  },
  {
    question: "How do I mint the NFT?",
    answer:
      "You can mint the NFT directly through our platform using either cryptocurrency or traditional payment methods. The process is simple and guided - just connect your wallet or create an account to get started.",
  },
  {
    question: "When is the mint?",
    answer:
      "The minting period is currently active and will remain open until all founding memberships are claimed. We recommend joining early to secure your position in our community.",
  },
  {
    question: "How much does the Founding Membership NFT cost?",
    answer:
      "The founding membership NFT is priced to reflect its long-term value and the exclusive benefits it provides. Current pricing and available tiers can be viewed in our collections page.",
  },
  {
    question: "What blockchain is the NFT on?",
    answer:
      "Our NFTs are minted on the Ethereum blockchain, specifically on the Sepolia network, ensuring security, transparency, and wide compatibility with popular wallets and marketplaces.",
  },
  {
    question: "Can I transfer my Membership NFT to another wallet?",
    answer:
      "Yes, your membership NFT is transferable. However, some membership benefits may be tied to the original minting address for security purposes.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative bg-black overflow-hidden py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Title */}
          <div className="text-left mb-12">
            <h2 className="font-serif text-4xl text-white mb-4">FAQs</h2>
            <p className="text-xl text-white/60">
              Frequently Asked Questions About the Timeless Experience
              Membership NFT
            </p>
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
