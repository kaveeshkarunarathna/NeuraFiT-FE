"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRight,
  ArrowLeft,
  Dumbbell,
  Loader2,
  Ruler,
  Weight,
  Calendar,
  Target,
  Utensils,
  Activity,
  CheckCircle,
} from "lucide-react";

const FITNESS_GOALS = [
  { value: "LOSE_WEIGHT", label: "Lose Weight", emoji: "🔥" },
  { value: "GAIN_MUSCLE", label: "Build Muscle", emoji: "💪" },
  { value: "MAINTAIN", label: "Stay Fit", emoji: "⚖️" },
  { value: "IMPROVE_ENDURANCE", label: "Boost Endurance", emoji: "🏃" },
  { value: "INCREASE_FLEXIBILITY", label: "Get Flexible", emoji: "🧘" },
];

const ACTIVITY_LEVELS = [
  { value: "SEDENTARY", label: "Sedentary", desc: "Little or no exercise" },
  { value: "LIGHTLY_ACTIVE", label: "Lightly Active", desc: "Exercise 1-3 days/week" },
  { value: "MODERATELY_ACTIVE", label: "Moderately Active", desc: "Exercise 3-5 days/week" },
  { value: "VERY_ACTIVE", label: "Very Active", desc: "Exercise 6-7 days/week" },
  { value: "EXTRA_ACTIVE", label: "Athlete", desc: "Intense training daily" },
];

const DIET_PREFERENCES = [
  { value: "NONE", label: "No Preference", emoji: "🍽️" },
  { value: "VEGETARIAN", label: "Vegetarian", emoji: "🥬" },
  { value: "VEGAN", label: "Vegan", emoji: "🌱" },
  { value: "KETO", label: "Keto", emoji: "🥑" },
  { value: "PALEO", label: "Paleo", emoji: "🥩" },
  { value: "GLUTEN_FREE", label: "Gluten Free", emoji: "🌾" },
];

const STEPS = [
  { title: "Body Metrics", subtitle: "Let's get the basics", icon: Ruler },
  { title: "Your Goal", subtitle: "What are you training for?", icon: Target },
  { title: "Lifestyle", subtitle: "Help us personalize your plan", icon: Activity },
];

export default function OnboardingPage() {
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [age, setAge] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [fitnessGoal, setFitnessGoal] = useState<string>("");
  const [activityLevel, setActivityLevel] = useState<string>("");
  const [dietPreference, setDietPreference] = useState<string>("NONE");

  // Guard: redirect if not authenticated or already onboarded
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    } else if (!isLoading && user?.fitnessGoal) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const canProceedStep0 = age && height && weight;
  const canProceedStep1 = !!fitnessGoal;
  const canSubmit = activityLevel && dietPreference;

  const handleFinish = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await updateUser({
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        fitnessGoal,
        activityLevel,
        dietPreference,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      {/* Progress bar */}
      <div className="px-6">
        <div className="h-1 bg-surface-hover rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg">
          {/* Step header */}
          <div className="text-center mb-10">
            <motion.div
              key={`icon-${step}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/30 rounded-2xl flex items-center justify-center"
            >
              {(() => {
                const Icon = STEPS[step].icon;
                return <Icon className="w-7 h-7 text-primary-400" />;
              })()}
            </motion.div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {STEPS[step].title}
            </h1>
            <p className="text-muted">{STEPS[step].subtitle}</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-950/30 border border-red-800 rounded-xl text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Step content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Step 0: Body Metrics */}
              {step === 0 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
                        <Calendar className="w-4 h-4 text-primary-400" />
                        Age
                      </label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="25"
                        min={13}
                        max={120}
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-center text-lg"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
                        <Ruler className="w-4 h-4 text-secondary-400" />
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="175"
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-center text-lg"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
                        <Weight className="w-4 h-4 text-accent-400" />
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="70"
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-center text-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Fitness Goal */}
              {step === 1 && (
                <div className="grid grid-cols-1 gap-3">
                  {FITNESS_GOALS.map((goal) => (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() => setFitnessGoal(goal.value)}
                      className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${
                        fitnessGoal === goal.value
                          ? "border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10"
                          : "border-border bg-surface hover:border-neutral-700 hover:bg-surface-hover/80"
                      }`}
                    >
                      <span className="text-2xl">{goal.emoji}</span>
                      <span
                        className={`font-semibold text-lg ${
                          fitnessGoal === goal.value
                            ? "text-primary-300"
                            : "text-muted"
                        }`}
                      >
                        {goal.label}
                      </span>
                      {fitnessGoal === goal.value && (
                        <CheckCircle className="w-5 h-5 text-primary-400 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Lifestyle */}
              {step === 2 && (
                <div className="space-y-8">
                  {/* Activity Level */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-muted mb-3 uppercase tracking-wider">
                      <Activity className="w-4 h-4 text-primary-400" />
                      Activity Level
                    </h3>
                    <div className="space-y-2">
                      {ACTIVITY_LEVELS.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setActivityLevel(level.value)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${
                            activityLevel === level.value
                              ? "border-primary-500 bg-primary-500/10"
                              : "border-border bg-surface hover:border-neutral-700"
                          }`}
                        >
                          <div>
                            <div
                              className={`font-medium ${
                                activityLevel === level.value
                                  ? "text-primary-300"
                                  : "text-muted"
                              }`}
                            >
                              {level.label}
                            </div>
                            <div className="text-xs text-muted">
                              {level.desc}
                            </div>
                          </div>
                          {activityLevel === level.value && (
                            <CheckCircle className="w-5 h-5 text-primary-400 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Diet Preference */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-muted mb-3 uppercase tracking-wider">
                      <Utensils className="w-4 h-4 text-secondary-400" />
                      Diet Preference
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {DIET_PREFERENCES.map((diet) => (
                        <button
                          key={diet.value}
                          type="button"
                          onClick={() => setDietPreference(diet.value)}
                          className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                            dietPreference === diet.value
                              ? "border-secondary-500 bg-secondary-500/10"
                              : "border-border bg-surface hover:border-neutral-700"
                          }`}
                        >
                          <span className="text-xl">{diet.emoji}</span>
                          <span
                            className={`text-xs font-medium ${
                              dietPreference === diet.value
                                ? "text-secondary-300"
                                : "text-muted"
                            }`}
                          >
                            {diet.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-10">
            {step > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 px-5 py-3 text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={
                  (step === 0 && !canProceedStep0) ||
                  (step === 1 && !canProceedStep1)
                }
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 disabled:from-neutral-700 disabled:to-neutral-700 text-foreground font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:shadow-none"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={!canSubmit || isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 disabled:from-neutral-700 disabled:to-neutral-700 text-foreground font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Finish Setup
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
