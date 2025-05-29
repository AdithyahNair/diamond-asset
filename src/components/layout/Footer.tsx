import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Logo = () => (
  <Link to="/" className="flex items-center">
    <div className="flex items-center">
      <img
        src="/images/aquaduct.png"
        alt="Aquaduct"
        className="h-8 brightness-0 invert"
      />
    </div>
  </Link>
);

const SocialIcon = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 flex items-center justify-center rounded-full border border-cyan-400/20 text-cyan-400 hover:bg-cyan-400/10 transition-colors duration-300"
  >
    {children}
  </a>
);

const Footer = () => {
  return (
    <footer className="relative bg-black overflow-hidden">
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

      {/* Final CTA Section */}
      <div className="relative bg-gradient-to-b from-black via-black to-black">
        <div className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">
              Join the Timeless Experience
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Be part of a community that understands and appreciates the true
              value of timeless assets.
            </p>
            <div className="flex flex-col items-center space-y-4">
              <p className="text-white/60">Ready to join?</p>
              <Link to="/collection/turtle-timepiece-genesis">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-cyan-400 text-navy-900 text-lg font-medium rounded-full hover:bg-cyan-500 transition-colors duration-300"
                >
                  Become a Member
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <Logo />
            <p className="text-white/60 text-sm mt-4 md:mt-0">
              © {new Date().getFullYear()} Aquaduct. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
