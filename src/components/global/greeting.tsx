"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const Greeting = ({ name }: { name: string }) => {
  const [greeting, setGreeting] = useState("");
  const fullText = `Initialize System... Welcome back, ${name}. Analyzing your loop.`;

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setGreeting(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [name]);

  return (
    <div className="mb-8">
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-mono text-cyan-500 text-sm tracking-widest uppercase mb-2"
      >
        Terminal_Online
      </motion.p>
      <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
        {greeting}
        <span className="animate-pulse">|</span>
      </h1>
    </div>
  );
};