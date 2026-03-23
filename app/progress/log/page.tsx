"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { logProgress } from "../../lib/api";
import {
  ArrowLeft,
  Calendar,
  Scale,
  Activity,
  Dumbbell,
  Moon,
  Droplets,
  Footprints,
  FileText,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LogProgressPage() {
  const { user, isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: "",
    bodyFat: "",
    muscleMass: "",
    sleepHours: "",
    waterIntake: "",
    steps: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/signin");
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    // Must log at least one metric
    if (!formData.weight && !formData.bodyFat && !formData.muscleMass && !formData.sleepHours && !formData.waterIntake && !formData.steps) {
      setError("Please enter at least one health metric.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await logProgress(accessToken, {
        date: formData.date ? new Date(formData.date).toISOString() : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
        muscleMass: formData.muscleMass ? parseFloat(formData.muscleMass) : undefined,
        sleepHours: formData.sleepHours ? parseFloat(formData.sleepHours) : undefined,
        waterIntake: formData.waterIntake ? parseFloat(formData.waterIntake) : undefined,
        steps: formData.steps ? parseInt(formData.steps, 10) : undefined,
        notes: formData.notes || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/progress");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to log progress");
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (authLoading || !isAuthenticated) return null;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface border border-border p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
             <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Metrics Logged!</h2>
          <p className="text-muted">Your progress has been successfully recorded.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/progress" className="text-muted hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold">Log Progress</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 pb-24">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Date Selection */}
          <div className="bg-surface p-5 rounded-xl border border-border">
            <label className="flex items-center gap-2 text-sm font-medium text-muted mb-3">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Date of Entry
            </label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleInputChange}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Body Metrics Grid */}
          <div className="bg-surface p-5 rounded-xl border border-border space-y-6">
            <h3 className="text-foreground font-medium mb-2 border-b border-border pb-2">Body Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-muted mb-2">
                  <Scale className="w-4 h-4 text-emerald-400" /> Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  step="0.1"
                  min="20"
                  max="500"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:border-indigo-500 transition-all text-sm"
                  placeholder="e.g. 75.5"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-muted mb-2">
                  <Activity className="w-4 h-4 text-rose-400" /> Body Fat (%)
                </label>
                <input
                  type="number"
                  name="bodyFat"
                  step="0.1"
                  min="1"
                  max="60"
                  value={formData.bodyFat}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:border-indigo-500 transition-all text-sm"
                  placeholder="e.g. 18.5"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-muted mb-2">
                  <Dumbbell className="w-4 h-4 text-amber-400" /> Muscle (kg)
                </label>
                <input
                  type="number"
                  name="muscleMass"
                  step="0.1"
                  min="10"
                  value={formData.muscleMass}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:border-indigo-500 transition-all text-sm"
                  placeholder="e.g. 38.2"
                />
              </div>
            </div>
          </div>

          {/* Health Tracking Grid */}
          <div className="bg-surface p-5 rounded-xl border border-border space-y-6">
            <h3 className="text-foreground font-medium mb-2 border-b border-border pb-2">Daily Habits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-muted mb-2">
                  <Moon className="w-4 h-4 text-indigo-400" /> Sleep (hrs)
                </label>
                <input
                  type="number"
                  name="sleepHours"
                  step="0.1"
                  min="0"
                  max="24"
                  value={formData.sleepHours}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:border-indigo-500 transition-all text-sm"
                  placeholder="e.g. 7.5"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-muted mb-2">
                  <Droplets className="w-4 h-4 text-cyan-400" /> Water (L)
                </label>
                <input
                  type="number"
                  name="waterIntake"
                  step="0.1"
                  min="0"
                  value={formData.waterIntake}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:border-indigo-500 transition-all text-sm"
                  placeholder="e.g. 2.5"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-muted mb-2">
                  <Footprints className="w-4 h-4 text-orange-400" /> Steps
                </label>
                <input
                  type="number"
                  name="steps"
                  min="0"
                  value={formData.steps}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:border-indigo-500 transition-all text-sm"
                  placeholder="e.g. 8500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-surface p-5 rounded-xl border border-border">
            <label className="flex items-center gap-2 text-sm font-medium text-muted mb-3">
              <FileText className="w-4 h-4 text-purple-400" />
              Journal / Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="How are you feeling today? Any specific achievements?"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all placeholder:text-neutral-600"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-700 hover:to-purple-600 text-foreground font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
              </>
            ) : (
              "Save Progress Log"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
