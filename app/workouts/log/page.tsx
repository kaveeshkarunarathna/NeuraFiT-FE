"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { logWorkoutSession, getWorkoutPlans, WorkoutPlan, WorkoutExercise } from "../../lib/api";
import {
  ClipboardList,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Dumbbell,
  Hash,
  Layers,
  Timer,
  Star,
  Calendar,
  StickyNote,
} from "lucide-react";

interface BatchExercise {
  id: string;
  selected: boolean;
  name: string;
  sets: string;
  reps: string;
}

export default function LogWorkoutPage() {
  const { user, isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");

  const [batchExercises, setBatchExercises] = useState<BatchExercise[]>([]);

  // Ad-Hoc fallbacks (if they don't select a plan day)
  const [singleExercise, setSingleExercise] = useState("");
  const [singleSets, setSingleSets] = useState<string>("");
  const [singleReps, setSingleReps] = useState<string>("");

  // Globals
  const [duration, setDuration] = useState<string>("");
  const [formScore, setFormScore] = useState<string>("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/signin");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (accessToken && user) {
      const fetchPlans = async () => {
        try {
          const res = await getWorkoutPlans(accessToken, user.id);
          setPlans(res.items);
        } catch (err) {
          console.error("Failed to load standard plans", err);
        }
      };
      fetchPlans();
    }
  }, [accessToken, user]);

  useEffect(() => {
    if (selectedPlanId && selectedWeek && selectedDay) {
      const dayData = plans.find(p => p.id === selectedPlanId)?.workouts.find(w => w.week === selectedWeek)?.days.find(d => d.day === selectedDay);
      if (dayData && dayData.exercises) {
        const initialBatch = dayData.exercises.map((ex, idx) => {
          const isStr = typeof ex === 'string';
          const name = isStr ? ex : ex.name;
          const sets = isStr || !ex.sets ? "" : String(ex.sets);
          
          let repsParsed = NaN;
          if (!isStr && ex.reps) {
            if (typeof ex.reps === 'string') {
              const match = ex.reps.match(/\d+/);
              repsParsed = match ? parseInt(match[0], 10) : NaN;
            } else {
              repsParsed = Number(ex.reps);
            }
          }
          const reps = !isNaN(repsParsed) && repsParsed ? String(repsParsed) : "";
          
          return {
            id: `ex-${idx}`,
            selected: true,
            name,
            sets,
            reps
          };
        });
        setBatchExercises(initialBatch);
      } else {
        setBatchExercises([]);
      }
    } else {
      setBatchExercises([]);
    }
  }, [selectedPlanId, selectedWeek, selectedDay, plans]);

  const updateBatchExercise = (id: string, field: string, value: string | boolean) => {
    setBatchExercises(prev => prev.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  const handleBatchSubmit = async () => {
    if (!accessToken) return;
    
    const selectedToLog = batchExercises.filter(ex => ex.selected);
    if (selectedToLog.length === 0) {
      setError("Please select at least one exercise to log.");
      return;
    }
    
    setError("");
    setIsSubmitting(true);
    try {
      await Promise.all(selectedToLog.map(ex => 
        logWorkoutSession(accessToken, {
          exercise: ex.name.trim(),
          sets: ex.sets ? Number(ex.sets) : undefined,
          reps: ex.reps ? Number(ex.reps) : undefined,
          duration: duration ? Number(duration) : undefined,
          formScore: formScore ? Number(formScore) : undefined,
          date: date || undefined,
          notes: notes.trim() || undefined,
          workoutPlanId: selectedPlanId || undefined,
          planWeek: selectedWeek || undefined,
          planDay: selectedDay || undefined,
        })
      ));
      
      setSuccess(true);
      setTimeout(() => router.push("/workouts"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log batch session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !singleExercise.trim()) return;
    setError("");
    setIsSubmitting(true);
    try {
      await logWorkoutSession(accessToken, {
        exercise: singleExercise.trim(),
        sets: singleSets ? Number(singleSets) : undefined,
        reps: singleReps ? Number(singleReps) : undefined,
        duration: duration ? Number(duration) : undefined,
        formScore: formScore ? Number(formScore) : undefined,
        date: date || undefined,
        notes: notes.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push("/workouts"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log session");
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Session Logged!</h2>
          <p className="text-muted">Redirecting to workouts...</p>
        </motion.div>
      </div>
    );
  }

  const isBatchMode = batchExercises.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/workouts" className="text-muted hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Log Session</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-950/30 border border-red-800 rounded-xl text-red-400 text-sm text-center">
            {error}
          </motion.div>
        )}

        {/* Plan Selector */}
        {plans?.length > 0 && (
          <div className="mb-8 p-6 bg-surface border border-primary-500/20 rounded-2xl shadow-[0_0_15px_rgba(124,255,0,0.05)]">
            <h3 className="text-sm font-semibold text-primary-400 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4" /> Quick Log from Active Plan
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={selectedPlanId}
                onChange={(e) => {
                  setSelectedPlanId(e.target.value);
                  setSelectedWeek(null);
                  setSelectedDay("");
                }}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary-500 transition-all text-sm"
              >
                <option value="">-- Select a Plan --</option>
                {plans.map((p, idx) => (
                  <option key={p.id} value={p.id}>Plan {idx + 1}: {p.goal.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')} ({p.durationWeeks} wks)</option>
                ))}
              </select>

              {selectedPlanId && (
                <select
                  value={selectedWeek || ""}
                  onChange={(e) => {
                    setSelectedWeek(Number(e.target.value));
                    setSelectedDay("");
                  }}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary-500 transition-all text-sm"
                >
                  <option value="">-- Select Week --</option>
                  {plans.find(p => p.id === selectedPlanId)?.workouts.map(w => (
                    <option key={w.week} value={w.week}>Week {w.week}</option>
                  ))}
                </select>
              )}
              
              {selectedWeek && (
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary-500 transition-all text-sm sm:col-span-2"
                >
                  <option value="">-- Select Day --</option>
                  {plans.find(p => p.id === selectedPlanId)?.workouts.find(w => w.week === selectedWeek)?.days.map(d => (
                    <option key={d.day} value={d.day}>Day {d.day} - {d.focus}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}

        {/* BATCH EXERCISE MODE */}
        {isBatchMode && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-surface border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Exercises for {selectedDay}</h3>
                <button type="button" onClick={() => {
                    const allSelected = batchExercises.every(ex => ex.selected);
                    setBatchExercises(prev => prev.map(ex => ({...ex, selected: !allSelected})));
                }} className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">
                  {batchExercises.every(ex => ex.selected) ? "Deselect All" : "Select All"}
                </button>
              </div>
              
              <div className="space-y-3">
                {batchExercises.map(ex => (
                  <div key={ex.id} className={`p-4 border rounded-xl transition-all ${ex.selected ? 'bg-primary-500/5 border-primary-500/30' : 'bg-background border-border opacity-70'}`}>
                    <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
                      <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                        <input 
                          type="checkbox" 
                          checked={ex.selected} 
                          onChange={(e) => updateBatchExercise(ex.id, 'selected', e.target.checked)}
                          className="w-5 h-5 rounded border-border text-primary-500 focus:ring-primary-500 bg-background accent-primary-500"
                        />
                        <input 
                          type="text" 
                          value={ex.name} 
                          onChange={(e) => updateBatchExercise(ex.id, 'name', e.target.value)}
                          className="bg-transparent text-foreground font-semibold flex-1 border-none focus:ring-0 px-0"
                        />
                      </div>
                      
                      <div className="flex items-center gap-3 w-full sm:w-auto pl-8 sm:pl-0">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-muted font-medium whitespace-nowrap">Sets</label>
                          <input 
                            type="number" 
                            value={ex.sets} 
                            onChange={(e) => updateBatchExercise(ex.id, 'sets', e.target.value)}
                            className="w-16 px-2 py-1.5 bg-background border border-border rounded-lg text-foreground text-center text-sm focus:border-primary-500 outline-none transition-colors"
                            min={1}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-muted font-medium whitespace-nowrap">Reps</label>
                          <input 
                            type="number" 
                            value={ex.reps} 
                            onChange={(e) => updateBatchExercise(ex.id, 'reps', e.target.value)}
                            className="w-16 px-2 py-1.5 bg-background border border-border rounded-lg text-foreground text-center text-sm focus:border-primary-500 outline-none transition-colors"
                            min={1}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* SINGLE EXERCISE MODE */}
        {!isBatchMode && (
          <form id="single-form" onSubmit={handleSubmitSingle} className="space-y-6">
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-foreground border-b border-border pb-4">Log Custom Exercise</h3>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
                  <Dumbbell className="w-4 h-4 text-primary-400" /> Exercise *
                </label>
                <input
                  type="text"
                  value={singleExercise}
                  onChange={(e) => setSingleExercise(e.target.value)}
                  placeholder="e.g. Bench Press, Running, Squats..."
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
                    <Layers className="w-4 h-4 text-blue-400" /> Sets
                  </label>
                  <input
                    type="number"
                    value={singleSets}
                    onChange={(e) => setSingleSets(e.target.value)}
                    placeholder="3"
                    min={1}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-center"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
                    <Hash className="w-4 h-4 text-purple-400" /> Reps
                  </label>
                  <input
                    type="number"
                    value={singleReps}
                    onChange={(e) => setSingleReps(e.target.value)}
                    placeholder="12"
                    min={1}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-center"
                  />
                </div>
              </div>
            </div>
          </form>
        )}

        {/* GLOBAL FIELDS (Applies to both Batch and Single) */}
        <div className="mt-6 space-y-6 bg-surface border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-foreground border-b border-border pb-4">Session Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
                <Timer className="w-4 h-4 text-green-400" /> Duration (Minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="45"
                min={1}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
                <Calendar className="w-4 h-4 text-cyan-400" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all uppercase"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
              <Star className="w-4 h-4 text-amber-400" /> Daily Readiness Score (0–100)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={100}
                value={formScore || 0}
                onChange={(e) => setFormScore(e.target.value === "0" ? "" : e.target.value)}
                className="flex-1 accent-amber-500"
              />
              <span className="text-lg font-bold text-foreground w-12 text-center">
                {formScore || "—"}
              </span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
              <StickyNote className="w-4 h-4 text-purple-400" /> Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the workout feel? Any new PRs?"
              rows={3}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="mt-8">
          <button
            type="button"
            onClick={isBatchMode ? handleBatchSubmit : handleSubmitSingle}
            disabled={isSubmitting || (!isBatchMode && !singleExercise.trim())}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-extrabold rounded-xl shadow-[0_0_20px_rgba(124,255,0,0.3)] transition-all cursor-pointer disabled:cursor-not-allowed disabled:shadow-none text-lg"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" /> 
                {isBatchMode ? `Log Selected Exercises (${batchExercises.filter(e => e.selected).length})` : "Log Custom Workout"}
              </>
            )}
          </button>
        </div>

      </main>
    </div>
  );
}
