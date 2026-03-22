"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CTASectionProps } from "../types";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection({
  headline,
  description,
  primaryCtaText,
  primaryCtaLink,
  secondaryCtaText,
  secondaryCtaLink,
  className = "",
}: CTASectionProps) {
  return (
    <section
      className={`py-20 sm:py-28 lg:py-32 relative overflow-hidden ${className}`}
      id="cta"
    >
      {/* Background — solid warm tone */}
      <div className="absolute inset-0 bg-stone-900 dark:bg-stone-950" />

      {/* Subtle animated glow */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-stone-300 text-sm font-medium mb-8 border border-white/10"
        >
          <Sparkles className="w-4 h-4" />
          Start for Free
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight"
        >
          {headline}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-stone-400 mb-10 max-w-2xl mx-auto"
        >
          {description}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href={primaryCtaLink}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-black font-semibold rounded-full shadow-lg shadow-primary-500/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            {primaryCtaText}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {secondaryCtaText && secondaryCtaLink && (
            <Link
              href={secondaryCtaLink}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-stone-300 font-semibold rounded-full border border-stone-700 hover:border-stone-500 hover:bg-white/5 transition-all duration-300"
            >
              {secondaryCtaText}
            </Link>
          )}
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          {/* Avatar stack */}
          <div className="flex -space-x-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-stone-800 border-2 border-stone-700 flex items-center justify-center text-stone-400 text-xs font-medium"
              >
                {String.fromCharCode(65 + i - 1)}
              </div>
            ))}
          </div>
          <div className="text-stone-400 text-sm">
            <span className="font-semibold text-stone-300">50,000+</span> fitness
            enthusiasts already joined
          </div>
        </motion.div>
      </div>
    </section>
  );
}
