"use client";
import { cn } from "@/lib/utils";
import React from "react";

export const NeonCard = ({
  children,
  className,
  color = "blue", // blue, purple, emerald
}: {
  children: React.ReactNode;
  className?: string;
  color?: "blue" | "purple" | "emerald" | "red";
}) => {
  const shadowColor = {
    blue: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]",
    purple: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
    emerald: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    red: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]",
  };

  const borderColor = {
    blue: "group-hover:border-blue-500/50",
    purple: "group-hover:border-purple-500/50",
    emerald: "group-hover:border-emerald-500/50",
    red: "group-hover:border-red-500/50",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-950 p-6 transition-all duration-500",
        shadowColor[color],
        borderColor[color],
        className
      )}
    >
      {/* Moving Beam Effect inside card */}
      <div className="absolute -inset-px bg-linear-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};