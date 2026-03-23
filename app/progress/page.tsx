"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import {
  getProgressHistory,
  getProgressAnalytics,
  ProgressLog,
  ProgressAnalytics,
  updateProfile,
  updateProgress,
  deleteProgress,
  LogProgressData,
} from "../lib/api";
import {
  LineChart,
  Loader2,
  Plus,
  ArrowLeft,
  Calendar,
  Scale,
  Moon,
  Droplets,
  Footprints,
  Activity,
  Target,
  Dumbbell,
  Utensils,
  Edit2,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ProgressPage() {
  const { user, isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "history">("overview");
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly" | "annual">("weekly");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [history, setHistory] = useState<ProgressLog[]>([]);
  const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState("");
  const [targetLoading, setTargetLoading] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ProgressLog>>({});

  const handleDeleteLog = async (id: string) => {
    if (!accessToken) return;
    try {
      await deleteProgress(accessToken, id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      fetchData(); // Refresh analytics
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateLog = async (id: string) => {
    if (!accessToken) return;
    try {
      const payload: Partial<LogProgressData> = {
        weight: editData.weight ?? undefined,
        bodyFat: editData.bodyFat ?? undefined,
        muscleMass: editData.muscleMass ?? undefined,
        sleepHours: editData.sleepHours ?? undefined,
        waterIntake: editData.waterIntake ?? undefined,
        steps: editData.steps ?? undefined,
        notes: editData.notes ?? undefined,
        date: editData.date ?? undefined,
      };
      
      const updated = await updateProgress(accessToken, id, payload);
      setHistory((prev) => prev.map((h) => (h.id === id ? updated : h)));
      setEditingLogId(null);
      fetchData(); // Refresh analytics
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/signin");
  }, [authLoading, isAuthenticated, router]);

  const fetchData = useCallback(async () => {
    if (!accessToken || !user) return;
    setLoading(true);
    try {
      if (tab === "overview") {
        const res = await getProgressAnalytics(accessToken, timeframe);
        setAnalytics(res);
        setTargetInput(res.targetWeight?.toString() || "");
      } else {
        const res = await getProgressHistory(accessToken);
        setHistory(res.items);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [accessToken, user, tab, timeframe]);

  useEffect(() => {
    if (accessToken && user) fetchData();
  }, [fetchData, accessToken, user]);

  const handleUpdateTarget = async () => {
    if (!accessToken || !user || !targetInput) return;
    setTargetLoading(true);
    try {
      await updateProfile(user.id, accessToken, { targetWeight: parseFloat(targetInput) });
      setIsEditingTarget(false);
      fetchData();
    } catch {
      // silent
    } finally {
      setTargetLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  // Calculate goal progress percentage
  let goalProgress = 0;
  let isGoalReached = false;
  if (analytics?.targetWeight && analytics?.currentWeight && analytics?.startingWeight) {
    const { targetWeight, currentWeight, startingWeight } = analytics;
    const isWeightLoss = targetWeight < startingWeight;

    if (isWeightLoss) {
      if (currentWeight <= targetWeight) {
        goalProgress = 100;
        isGoalReached = true;
      } else if (currentWeight > startingWeight) {
        goalProgress = 0;
      } else {
        const totalToLose = startingWeight - targetWeight;
        const lostSoFar = startingWeight - currentWeight;
        goalProgress = Math.max(0, Math.min(100, (lostSoFar / totalToLose) * 100));
      }
    } else {
      if (currentWeight >= targetWeight) {
        goalProgress = 100;
        isGoalReached = true;
      } else if (currentWeight < startingWeight) {
        goalProgress = 0;
      } else {
        const totalToGain = targetWeight - startingWeight;
        const gainedSoFar = currentWeight - startingWeight;
        goalProgress = Math.max(0, Math.min(100, (gainedSoFar / totalToGain) * 100));
      }
    }
  }

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
                <LineChart className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-stone-100">Progress</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/workouts/log"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-stone-400 hover:text-stone-200 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg transition-all"
            >
              <Dumbbell className="w-4 h-4" />
              Log Workout
            </Link>
            <Link
              href="/meals/log"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-stone-400 hover:text-stone-200 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg transition-all"
            >
              <Utensils className="w-4 h-4" />
              Log Meal
            </Link>
            <Link
              href="/progress/log"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-black bg-primary-500 hover:bg-primary-600 rounded-lg shadow-lg shadow-primary-500/15 transition-all"
            >
              <Plus className="w-4 h-4" />
              Log Progress
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="flex gap-1 p-1 bg-stone-900 rounded-xl w-fit">
          {(["overview", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all capitalize cursor-pointer ${
                tab === t
                  ? "bg-stone-800 text-stone-100 shadow-sm"
                  : "text-stone-500 hover:text-stone-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {tab === "overview" && analytics ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Timeframe Segment Control */}
                <div className="flex gap-1 p-1 bg-stone-900 rounded-xl w-full sm:w-fit mx-auto border border-stone-800 shadow-sm">
                  {(["daily", "weekly", "monthly", "annual"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all capitalize cursor-pointer ${
                        timeframe === tf
                          ? "bg-stone-800 text-stone-100 shadow-md border border-stone-700"
                          : "text-stone-500 hover:text-stone-300"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                {/* Goal Progress Section */}
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-stone-100 font-semibold">
                      <Target className="w-5 h-5 text-primary-400" />
                      Target Weight Progress
                    </div>
                    {!isEditingTarget ? (
                      <button
                        onClick={() => setIsEditingTarget(true)}
                        className="text-xs text-primary-400 hover:text-primary-300 font-medium cursor-pointer"
                      >
                        {analytics.targetWeight ? "Edit Target" : "Set Target"}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={targetInput}
                          onChange={(e) => setTargetInput(e.target.value)}
                          className="w-20 px-2 py-1 bg-stone-800 border border-stone-700 rounded text-sm text-stone-100"
                          placeholder="kg"
                        />
                        <button
                          onClick={handleUpdateTarget}
                          disabled={targetLoading || !targetInput}
                          className="px-3 py-1 bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 rounded text-sm font-medium transition-colors cursor-pointer"
                        >
                          {targetLoading ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setIsEditingTarget(false)}
                          className="px-3 py-1 text-stone-500 hover:text-stone-300 text-sm cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {analytics.targetWeight && analytics.currentWeight ? (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Start: {analytics.startingWeight} kg</span>
                        <span className="text-stone-100 font-medium">{analytics.currentWeight} kg</span>
                        <span className="text-primary-400 font-medium">Goal: {analytics.targetWeight} kg</span>
                      </div>
                      <div className="h-4 bg-stone-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${goalProgress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full ${isGoalReached ? "bg-primary-500" : "bg-primary-500"}`}
                        />
                      </div>
                      <div className="text-center text-sm text-stone-500">
                        {isGoalReached ? (
                          <span className="text-primary-400 font-medium">🎉 Goal Achieved!</span>
                        ) : (
                          <span>{Math.round(goalProgress)}% towards your goal</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-stone-800 rounded-xl">
                      <p className="text-stone-500 text-sm mb-3">Set a target weight to track your progress</p>
                      <button
                        onClick={() => setIsEditingTarget(true)}
                        className="px-4 py-2 bg-stone-800 text-stone-300 rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors cursor-pointer"
                      >
                        Set Target Weight
                      </button>
                    </div>
                  )}
                </div>

                {/* Health Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-stone-500 mb-3">
                      <Moon className="w-4 h-4 text-primary-400" />
                      <span className="text-sm font-medium">Avg Sleep</span>
                    </div>
                    <div className="text-2xl font-bold text-stone-100">{analytics.healthMetrics?.avgSleep || 0} <span className="text-sm text-stone-500 font-normal">hrs</span></div>
                  </div>
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-stone-500 mb-3">
                      <Droplets className="w-4 h-4 text-primary-400" />
                      <span className="text-sm font-medium">Avg Water</span>
                    </div>
                    <div className="text-2xl font-bold text-stone-100">{analytics.healthMetrics?.avgWater || 0} <span className="text-sm text-stone-500 font-normal">L</span></div>
                  </div>
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-stone-500 mb-3">
                      <Footprints className="w-4 h-4 text-primary-400" />
                      <span className="text-sm font-medium">Avg Steps</span>
                    </div>
                    <div className="text-2xl font-bold text-stone-100">{analytics.healthMetrics?.avgSteps?.toLocaleString() || 0}</div>
                  </div>
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-stone-500 mb-3">
                      <Scale className="w-4 h-4 text-primary-400" />
                      <span className="text-sm font-medium">Weight Change</span>
                    </div>
                    <div className="text-2xl font-bold text-stone-100">
                      {analytics.weightChange ? (
                        <span className={analytics.weightChange.value > 0 ? "text-primary-400" : "text-primary-400"}>
                          {analytics.weightChange.value > 0 ? "+" : ""}{analytics.weightChange.value} <span className="text-sm text-stone-500 font-normal">kg</span>
                        </span>
                      ) : (
                        <span className="text-stone-500">-</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Activity Calendar */}
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-stone-100 font-semibold">
                      <Calendar className="w-5 h-5 text-primary-400" />
                      Activity Calendar
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                        className="p-1.5 text-stone-500 hover:text-stone-300 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium text-stone-100 min-w-[100px] text-center">
                        {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                      <button 
                        onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                        className="p-1.5 text-stone-500 hover:text-stone-300 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1.5 md:gap-3">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-stone-500 py-1">{day}</div>
                    ))}

                    {Array.from({ length: new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square rounded-lg bg-transparent" />
                    ))}

                    {Array.from({ length: new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                      const dayNumber = i + 1;
                      const dateObj = new Date(Date.UTC(calendarDate.getFullYear(), calendarDate.getMonth(), dayNumber));
                      const dateStr = dateObj.toISOString().split('T')[0];
                      
                      const dayData = analytics.activityCalendar?.find(d => d.date === dateStr);
                      const isActive = dayData?.hasWorkout || dayData?.hasMeal || dayData?.hasProgress;
                      const isToday = new Date().toISOString().split('T')[0] === dateStr;

                      return (
                        <div
                          key={`day-${dayNumber}`}
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center relative group ${
                            isActive ? "bg-stone-800 border-stone-700 hover:bg-stone-700" : "bg-[#000000] border-stone-800"
                          } border transition-colors`}
                        >
                          <span className={`text-xs ${isActive ? "text-stone-100" : "text-stone-600"} ${isToday ? "font-bold text-primary-400" : ""}`}>{dayNumber}</span>
                          <div className="absolute bottom-1 flex gap-0.5">
                            {dayData?.hasWorkout && <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
                            {dayData?.hasMeal && <div className="w-1.5 h-1.5 rounded-full bg-stone-200" />}
                            {dayData?.hasProgress && <div className="w-1.5 h-1.5 rounded-full bg-stone-500" />}
                          </div>

                          {/* Tooltip */}
                          {isActive && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-stone-800 text-stone-100 text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl border border-stone-700">
                              <div className="font-semibold mb-1 text-center">{dateObj.toLocaleDateString()}</div>
                              {dayData?.hasWorkout && <div className="flex items-center gap-1.5"><Dumbbell className="w-3 h-3 text-primary-400" /> Workout Logged</div>}
                              {dayData?.hasMeal && <div className="flex items-center gap-1.5"><Utensils className="w-3 h-3 text-primary-400" /> Meal Logged</div>}
                              {dayData?.hasProgress && <div className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-primary-400" /> Progress Logged</div>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 mt-6 text-xs text-stone-500 font-medium border-t border-stone-800 pt-5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary-500" /> Workout
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-stone-200" /> Meal
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-stone-500" /> Progress Log
                    </div>
                  </div>
                </div>

              </motion.div>
            ) : tab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {history.length === 0 ? (
                  <div className="text-center py-20">
                    <LineChart className="w-12 h-12 text-stone-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-stone-400 mb-2">No progress logged</h3>
                    <p className="text-stone-600 mb-6">Start tracking your health metrics</p>
                    <Link
                      href="/progress/log"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-black font-medium rounded-xl shadow-lg"
                    >
                      <Plus className="w-4 h-4" /> Log Progress
                    </Link>
                  </div>
                ) : (
                  history.map((log, i) =>
                    editingLogId === log.id ? (
                      <motion.div
                        key={log.id}
                        className="bg-stone-900 border border-primary-500/30 rounded-xl p-5 space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
                          <div className="flex items-center gap-2 text-primary-400 font-medium">
                            <Calendar className="w-4 h-4" />
                            Editing {new Date(log.date).toLocaleDateString()}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingLogId(null)}
                              className="p-1.5 text-stone-500 hover:text-stone-300 rounded-lg bg-stone-800 border border-stone-700 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateLog(log.id)}
                              className="p-1.5 text-black hover:bg-primary-600 rounded-lg bg-primary-500 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-stone-500 mb-1 block">Weight (kg)</label>
                            <input
                              type="number"
                              value={editData.weight || ""}
                              onChange={(e) => setEditData({ ...editData, weight: parseFloat(e.target.value) || undefined })}
                              className="bg-stone-800 text-stone-100 px-3 py-1.5 rounded-lg border border-stone-700 text-sm w-full outline-none focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-stone-500 mb-1 block">Body Fat (%)</label>
                            <input
                              type="number"
                              value={editData.bodyFat || ""}
                              onChange={(e) => setEditData({ ...editData, bodyFat: parseFloat(e.target.value) || undefined })}
                              className="bg-stone-800 text-stone-100 px-3 py-1.5 rounded-lg border border-stone-700 text-sm w-full outline-none focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-stone-500 mb-1 block">Muscle (kg)</label>
                            <input
                              type="number"
                              value={editData.muscleMass || ""}
                              onChange={(e) => setEditData({ ...editData, muscleMass: parseFloat(e.target.value) || undefined })}
                              className="bg-stone-800 text-stone-100 px-3 py-1.5 rounded-lg border border-stone-700 text-sm w-full outline-none focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-stone-500 mb-1 block">Sleep (hrs)</label>
                            <input
                              type="number"
                              value={editData.sleepHours || ""}
                              onChange={(e) => setEditData({ ...editData, sleepHours: parseFloat(e.target.value) || undefined })}
                              className="bg-stone-800 text-stone-100 px-3 py-1.5 rounded-lg border border-stone-700 text-sm w-full outline-none focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-stone-500 mb-1 block">Water (L)</label>
                            <input
                              type="number"
                              value={editData.waterIntake || ""}
                              onChange={(e) => setEditData({ ...editData, waterIntake: parseFloat(e.target.value) || undefined })}
                              className="bg-stone-800 text-stone-100 px-3 py-1.5 rounded-lg border border-stone-700 text-sm w-full outline-none focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-stone-500 mb-1 block">Steps</label>
                            <input
                              type="number"
                              value={editData.steps || ""}
                              onChange={(e) => setEditData({ ...editData, steps: parseInt(e.target.value) || undefined })}
                              className="bg-stone-800 text-stone-100 px-3 py-1.5 rounded-lg border border-stone-700 text-sm w-full outline-none focus:border-primary-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-stone-500 mb-1 block">Notes</label>
                          <input
                            type="text"
                            value={editData.notes || ""}
                            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                            className="bg-stone-800 text-stone-100 px-3 py-1.5 rounded-lg border border-stone-700 text-sm w-full outline-none focus:border-primary-500"
                            placeholder="Add notes..."
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-stone-900 border border-stone-800 rounded-xl p-5"
                      >
                        <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-3">
                          <div className="flex items-center gap-2 text-stone-100 font-medium">
                            <Calendar className="w-4 h-4 text-stone-500" />
                            {new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingLogId(log.id);
                                setEditData(log);
                              }}
                              className="p-1.5 text-stone-500 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                          {log.weight != null && (
                            <div>
                              <div className="text-xs text-stone-500 mb-1 flex items-center gap-1"><Scale className="w-3.5 h-3.5" /> Weight</div>
                              <div className="font-semibold text-stone-100">{log.weight} kg</div>
                            </div>
                          )}
                          {log.bodyFat != null && (
                            <div>
                              <div className="text-xs text-stone-500 mb-1 flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> Body Fat</div>
                              <div className="font-semibold text-stone-100">{log.bodyFat} %</div>
                            </div>
                          )}
                          {log.muscleMass != null && (
                            <div>
                              <div className="text-xs text-stone-500 mb-1 flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5" /> Muscle</div>
                              <div className="font-semibold text-stone-100">{log.muscleMass} kg</div>
                            </div>
                          )}
                          {log.sleepHours != null && (
                            <div>
                              <div className="text-xs text-stone-500 mb-1 flex items-center gap-1"><Moon className="w-3.5 h-3.5" /> Sleep</div>
                              <div className="font-semibold text-stone-100">{log.sleepHours} hrs</div>
                            </div>
                          )}
                          {log.waterIntake != null && (
                            <div>
                              <div className="text-xs text-stone-500 mb-1 flex items-center gap-1"><Droplets className="w-3.5 h-3.5" /> Water</div>
                              <div className="font-semibold text-stone-100">{log.waterIntake} L</div>
                            </div>
                          )}
                          {log.steps != null && (
                            <div>
                              <div className="text-xs text-stone-500 mb-1 flex items-center gap-1"><Footprints className="w-3.5 h-3.5" /> Steps</div>
                              <div className="font-semibold text-stone-100">{log.steps.toLocaleString()}</div>
                            </div>
                          )}
                        </div>

                        {log.notes && (
                          <div className="text-sm text-stone-500 bg-stone-800/50 p-3 rounded-lg border border-stone-800">
                            &quot;{log.notes}&quot;
                          </div>
                        )}
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
