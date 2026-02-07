"use client";
import React from "react";
import { ArrowRight, Zap, Mail, Twitter, Github, HelpCircle, ShieldCheck, DollarSign, ChevronUp } from "lucide-react";
import Link from "next/link";

const faqs = [
    {
        question: "Is this really all-in-one?",
        answer: "Yes. We replaced Todoist, MyFitnessPal, GitHub Mobile, and your Notes app.",
        icon: Zap
    },
    {
        question: "Is my data secure?",
        answer: "100%. We use Neon DB with Row Level Security. Your vault is private.",
        icon: ShieldCheck
    },
    {
        question: "Is it free?",
        answer: "Currently in Public Beta. Early adopters get lifetime perks.",
        icon: DollarSign
    },
    {
        question: "Customization?",
        answer: "Absolutely. The Command Deck toggles between Fixed and Flexible modes.",
        icon: HelpCircle
    }
];

export function CtaFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="bg-zinc-50 dark:bg-[#050505] pt-40 pb-0 px-4 relative overflow-hidden flex flex-col">
        
        {/* Modern Grid FAQ */}
        <div className="max-w-6xl mx-auto mb-40 relative z-10 w-full">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black mb-4 text-zinc-900 dark:text-white uppercase tracking-tighter">
                    Got <span className="text-indigo-600">Questions?</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faqs.map((faq, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 transition-colors group cursor-default shadow-sm hover:shadow-lg">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                <faq.icon size={24}/>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{faq.question}</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">{faq.answer}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Massive CTA */}
        <div className="max-w-7xl mx-auto relative z-10 w-full mb-32">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 blur-[120px] opacity-20"/>
            <div className="relative bg-black dark:bg-white rounded-[3rem] p-12 md:p-20 text-center overflow-hidden shadow-2xl group">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 group-hover:scale-110 transition-transform duration-1000"/>
                
                <div className="relative z-10 flex flex-col items-center">
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 text-white dark:text-black">
                        READY TO <br/> LEVEL UP?
                    </h2>
                    <Link href="/sign-in">
                        <button className="bg-white dark:bg-black text-black dark:text-white px-12 py-6 rounded-full font-black text-xl hover:scale-105 transition-transform flex items-center gap-3 shadow-xl hover:shadow-2xl">
                            JOIN BETA NOW <ArrowRight/>
                        </button>
                    </Link>
                </div>
            </div>
        </div>

        {/* Footer Content */}
        <div className="max-w-7xl mx-auto w-full border-t border-zinc-200 dark:border-zinc-800 pt-12 pb-12 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 bg-zinc-50 dark:bg-[#050505]">
            <div className="flex items-center gap-2 font-black text-2xl text-zinc-900 dark:text-white">
                <div className="bg-indigo-600 text-white p-1 rounded">
                    <Zap size={20} fill="currentColor"/>
                </div>
                INNERLOOP
            </div>
            
            <div className="flex gap-4">
                <Link href="#" className="p-3 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 hover:scale-110 transition-transform text-zinc-600 dark:text-white">
                    <Twitter size={20}/>
                </Link>
                <Link href="#" className="p-3 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 hover:scale-110 transition-transform text-zinc-600 dark:text-white">
                    <Github size={20}/>
                </Link>
                <button onClick={scrollToTop} className="p-3 bg-indigo-600 rounded-full text-white hover:scale-110 transition-transform shadow-lg">
                    <ChevronUp size={20}/>
                </button>
            </div>
        </div>
        
        {/* BIG GLOWING TEXT FOOTER */}
        <div className="relative w-full overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#050505] via-transparent to-transparent h-full z-10"/>
             {/* Use stroke text effect for cool look */}
             <h1 className="text-[13vw] font-black text-center leading-none tracking-tighter opacity-100 select-none text-transparent bg-clip-text bg-gradient-to-b from-zinc-300 to-zinc-100 dark:from-zinc-800 dark:to-zinc-950 pb-4">
                NEXUS PRIME
            </h1>
        </div>
    </section>
  )
}