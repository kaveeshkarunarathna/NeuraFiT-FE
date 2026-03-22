"use client";

import { motion } from "framer-motion";
import { HowItWorksSectionProps } from "../types";

export default function HowItWorksSection({
  title,
  subtitle,
  steps,
  className = "",
}: HowItWorksSectionProps) {
  return (
    <section
      className={`py-20 sm:py-28 lg:py-32 bg-white dark:bg-[#000000] overflow-hidden ${className}`}
      id="how-it-works"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4 border border-primary-100 dark:border-primary-900/40"
          >
            How It Works
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-50 mb-6">
            {title}
          </h2>
          <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-400">
            {subtitle}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line - Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-stone-200 dark:bg-stone-800 -translate-y-1/2" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative"
                >
                  {/* Step Card */}
                  <div className="relative flex flex-col items-center text-center group">
                    {/* Step Number Circle */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative z-10 w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center mb-6 shadow-lg shadow-primary-500/15 group-hover:shadow-xl group-hover:shadow-primary-500/20 transition-all duration-300"
                    >
                      <Icon className="w-8 h-8 text-white" />
                      {/* Step number badge */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-white dark:text-stone-900 font-bold text-sm shadow-lg">
                        {step.stepNumber}
                      </div>
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed max-w-xs">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow indicator - Mobile & Tablet */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-6 mb-2">
                      <motion.svg
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-6 h-6 text-stone-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </motion.svg>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-stone-600 dark:text-stone-400 mb-6">
            Ready to transform your fitness journey?
          </p>
          <motion.a
            href="#cta"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-black font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Your Journey
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
