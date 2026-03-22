"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { generateWorkout, WorkoutPlan } from "../../lib/api";
import {
  Dumbbell,
  Loader2,
  ArrowLeft,
  Sparkles,
  Target,
  Activity,
  Gauge,
  Calendar,
  StickyNote,
  CheckCircle,
} from "lucide-react";

const GOALS = [
  { value: "LOSE_WEIGHT", label: "Lose Weight", emoji: "🔥" },
  { value: "GAIN_MUSCLE", label: "Build Muscle", emoji: "💪" },
  { value: "MAINTAIN", label: "Stay Fit", emoji: "⚖️" },
  { value: "IMPROVE_ENDURANCE", label: "Endurance", emoji: "🏃" },
  { value: "INCREASE_FLEXIBILITY", label: "Flexibility", emoji: "🧘" },
];

const ACTIVITY_LEVELS = [
  { value: "SEDENTARY", label: "Sedentary" },
  { value: "LIGHTLY_ACTIVE", label: "Lightly Active" },
  { value: "MODERATELY_ACTIVE", label: "Moderately Active" },
  { value: "VERY_ACTIVE", label: "Very Active" },
  { value: "EXTRA_ACTIVE", label: "Athlete" },
];

const DIFFICULTIES = [
  { value: "BEGINNER", label: "Beginner", color: "border-green-500 bg-green-500/10 text-green-400" },
  { value: "INTERMEDIATE", label: "Intermediate", color: "border-amber-500 bg-amber-500/10 text-amber-400" },
  { value: "ADVANCED", label: "Advanced", color: "border-red-500 bg-red-500/10 text-red-400" },
];

export default function GenerateWorkoutPage() {
  const { user, isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const router = useRouter();

  const [fitnessGoal, setFitnessGoal] = useState(user?.fitnessGoal || "");
  const [activityLevel, setActivityLevel] = useState(user?.activityLevel || "");
  const [difficulty, setDifficulty] = useState("INTERMEDIATE");
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [notes, setNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/signin");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      if (user.fitnessGoal && !fitnessGoal) setFitnessGoal(user.fitnessGoal);
      if (user.activityLevel && !activityLevel) setActivityLevel(user.activityLevel);
    }
  }, [user, fitnessGoal, activityLevel]);

  const handleGenerate = async () => {
    if (!accessToken || !fitnessGoal || !activityLevel || !difficulty) return;
    setError("");
    setIsGenerating(true);
    try {
      const plan = await generateWorkout(accessToken, {
        fitnessGoal,
        activityLevel,
        difficulty,
        durationWeeks,
        notes: notes || undefined,
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
            <Link href="/workouts" className="text-muted hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-lg font-bold text-foreground">Plan Generated!</span>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-6 py-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-10"
          >
            <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Your workout plan is ready!</h2>
            <p className="text-muted">
              {generatedPlan.durationWeeks}-week {difficulty.toLowerCase()} program for{" "}
              {GOALS.find((g) => g.value === generatedPlan.goal)?.label || generatedPlan.goal}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-4"
          >
            <Link
              href="/workouts"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-foreground font-semibold rounded-xl shadow-lg shadow-primary-500/20 transition-all hover:from-primary-700 hover:to-primary-600"
            >
              <Dumbbell className="w-5 h-5" />
              View My Plans
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/workouts" className="text-muted hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Generate Plan</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-950/30 border border-red-800 rounded-xl text-red-400 text-sm text-center">
            {error}
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

        {/* Activity Level */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted mb-3 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-primary-400" /> Activity Level
          </h3>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_LEVELS.map((lv) => (
              <button
                key={lv.value}
                onClick={() => setActivityLevel(lv.value)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer ${
                  activityLevel === lv.value
                    ? "border-primary-500 bg-primary-500/10 text-primary-300"
                    : "border-border bg-surface text-muted hover:border-neutral-700"
                }`}
              >
                {lv.label}
              </button>
            ))}
          </div>
        </section>

        {/* Difficulty */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted mb-3 uppercase tracking-wider">
            <Gauge className="w-4 h-4 text-amber-400" /> Difficulty
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                  difficulty === d.value ? d.color : "border-border bg-surface text-muted hover:border-neutral-700"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        {/* Duration Weeks */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted mb-3 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-blue-400" /> Duration
          </h3>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={12}
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(Number(e.target.value))}
              className="flex-1 accent-primary-500"
            />
            <span className="text-lg font-bold text-foreground w-20 text-center">
              {durationWeeks} {durationWeeks === 1 ? "week" : "weeks"}
            </span>
          </div>
        </section>

        {/* Notes */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted mb-3 uppercase tracking-wider">
            <StickyNote className="w-4 h-4 text-purple-400" /> Notes (optional)
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any injuries, preferences, or equipment access..."
            rows={3}
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
          />
        </section>

        {/* Submit */}
        <button
          onClick={handleGenerate}
          disabled={!fitnessGoal || !activityLevel || !difficulty || isGenerating}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 disabled:from-neutral-700 disabled:to-neutral-700 text-foreground font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all cursor-pointer disabled:cursor-not-allowed disabled:shadow-none text-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" /> Generate AI Workout Plan
            </>
          )}
        </button>
      </main>
    </div>
  );
}
