"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { NavbarProps } from "../types";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({
  logoText,
  navItems,
  ctaText,
  ctaLink,
  className = "",
}: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-[#000000]/90 backdrop-blur-lg shadow-sm border-b border-stone-200/50 dark:border-stone-800/50"
          : "bg-transparent"
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/neurafit-logo.png"
              alt="NeuraFiT Logo"
              width={150}
              height={40}
              className="h-8 sm:h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA / Auth */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center text-black text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href={ctaLink}
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-black font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {ctaText}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-stone-700 dark:text-stone-400" />
            ) : (
              <Menu className="w-6 h-6 text-stone-700 dark:text-stone-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-[#1c1917] border-t border-stone-100 dark:border-stone-800"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block text-lg font-medium text-stone-700 dark:text-stone-400 hover:text-primary-600 dark:hover:text-primary-400 py-2"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {isAuthenticated && user ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.length * 0.1 }}
                  >
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block text-lg font-medium text-stone-700 dark:text-stone-400 hover:text-primary-600 py-2"
                    >
                      Dashboard
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + 1) * 0.1 }}
                    className="pt-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-black font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-stone-700 dark:text-stone-400">
                        {user.name}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        logout();
                      }}
                      className="text-sm font-medium text-red-500 hover:text-red-600 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.length * 0.1 }}
                  >
                    <Link
                      href="/signin"
                      onClick={() => setIsOpen(false)}
                      className="block text-lg font-medium text-stone-700 dark:text-stone-400 hover:text-primary-600 py-2"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + 1) * 0.1 }}
                    className="pt-4"
                  >
                    <Link
                      href={ctaLink}
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-black font-medium rounded-full transition-colors"
                    >
                      {ctaText}
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
