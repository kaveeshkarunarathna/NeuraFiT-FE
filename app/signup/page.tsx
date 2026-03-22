"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, ArrowRight, Dumbbell, Loader2 } from "lucide-react";

export default function SignUpPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-stone-900 items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-950/60 via-stone-900 to-stone-950" />
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link href="/" className="inline-flex items-center gap-3 mb-12">
              <Image src="/neurafit-logo.png" alt="NeuraFiT Logo" width={180} height={48} className="h-10 w-auto" priority />
            </Link>

            <h1 className="text-4xl font-bold text-stone-100 mb-6 leading-tight">
              Your fitness journey
              <br />
              <span className="text-primary-400">
                starts here.
              </span>
            </h1>

            <p className="text-lg text-stone-400 leading-relaxed">
              Join thousands of athletes who trust AI-powered coaching to push
              past plateaus, recover smarter, and hit goals they never thought
              possible.
            </p>

            <div className="mt-12 flex gap-8">
              {[
                { value: "50K+", label: "Athletes" },
                { value: "1M+", label: "Workouts" },
                { value: "98%", label: "Satisfaction" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-stone-100">
                    {stat.value}
                  </div>
                  <div className="text-sm text-stone-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-[#000000]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/neurafit-logo.png" alt="NeuraFiT Logo" width={150} height={40} className="h-8 w-auto" />
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Create your account
          </h2>
          <p className="text-stone-500 dark:text-stone-500 mb-8">
            Start your free assessment today
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="signup-name"
                className="block text-sm font-medium text-stone-700 dark:text-stone-400 mb-2"
              >
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-medium text-stone-700 dark:text-stone-400 mb-2"
              >
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="john@example.com"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="signup-password"
                className="block text-sm font-medium text-stone-700 dark:text-stone-400 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 pr-12 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:bg-stone-300 dark:disabled:bg-stone-700 text-black font-semibold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/25 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-stone-500 dark:text-stone-500">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
