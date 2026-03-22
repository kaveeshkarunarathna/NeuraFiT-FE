"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { getMealHistory, getMealPlans, updateMealLog, deleteMealLog, deleteMealPlan, MealPlan, MealLog } from "../lib/api";
import {
  Utensils,
  Loader2,
  Plus,
  ClipboardList,
  ArrowLeft,
  Calendar,
  Flame,
  Beef,
  Wheat,
  Droplets,
  ChevronDown,
  ChevronUp,
  Camera,
  Edit2,
  Trash2,
  X,
  Check,
} from "lucide-react";

export default function MealsPage() {
  const { user, isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"plans" | "log">("log");
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<MealLog>>({});

  const handleDeleteLog = async (id: string) => {
    if (!accessToken) return;
    try {
      await deleteMealLog(accessToken, id);
      setMealLogs((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateLog = async (id: string) => {
    if (!accessToken) return;
    try {
      const updated = await updateMealLog(accessToken, id, editData);
      setMealLogs((prev) => prev.map((m) => (m.id === id ? updated : m)));
      setEditingMealId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!accessToken) return;
    try {
      await deleteMealPlan(accessToken, id);
      setMealPlans((prev) => prev.filter((p) => p.id !== id));
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
      if (tab === "log") {
        const res = await getMealHistory(accessToken);
        setMealLogs(res.items);
      } else {
        const res = await getMealPlans(accessToken);
        setMealPlans(res.items);
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

  const MacroPill = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" /> {value}{label}
    </span>
  );

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
                <Utensils className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-stone-100">Meals</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/meals/log"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-stone-400 border border-stone-700 hover:border-stone-600 rounded-lg transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              Log Meal
            </Link>
            <Link
              href="/meals/scan"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-300 border border-primary-700 hover:border-primary-500 hover:bg-primary-500/10 rounded-lg transition-all"
            >
              <Camera className="w-4 h-4" />
              Scan Meal
            </Link>
            <Link
              href="/meals/generate"
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
          {(["log", "plans"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                tab === t
                  ? "bg-stone-800 text-stone-100 shadow-sm"
                  : "text-stone-500 hover:text-stone-400"
              }`}
            >
              {t === "log" ? "Meal Log" : "My Plans"}
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
            {tab === "log" ? (
              <motion.div
                key="log"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {mealLogs.length === 0 ? (
                  <div className="text-center py-20">
                    <Utensils className="w-12 h-12 text-stone-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-stone-400 mb-2">No meals logged</h3>
                    <p className="text-stone-600 mb-6">Start tracking your nutrition</p>
                    <Link
                      href="/meals/log"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-black font-medium rounded-xl shadow-lg"
                    >
                      <Plus className="w-4 h-4" /> Log Meal
                    </Link>
                  </div>
                ) : (
                  mealLogs.map((meal, i) =>
                    editingMealId === meal.id ? (
                      <motion.div
                        key={meal.id}
                        className="bg-stone-900 border border-primary-500/30 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={editData.foodName || ""}
                            onChange={(e) => setEditData({ ...editData, foodName: e.target.value })}
                            className="bg-stone-800 text-stone-100 px-3 py-1.5 rounded-lg border border-stone-700 w-full mr-3 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          />
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => setEditingMealId(null)}
                              className="p-1.5 text-stone-500 hover:text-stone-300 rounded-lg bg-stone-800 border border-stone-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateLog(meal.id)}
                              className="p-1.5 text-black hover:bg-primary-600 rounded-lg bg-primary-500 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <input
                            type="number"
                            placeholder="Kcal"
                            value={editData.calories || ""}
                            onChange={(e) => setEditData({ ...editData, calories: parseInt(e.target.value) || 0 })}
                            className="bg-stone-800 text-stone-100 px-2 py-1.5 rounded-lg border border-stone-700 text-sm w-full outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          />
                          <input
                            type="number"
                            placeholder="Pro (g)"
                            value={editData.protein || ""}
                            onChange={(e) => setEditData({ ...editData, protein: parseFloat(e.target.value) || 0 })}
                            className="bg-stone-800 text-stone-100 px-2 py-1.5 rounded-lg border border-stone-700 text-sm w-full outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          />
                          <input
                            type="number"
                            placeholder="Carb (g)"
                            value={editData.carbs || ""}
                            onChange={(e) => setEditData({ ...editData, carbs: parseFloat(e.target.value) || 0 })}
                            className="bg-stone-800 text-stone-100 px-2 py-1.5 rounded-lg border border-stone-700 text-sm w-full outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          />
                          <input
                            type="number"
                            placeholder="Fat (g)"
                            value={editData.fat || ""}
                            onChange={(e) => setEditData({ ...editData, fat: parseFloat(e.target.value) || 0 })}
                            className="bg-stone-800 text-stone-100 px-2 py-1.5 rounded-lg border border-stone-700 text-sm w-full outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={meal.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-stone-900 border border-stone-800 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center">
                              <Utensils className="w-5 h-5 text-primary-400" />
                            </div>
                            <div>
                              <div className="font-medium text-stone-100">{meal.foodName}</div>
                              <div className="flex items-center gap-1 text-xs text-stone-500">
                                <Calendar className="w-3 h-3" />
                                {new Date(meal.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-lg mr-2">
                              <Flame className="w-3.5 h-3.5 text-primary-400" />
                              <span className="text-sm font-semibold text-primary-400">{meal.calories} kcal</span>
                            </div>
                            <button
                              onClick={() => {
                                setEditingMealId(meal.id);
                                setEditData(meal);
                              }}
                              className="p-1.5 text-stone-500 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLog(meal.id)}
                              className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="sm:hidden flex items-center gap-1.5 px-2 py-0.5 bg-primary-500/10 rounded-full mr-1">
                            <Flame className="w-3 h-3 text-primary-400" />
                            <span className="text-xs font-semibold text-primary-400">{meal.calories} kcal</span>
                          </div>
                          <MacroPill icon={Beef} label="g P" value={String(meal.protein)} color="text-primary-400 bg-primary-500/10" />
                          <MacroPill icon={Wheat} label="g C" value={String(meal.carbs)} color="text-primary-400 bg-primary-500/10" />
                          <MacroPill icon={Droplets} label="g F" value={String(meal.fat)} color="text-primary-400 bg-primary-500/10" />
                        </div>
                      </motion.div>
                    )
                  )
                )}
              </motion.div>
            ) : (
              <motion.div
                key="plans"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {mealPlans.length === 0 ? (
                  <div className="text-center py-20">
                    <Utensils className="w-12 h-12 text-stone-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-stone-400 mb-2">No meal plans yet</h3>
                    <p className="text-stone-600 mb-6">Get AI-powered nutrition recommendations</p>
                    <Link
                      href="/meals/generate"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-black font-medium rounded-xl shadow-lg"
                    >
                      <Plus className="w-4 h-4" /> Generate Plan
                    </Link>
                  </div>
                ) : (
                  mealPlans.map((plan, i) => {
                    const isExpanded = expandedPlan === plan.id;
                    const macros = typeof plan.macros === "string" ? JSON.parse(plan.macros) : plan.macros;
                    const meals = typeof plan.meals === "string" ? JSON.parse(plan.meals) : (plan.meals || []);

                    return (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                          className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-stone-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center">
                              <Utensils className="w-5 h-5 text-primary-400" />
                            </div>
                            <div>
                              <div className="font-medium text-stone-100">
                                {plan.calories} kcal Daily Plan
                              </div>
                              <div className="flex items-center gap-1 text-xs text-stone-500">
                                <Calendar className="w-3 h-3" />
                                {new Date(plan.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2">
                              <MacroPill icon={Beef} label="g" value={String(macros?.protein || 0)} color="text-primary-400 bg-primary-500/10" />
                              <MacroPill icon={Wheat} label="g" value={String(macros?.carbs || 0)} color="text-primary-400 bg-primary-500/10" />
                              <MacroPill icon={Droplets} label="g" value={String(macros?.fat || 0)} color="text-primary-400 bg-primary-500/10" />
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePlan(plan.id);
                              }}
                              className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mr-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-stone-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-stone-500" />
                            )}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              {/* Macro summary on mobile */}
                              <div className="sm:hidden flex items-center gap-2 px-4 pb-3">
                                <MacroPill icon={Beef} label="g P" value={String(macros?.protein || 0)} color="text-primary-400 bg-primary-500/10" />
                                <MacroPill icon={Wheat} label="g C" value={String(macros?.carbs || 0)} color="text-primary-400 bg-primary-500/10" />
                                <MacroPill icon={Droplets} label="g F" value={String(macros?.fat || 0)} color="text-primary-400 bg-primary-500/10" />
                              </div>

                              <div className="border-t border-stone-800 px-4 py-3 space-y-2">
                                {Array.isArray(meals) && meals.map((meal: { name?: string; time?: string; calories?: number; protein?: number; carbs?: number; fat?: number }, mi: number) => (
                                  <div
                                    key={mi}
                                    className="flex items-center justify-between py-2 px-3 bg-stone-800/50 rounded-lg"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400">
                                        {meal.time || "Meal"}
                                      </span>
                                      <span className="text-sm text-stone-200">{meal.name || "Unnamed"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-stone-500">
                                      <span className="flex items-center gap-1 text-primary-400 font-semibold">
                                        <Flame className="w-3 h-3" /> {meal.calories || 0}
                                      </span>
                                      <span>P:{meal.protein || 0}g</span>
                                      <span>C:{meal.carbs || 0}g</span>
                                      <span>F:{meal.fat || 0}g</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
