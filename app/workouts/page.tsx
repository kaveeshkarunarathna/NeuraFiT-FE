"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import {
  getWorkoutPlans,
  getWorkoutHistory,
  WorkoutPlan,
  WorkoutSession,
  WorkoutDay,
  WorkoutExercise,
  updateWorkoutSession,
  deleteWorkoutSession,
  deleteWorkoutPlan,
} from "../lib/api";
import {
  Dumbbell,
  Loader2,
  Plus,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  Zap,
  Timer,
  Star,
  Edit2,
  Trash2,
  X,
  Check,
} from "lucide-react";

const GOAL_LABELS: Record<string, string> = {
  LOSE_WEIGHT: "Lose Weight",
  GAIN_MUSCLE: "Build Muscle",
  MAINTAIN: "Stay Fit",
  IMPROVE_ENDURANCE: "Endurance",
  INCREASE_FLEXIBILITY: "Flexibility",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: "text-primary-400 bg-primary-500/10 border-primary-500/20",
  INTERMEDIATE: "text-primary-400 bg-primary-500/10 border-primary-500/20",
  ADVANCED: "text-primary-400 bg-primary-500/10 border-primary-500/20",
};

export default function WorkoutsPage() {
  const { user, isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"plans" | "sessions">("plans");
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<WorkoutSession>>({});

  // CRUD Handlers
  const handleDeleteSession = async (id: string) => {
    if (!accessToken) return;
    try {
      await deleteWorkoutSession(accessToken, id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSession = async (id: string) => {
    if (!accessToken) return;
    try {
      const updated = await updateWorkoutSession(accessToken, id, editData);
      setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
      setEditingSessionId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!accessToken) return;
    try {
      await deleteWorkoutPlan(accessToken, id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/signin");
  }, [authLoading, isAuthenticated, router]);

  const fetchData = useCallback(async () => {
    if (!accessToken || !user) return;
    setLoading(true);
    try {
      if (tab === "plans") {
        const res = await getWorkoutPlans(accessToken, user.id);
        setPlans(res.items);
      } else {
        const res = await getWorkoutHistory(accessToken);
        setSessions(res.items);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [accessToken, user, tab]);

  useEffect(() => {
    if (accessToken && user) fetchData();
  }, [fetchData, accessToken, user]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const renderExercise = (ex: WorkoutExercise | string, i: number) => {
    if (typeof ex === "string") {
      return (
        <div key={i} className="flex items-center gap-2 text-sm text-stone-500 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-600" />
          {ex}
        </div>
      );
    }
    return (
      <div key={i} className="flex items-center justify-between py-2 border-b border-stone-800/50 last:border-0">
        <span className="text-sm font-medium text-stone-400">{ex.name}</span>
        <div className="flex items-center gap-3 text-xs text-stone-500">
          <span>{ex.sets} × {ex.reps}</span>
          <span>Rest {ex.restPeriod}</span>
        </div>
      </div>
    );
  };

  const renderDay = (plan: WorkoutPlan, weekNum: number, day: WorkoutDay, i: number) => {
    const isCompleted = sessions.some(
      s => s.workoutPlanId === plan.id && s.planWeek === weekNum && s.planDay === day.day
    );

    // Calculate expected chronology to verify adherence
    const planStartDate = new Date(plan.createdAt);
    planStartDate.setHours(0, 0, 0, 0);
    const dayMatch = day.day.match(/\d+/);
    const daySequence = dayMatch ? parseInt(dayMatch[0]) : 1;
    const daysFromStart = ((weekNum - 1) * 7) + (daySequence - 1);
    
    const expectedDate = new Date(planStartDate);
    expectedDate.setDate(expectedDate.getDate() + daysFromStart);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const isMissed = !isCompleted && expectedDate < today;

    return (
      <div key={i} className="py-3 border-b border-stone-800/30 last:border-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-stone-400">
              {day.day}
              <span className="text-stone-600 font-normal ml-2 text-xs hidden sm:inline-block">({expectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})</span>
            </span>
            {isCompleted ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded uppercase border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
                <Check className="w-3 h-3" /> Completed
              </span>
            ) : isMissed ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded uppercase border border-red-500/20">
                <X className="w-3 h-3" /> Missed
              </span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-stone-700 shadow-[0_0_5px_rgba(255,255,255,0.05)]" />
            )}
          </div>
          <span className="text-xs text-primary-400 font-medium">{day.focus}</span>
        </div>
        {day.exercises.length === 0 ? (
          <span className="text-xs text-stone-600 italic">Rest day — recover and recharge</span>
        ) : (
          <div className="mt-1 opacity-90">{day.exercises.map((ex, j) => renderExercise(ex as WorkoutExercise | string, j))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <header className="border-b border-stone-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-stone-500 hover:text-stone-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-stone-100">Workouts</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/workouts/log"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-stone-400 border border-stone-700 hover:border-stone-600 rounded-lg transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              Log Session
            </Link>
            <Link
              href="/workouts/generate"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-black bg-primary-500 hover:bg-primary-600 rounded-lg shadow-lg shadow-primary-500/15 transition-all"
            >
              <Plus className="w-4 h-4" />
              Generate Plan
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="flex gap-1 p-1 bg-stone-900 rounded-xl w-fit">
          {(["plans", "sessions"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                tab === t
                  ? "bg-stone-800 text-stone-100 shadow-sm"
                  : "text-stone-500 hover:text-stone-400"
              }`}
            >
              {t === "plans" ? "My Plans" : "Session Log"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {tab === "plans" ? (
              <motion.div
                key="plans"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {plans.length === 0 ? (
                  <div className="text-center py-20">
                    <Dumbbell className="w-12 h-12 text-stone-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-stone-400 mb-2">No workout plans yet</h3>
                    <p className="text-stone-600 mb-6">Generate your first AI-powered plan</p>
                    <Link
                      href="/workouts/generate"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-black font-medium rounded-xl shadow-lg"
                    >
                      <Plus className="w-4 h-4" /> Generate Plan
                    </Link>
                  </div>
                ) : (
                  plans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      layout
                      className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden"
                    >
                      {/* Plan header */}
                      <div
                        onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                        className="w-full flex items-center justify-between p-5 cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center">
                            <Target className="w-5 h-5 text-primary-400" />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-stone-100">
                                {GOAL_LABELS[plan.goal] || plan.goal}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[plan.difficulty] || "text-stone-400 bg-stone-800 border-stone-700"}`}>
                                {plan.difficulty}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {plan.durationWeeks} weeks</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(plan.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlan(plan.id);
                            }}
                            className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mr-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronDown className={`w-5 h-5 text-stone-500 transition-transform ${expandedPlan === plan.id ? "rotate-180" : ""}`} />
                        </div>
                      </div>

                      {/* Plan body */}
                      <AnimatePresence>
                        {expandedPlan === plan.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-stone-800 overflow-hidden"
                          >
                            <div className="p-5 space-y-2">
                              {plan.workouts.map((week) => (
                                <div key={week.week} className="border border-stone-800 rounded-xl overflow-hidden">
                                  <button
                                    onClick={() => setExpandedWeek(expandedWeek === `${plan.id}-${week.week}` ? null : `${plan.id}-${week.week}`)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-800/50 transition-colors cursor-pointer"
                                  >
                                    <span className="text-sm font-medium text-stone-400">Week {week.week}</span>
                                    <ChevronRight className={`w-4 h-4 text-stone-500 transition-transform ${expandedWeek === `${plan.id}-${week.week}` ? "rotate-90" : ""}`} />
                                  </button>
                                  <AnimatePresence>
                                    {expandedWeek === `${plan.id}-${week.week}` && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-stone-800 px-4 pb-3 overflow-hidden"
                                      >
                                        {week.days.map((day, i) => renderDay(plan, week.week, day, i))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {sessions.length === 0 ? (
                  <div className="text-center py-20">
                    <ClipboardList className="w-12 h-12 text-stone-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-stone-400 mb-2">No sessions logged</h3>
                    <p className="text-stone-600 mb-6">Log your first workout session</p>
                    <Link
                      href="/workouts/log"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-black font-medium rounded-xl shadow-lg"
                    >
                      <Plus className="w-4 h-4" /> Log Session
                    </Link>
                  </div>
                ) : (
                  sessions.map((session, i) =>
                    editingSessionId === session.id ? (
                      <motion.div
                        key={session.id}
                        className="bg-stone-900 border border-primary-500/30 rounded-xl p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={editData.exercise || ""}
                            onChange={(e) => setEditData({ ...editData, exercise: e.target.value })}
                            className="bg-stone-800 text-stone-100 px-3 py-1.5 rounded-lg border border-stone-700 w-full mr-3 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          />
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => setEditingSessionId(null)}
                              className="p-1.5 text-stone-500 hover:text-stone-300 rounded-lg bg-stone-800 border border-stone-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateSession(session.id)}
                              className="p-1.5 text-black hover:bg-primary-600 rounded-lg bg-primary-500 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            placeholder="Sets"
                            value={editData.sets || ""}
                            onChange={(e) => setEditData({ ...editData, sets: parseInt(e.target.value) || 0 })}
                            className="bg-stone-800 text-stone-100 px-2 py-1.5 rounded-lg border border-stone-700 text-sm w-full outline-none focus:border-primary-500"
                          />
                          <input
                            type="number"
                            placeholder="Reps"
                            value={editData.reps || ""}
                            onChange={(e) => setEditData({ ...editData, reps: parseInt(e.target.value) || 0 })}
                            className="bg-stone-800 text-stone-100 px-2 py-1.5 rounded-lg border border-stone-700 text-sm w-full outline-none focus:border-primary-500"
                          />
                          <input
                            type="number"
                            placeholder="Dur (min)"
                            value={editData.duration || ""}
                            onChange={(e) => setEditData({ ...editData, duration: parseInt(e.target.value) || 0 })}
                            className="bg-stone-800 text-stone-100 px-2 py-1.5 rounded-lg border border-stone-700 text-sm w-full outline-none focus:border-primary-500"
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col justify-center"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 flex-shrink-0 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center">
                              <Zap className="w-5 h-5 text-primary-400" />
                            </div>
                            <div>
                              <div className="font-medium text-stone-100">{session.exercise}</div>
                              <div className="flex items-center gap-3 mt-0.5 text-xs text-stone-500">
                                {session.sets && session.reps && (
                                  <span>{session.sets} × {session.reps} reps</span>
                                )}
                                {session.duration && (
                                  <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {session.duration} min</span>
                                )}
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(session.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {session.formScore != null && (
                              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-lg mr-2">
                                <Star className="w-3.5 h-3.5 text-primary-400" />
                                <span className="text-sm font-semibold text-primary-400">{session.formScore}</span>
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setEditingSessionId(session.id);
                                setEditData(session);
                              }}
                              className="p-1.5 text-stone-500 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSession(session.id)}
                              className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
