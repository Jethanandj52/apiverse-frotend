// src/components/AnimatedSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const AnimatedSection = ({ children, delay = 0, y = 40 }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
