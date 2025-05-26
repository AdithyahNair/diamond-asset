import React from "react";
import { motion } from "framer-motion";
import { components } from "../../styles/designSystem";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  withContainer?: boolean;
  animate?: boolean;
  id?: string;
  style?: React.CSSProperties;
}

const Section: React.FC<SectionProps> = ({
  children,
  className = "",
  fullWidth = false,
  withContainer = true,
  animate = true,
  id,
  style,
}) => {
  const content = (
    <motion.div
      initial={animate ? components.animation.fadeUp.initial : undefined}
      whileInView={animate ? components.animation.fadeUp.animate : undefined}
      viewport={{ once: true }}
      transition={animate ? components.animation.fadeUp.transition : undefined}
      className={`${components.section} ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );

  if (!withContainer) {
    return content;
  }

  return (
    <section id={id} className={fullWidth ? "" : components.container}>
      {content}
    </section>
  );
};

export default Section;
