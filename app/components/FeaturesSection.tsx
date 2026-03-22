"use client";

import { motion } from "framer-motion";
import { FeatureCardProps, FeaturesSectionProps } from "../types";

function FeatureCard({
  icon: Icon,
  title,
  description,
  className = "",
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className={`group relative p-6 sm:p-8 bg-white dark:bg-stone-900/60 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-primary-300 dark:hover:border-primary-800 shadow-sm hover:shadow-lg transition-all duration-300 ${className}`}
    >
      {/* Icon */}
      <div className="relative mb-5">
        <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-primary-500" />
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        <h3 className="text-lg sm:text-xl font-semibold text-stone-900 dark:text-stone-100 mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h3>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-sm sm:text-base">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection({
  title,
  subtitle,
  features,
  className = "",
}: FeaturesSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <section
      className={`py-20 sm:py-28 lg:py-32 bg-stone-50 dark:bg-[#141210] ${className}`}
      id="features"
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
            Features
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-50 mb-6">
            {title}
          </h2>
          <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-400">
            {subtitle}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
