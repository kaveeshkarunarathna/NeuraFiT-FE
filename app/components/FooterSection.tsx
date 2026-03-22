"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FooterSectionProps } from "../types";

export default function FooterSection({
  logoText,
  tagline,
  linkGroups,
  socialLinks,
  copyrightText,
  className = "",
}: FooterSectionProps) {
  return (
    <footer
      className={`bg-stone-50 dark:bg-[#000000] border-t border-stone-200 dark:border-stone-800 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
            {/* Brand Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              {/* Logo */}
              <Link href="/" className="inline-block mb-4">
                <Image
                  src="/neurafit-logo.png"
                  alt="NeuraFiT Logo"
                  width={150}
                  height={40}
                  className="h-8 w-auto"
                />
              </Link>
              <p className="text-stone-500 dark:text-stone-500 mb-6 max-w-sm leading-relaxed">
                {tagline}
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.platform}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-primary-500 hover:text-black text-stone-500 dark:text-stone-400 flex items-center justify-center transition-colors duration-300"
                      aria-label={`Follow us on ${social.platform}`}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

            {/* Link Groups */}
            {linkGroups.map((group, index) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-4">
                  {group.title}
                </h3>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-stone-600 dark:text-stone-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-8 border-t border-stone-200 dark:border-stone-800"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
                Stay in the loop
              </h4>
              <p className="text-stone-500 dark:text-stone-500 text-sm">
                Get fitness tips, updates, and exclusive offers.
              </p>
            </div>
            <form className="flex w-full md:w-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-3 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-colors"
                aria-label="Email address for newsletter"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-black font-medium rounded-full transition-all duration-300 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-stone-200 dark:border-stone-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-500 dark:text-stone-500">
            <p>{copyrightText}</p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
