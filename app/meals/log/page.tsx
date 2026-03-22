"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { logMeal } from "../../lib/api";
import {
  Utensils,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Calendar,
} from "lucide-react";

export default function LogMealPage() {
  const { isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const router = useRouter();

  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/signin");
  }, [authLoading, isAuthenticated, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !foodName.trim() || !calories) return;
    setError("");
    setIsSubmitting(true);
    try {
      await logMeal(accessToken, {
        foodName: foodName.trim(),
        calories: Number(calories),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        date: date || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push("/meals"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log meal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Meal Logged!</h2>
          <p className="text-muted">Redirecting to meals...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/meals" className="text-muted hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Utensils className="w-4 h-4 text-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Log Meal</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-950/30 border border-red-800 rounded-xl text-red-400 text-sm text-center">
            {error}
          </motion.div>
        )}


        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Food Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
              <Utensils className="w-4 h-4 text-primary-400" /> Food Name *
            </label>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g. Grilled Chicken Salad"
              required
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
            />
          </div>

          {/* Calories */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
              <Flame className="w-4 h-4 text-orange-400" /> Calories *
            </label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="350"
              required
              min={0}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
            />
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
                <Beef className="w-4 h-4 text-red-400" /> Protein (g)
              </label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="30"
                min={0}
                step="0.1"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-center"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
                <Wheat className="w-4 h-4 text-amber-400" /> Carbs (g)
              </label>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="45"
                min={0}
                step="0.1"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-center"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
                <Droplets className="w-4 h-4 text-blue-400" /> Fat (g)
              </label>
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="15"
                min={0}
                step="0.1"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-center"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
              <Calendar className="w-4 h-4 text-cyan-400" /> Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!foodName.trim() || !calories || isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 disabled:from-neutral-700 disabled:to-neutral-700 text-foreground font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all cursor-pointer disabled:cursor-not-allowed disabled:shadow-none text-lg"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" /> Log Meal
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
