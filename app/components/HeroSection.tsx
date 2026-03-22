"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { HeroSectionProps } from "../types";

export default function HeroSection({
  headline,
  tagline,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
  heroImage,
  heroImageAlt,
  className = "",
}: HeroSectionProps) {
  return (
    <section
      className={`relative min-h-screen flex items-center overflow-hidden bg-stone-50 dark:bg-[#000000] ${className}`}
    >
      {/* Background decorative elements — warm monochromatic */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/20 dark:bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-stone-200/40 dark:bg-stone-800/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400 text-sm font-medium mb-6 border border-primary-200 dark:border-primary-800/40"
            >
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              AI-Powered Fitness Platform
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-stone-900 dark:text-stone-50 leading-tight mb-6">
              {headline.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className={
                    word.toLowerCase() === "neurafit"
                      ? "text-primary-500 dark:text-primary-400"
                      : ""
                  }
                >
                  {word}{" "}
                </motion.span>
              ))}
            </h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-lg sm:text-xl text-stone-600 dark:text-stone-400 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              {tagline}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                href={ctaLink}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-black font-semibold rounded-full shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {ctaText}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              {secondaryCtaText && secondaryCtaLink && (
                <Link
                  href={secondaryCtaLink}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold rounded-full border border-stone-200 dark:border-stone-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300"
                >
                  <Play className="w-5 h-5 text-primary-500" />
                  {secondaryCtaText}
                </Link>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-stone-200 dark:border-stone-800"
            >
              {[
                { value: "50K+", label: "Active Users" },
                { value: "1M+", label: "Workouts Completed" },
                { value: "4.9", label: "App Rating" },
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {stat.value}
                  </div>
                  <div className="text-sm text-stone-500 dark:text-stone-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto lg:max-w-none">
              {/* Decorative ring — single, subtle */}
              <div
                className="absolute inset-0 rounded-full border border-dashed border-stone-300 dark:border-stone-700 animate-spin"
                style={{ animationDuration: "30s" }}
              />

              {/* Main image container */}
              <div className="absolute inset-8 rounded-3xl overflow-hidden bg-primary-500 p-[2px]">
                <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-white dark:bg-surface">
                  <Image
                    src={heroImage}
                    alt={heroImageAlt}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="absolute -left-4 top-1/4 bg-white dark:bg-stone-800 rounded-2xl p-4 shadow-lg border border-stone-100 dark:border-stone-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500/15 flex items-center justify-center">
                    <span className="text-primary-500 text-lg">✓</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      Workout Complete
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-500">
                      +150 XP earned
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="absolute -right-4 bottom-1/4 bg-white dark:bg-stone-800 rounded-2xl p-4 shadow-lg border border-stone-100 dark:border-stone-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500/15 flex items-center justify-center">
                    <span className="text-primary-500 text-lg">🔥</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      7 Day Streak!
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-500">Keep it up!</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-stone-300 dark:border-stone-600 flex items-start justify-center p-2"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}
