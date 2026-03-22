"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { generateMealPlan, MealPlan } from "../../lib/api";
import {
  Utensils,
  Loader2,
  ArrowLeft,
  Sparkles,
  Target,
  Salad,
  Flame,
  AlertCircle,
  CheckCircle,
  Beef,
  Wheat,
  Droplets,
} from "lucide-react";

const GOALS = [
  { value: "LOSE_WEIGHT", label: "Lose Weight", emoji: "🔥" },
  { value: "GAIN_MUSCLE", label: "Build Muscle", emoji: "💪" },
  { value: "MAINTAIN", label: "Stay Fit", emoji: "⚖️" },
  { value: "IMPROVE_ENDURANCE", label: "Endurance", emoji: "🏃" },
  { value: "INCREASE_FLEXIBILITY", label: "Flexibility", emoji: "🧘" },
];

const DIETS = [
  { value: "NONE", label: "No Preference", emoji: "🍽️" },
  { value: "VEGETARIAN", label: "Vegetarian", emoji: "🥗" },
  { value: "VEGAN", label: "Vegan", emoji: "🌱" },
  { value: "KETO", label: "Keto", emoji: "🥑" },
  { value: "PALEO", label: "Paleo", emoji: "🥩" },
  { value: "GLUTEN_FREE", label: "Gluten Free", emoji: "🌾" },
];

export default function GenerateMealPlanPage() {
  const { user, isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const router = useRouter();

  const [fitnessGoal, setFitnessGoal] = useState(user?.fitnessGoal || "");
  const [dietPreference, setDietPreference] = useState(user?.dietPreference || "NONE");
  const [targetCalories, setTargetCalories] = useState(2000);
  const [allergies, setAllergies] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<MealPlan | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/signin");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      if (user.fitnessGoal && !fitnessGoal) setFitnessGoal(user.fitnessGoal);
      if (user.dietPreference && dietPreference === "NONE") setDietPreference(user.dietPreference);
    }
  }, [user, fitnessGoal, dietPreference]);

  const handleGenerate = async () => {
    if (!accessToken || !fitnessGoal) return;
    setError("");
    setIsGenerating(true);
    try {
      const plan = await generateMealPlan(accessToken, {
        fitnessGoal,
        dietPreference: dietPreference || undefined,
        targetCalories,
        allergies: allergies || undefined,
      });
      setGeneratedPlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate plan");
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (generatedPlan) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
            <Link href="/meals" className="text-muted hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-lg font-bold text-foreground">Your Meal Plan</span>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-6 py-8">
          {/* Summary header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-teal-500/20 border border-primary-500/30 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Plan Generated!</h2>
                <p className="text-sm text-muted">
                  {generatedPlan.calories} kcal daily target
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                <Beef className="w-4 h-4 text-red-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">{generatedPlan.macros.protein}g</div>
                <div className="text-xs text-muted">Protein</div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                <Wheat className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">{generatedPlan.macros.carbs}g</div>
                <div className="text-xs text-muted">Carbs</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">{generatedPlan.macros.fat}g</div>
                <div className="text-xs text-muted">Fat</div>
              </div>
            </div>
          </motion.div>

          {/* Meal cards */}
          <div className="space-y-3">
            {generatedPlan.meals.map((meal, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-surface border border-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400">
                      {meal.time}
                    </span>
                    <span className="font-medium text-foreground">{meal.name}</span>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-semibold text-orange-400">
                    <Flame className="w-3.5 h-3.5" /> {meal.calories}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span>P: {meal.protein}g</span>
                  <span>C: {meal.carbs}g</span>
                  <span>F: {meal.fat}g</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex justify-center"
          >
            <Link
              href="/meals"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-teal-500 text-foreground font-semibold rounded-xl shadow-lg shadow-primary-500/20 transition-all hover:from-primary-700 hover:to-teal-600"
            >
              <Utensils className="w-5 h-5" /> Back to Meals
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/meals" className="text-muted hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Generate Meal Plan</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 bg-red-950/30 border border-red-800 rounded-xl text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </motion.div>
        )}

        {/* Fitness Goal */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted mb-3 uppercase tracking-wider">
            <Target className="w-4 h-4 text-primary-400" /> Fitness Goal
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {GOALS.map((g) => (
              <button
                key={g.value}
                onClick={() => setFitnessGoal(g.value)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                  fitnessGoal === g.value
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-border bg-surface hover:border-neutral-700"
                }`}
              >
                <span className="text-lg">{g.emoji}</span>
                <span className={`text-sm font-medium ${fitnessGoal === g.value ? "text-primary-300" : "text-muted"}`}>
                  {g.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Diet Preference */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted mb-3 uppercase tracking-wider">
            <Salad className="w-4 h-4 text-green-400" /> Diet Preference
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DIETS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDietPreference(d.value)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                  dietPreference === d.value
                    ? "border-green-500 bg-green-500/10"
                    : "border-border bg-surface hover:border-neutral-700"
                }`}
              >
                <span className="text-lg">{d.emoji}</span>
                <span className={`text-sm font-medium ${dietPreference === d.value ? "text-green-300" : "text-muted"}`}>
                  {d.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Target Calories */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted mb-3 uppercase tracking-wider">
            <Flame className="w-4 h-4 text-orange-400" /> Daily Calories Target
          </h3>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1200}
              max={4000}
              step={100}
              value={targetCalories}
              onChange={(e) => setTargetCalories(Number(e.target.value))}
              className="flex-1 accent-secondary-500"
            />
            <span className="text-lg font-bold text-foreground w-24 text-center">
              {targetCalories} kcal
            </span>
          </div>
        </section>

        {/* Allergies */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted mb-3 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-red-400" /> Allergies (optional)
          </h3>
          <input
            type="text"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="e.g. Nuts, Shellfish, Dairy..."
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
          />
        </section>

        {/* Submit */}
        <button
          onClick={handleGenerate}
          disabled={!fitnessGoal || isGenerating}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 disabled:from-neutral-700 disabled:to-neutral-700 text-foreground font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all cursor-pointer disabled:cursor-not-allowed disabled:shadow-none text-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" /> Generate AI Meal Plan
            </>
          )}
        </button>
      </main>
    </div>
  );
}
