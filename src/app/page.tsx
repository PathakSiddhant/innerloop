"use client";

import React from "react";
import { NavbarFloating } from "@/components/landing/navbar-floating";
import { HeroParallax } from "@/components/landing/hero-parallax"; // Text Only
import { BentoFeatures } from "@/components/landing/bento-features"; // Six Pillars
import { MacbookScroll } from "@/components/landing/macbook-scroll"; // The 3D Dashboard
import { WorldMapSection } from "@/components/landing/world-map";
import { RichReviews } from "@/components/landing/reviews-rich";
import { CtaFooter } from "@/components/landing/cta-footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-black overflow-x-hidden selection:bg-indigo-500/30 font-sans">
      
      {/* 1. Navbar (With Theme Toggle) */}
      <NavbarFloating />

      {/* 2. Hero (Clean, Text Focused) */}
      <HeroParallax />

      {/* 3. Six Pillars (Bento Grid) */}
      <BentoFeatures />

      {/* 4. The 3D Dashboard Showcase (Replaces old Macbook scroll) */}
      <MacbookScroll />

      {/* 5. Global Reach */}
      <WorldMapSection />

      {/* 6. Reviews */}
      <RichReviews />

      {/* 7. Footer & FAQ */}
      <CtaFooter />
      
    </main>
  );
}