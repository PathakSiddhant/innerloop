"use client";
import React from "react";
import { Star } from "lucide-react";

// Use real dicebear avatars
const reviews = [
  { name: "Siddhant", handle: "@siddhant_dev", text: "I deleted Notion, Todoist, and MyFitnessPal. InnerLoop does it all. The UI is just chef's kiss.", rating: 5, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siddhant" },
  { name: "Rahul", handle: "@rahul_gym", text: "The fitness rings are addictive. I haven't missed a goal in 20 days. Best fitness tracker ever.", rating: 5, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" },
  { name: "Anjali", handle: "@anjali_pm", text: "Task management is finally intuitive. The split view (Fixed vs Flexible) is genius logic.", rating: 5, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali" },
  { name: "Vikram", handle: "@vik_coder", text: "Builder mode is exactly what I needed for my side projects. The git log integration is sleek.", rating: 4, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram" },
  { name: "Neha", handle: "@neha_design", text: "The design system is beautiful. Dark mode implementation is flawless. Love it!", rating: 5, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha" },
];

export function RichReviews() {
  return (
    <section className="py-24 bg-white dark:bg-black overflow-hidden border-y border-zinc-200 dark:border-zinc-800">
        <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
                Community <span className="text-indigo-600">Feedback</span>
            </h2>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
            <div className="group flex overflow-hidden p-2 [--gap:2rem] [gap:var(--gap)]">
                {/* Tripled list for seamless looping */}
                <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-scroll flex-row group-hover:[animation-play-state:paused]">
                    {[...reviews, ...reviews, ...reviews].map((review, i) => (
                        <div key={i} className="w-[350px] md:w-[450px] p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-2xl transition-all cursor-pointer">
                            <div className="flex items-center gap-4 mb-6">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={review.img} alt={review.name} className="w-14 h-14 rounded-full bg-indigo-100" />
                                <div>
                                    <h4 className="font-bold text-lg text-zinc-900 dark:text-white">{review.name}</h4>
                                    <p className="text-xs text-zinc-500 uppercase font-bold">{review.handle}</p>
                                </div>
                                <div className="ml-auto flex gap-1">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <Star key={i} size={18} className="fill-yellow-400 text-yellow-400"/>
                                    ))}
                                </div>
                            </div>
                            <p className="text-lg text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                                &quot;{review.text}&quot;
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            {/* Gradient Fade for seamless effect */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white dark:from-black to-transparent"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white dark:from-black to-transparent"></div>
        </div>
    </section>
  );
}