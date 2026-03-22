"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { getProgressHistory, getProgressAnalytics, ProgressLog, ProgressAnalytics, updateProfile } from "../lib/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Dumbbell,
  LogOut,
  Loader2,
  User,
  Target,
  Activity,
  Utensils,
  Ruler,
  Weight,
  Calendar,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Bot,
  Edit,
  X,
  AlertCircle,
} from "lucide-react";

const GOAL_LABELS: Record<string, string> = {
  LOSE_WEIGHT: "Lose Weight",
  GAIN_MUSCLE: "Build Muscle",
  MAINTAIN: "Stay Fit",
  IMPROVE_ENDURANCE: "Boost Endurance",
  INCREASE_FLEXIBILITY: "Get Flexible",
};

const ACTIVITY_LABELS: Record<string, string> = {
  SEDENTARY: "Sedentary",
  LIGHTLY_ACTIVE: "Lightly Active",
  MODERATELY_ACTIVE: "Moderately Active",
  VERY_ACTIVE: "Very Active",
  EXTRA_ACTIVE: "Athlete",
};

const DIET_LABELS: Record<string, string> = {
  NONE: "No Preference",
  VEGETARIAN: "Vegetarian",
  VEGAN: "Vegan",
  KETO: "Keto",
  PALEO: "Paleo",
  GLUTEN_FREE: "Gluten Free",
};

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, isOnboarded, logout, accessToken: token, updateUser } = useAuth();
  const router = useRouter();

  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [analyticsData, setAnalyticsData] = useState<ProgressAnalytics | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    age: user?.age || "",
    height: user?.height || "",
    fitnessGoal: user?.fitnessGoal || "LOSE_WEIGHT",
    activityLevel: user?.activityLevel || "LIGHTLY_ACTIVE",
    dietPreference: user?.dietPreference || "NONE",
    medicalConditions: user?.medicalConditions || ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditModalOpen && user) {
      setEditFormData({
        age: user.age || "",
        height: user.height || "",
        fitnessGoal: user.fitnessGoal || "LOSE_WEIGHT",
        activityLevel: user.activityLevel || "LIGHTLY_ACTIVE",
        dietPreference: user.dietPreference || "NONE",
        medicalConditions: user.medicalConditions || ""
      });
    }
  }, [isEditModalOpen, user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    } else if (!isLoading && isAuthenticated && !isOnboarded) {
      router.push("/onboarding");
    }
  }, [isLoading, isAuthenticated, isOnboarded, router]);

  useEffect(() => {
    if (token && isAuthenticated) {
      fetchData();
    }
  }, [token, isAuthenticated]);

  const fetchData = async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      const [logs, analytics] = await Promise.all([
        getProgressHistory(token, 1, 30),
        getProgressAnalytics(token)
      ]);
      setProgressLogs(logs.items.slice().reverse());
      setAnalyticsData(analytics);
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);
    try {
      const payload = {
        age: editFormData.age ? Number(editFormData.age) : undefined,
        height: editFormData.height ? Number(editFormData.height) : undefined,
        fitnessGoal: editFormData.fitnessGoal,
        activityLevel: editFormData.activityLevel,
        dietPreference: editFormData.dietPreference,
        medicalConditions: (editFormData.medicalConditions || "").trim() !== "" ? (editFormData.medicalConditions || "").trim() : null
      };
      
      await updateUser(payload);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const statsCards = [
    {
      icon: Ruler,
      label: "Height",
      value: user.height ? `${user.height} cm` : "—",
      color: "bg-primary-500/8",
      border: "border-primary-500/15",
      iconColor: "text-primary-400",
    },
    {
      icon: Weight,
      label: "Weight Tracking",
      value: analyticsData?.currentWeight ? `${analyticsData.currentWeight} kg` : (user.weight ? `${user.weight} kg` : "—"),
      subText: analyticsData?.startingWeight ? `Started at ${analyticsData.startingWeight} kg` : "",
      change: analyticsData?.weightChange,
      color: "bg-primary-500/8",
      border: "border-primary-500/15",
      iconColor: "text-primary-400",
    },
    {
      icon: Calendar,
      label: "Age",
      value: user.age ? `${user.age} years` : "—",
      color: "bg-primary-500/8",
      border: "border-primary-500/15",
      iconColor: "text-primary-400",
    },
    {
      icon: Target,
      label: "Goal",
      value: user.fitnessGoal
        ? GOAL_LABELS[user.fitnessGoal as string] || user.fitnessGoal
        : "—",
      color: "bg-primary-500/8",
      border: "border-primary-500/15",
      iconColor: "text-primary-400",
    },
    {
      icon: Activity,
      label: "Activity",
      value: user.activityLevel
        ? ACTIVITY_LABELS[user.activityLevel as string] || user.activityLevel
        : "—",
      color: "bg-primary-500/8",
      border: "border-primary-500/15",
      iconColor: "text-primary-400",
    },
    {
      icon: Utensils,
      label: "Diet",
      value: user.dietPreference
        ? DIET_LABELS[user.dietPreference as string] || user.dietPreference
        : "—",
      color: "bg-primary-500/8",
      border: "border-primary-500/15",
      iconColor: "text-primary-400",
    },
    {
      icon: AlertCircle,
      label: "Health Notes",
      value: user.medicalConditions || "None reported",
      color: "bg-red-500/8",
      border: "border-red-500/15",
      iconColor: "text-red-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <header className="border-b border-stone-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/neurafit-logo.png" alt="NeuraFiT Logo" width={150} height={40} className="h-8 w-auto" />
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-stone-500 hover:text-stone-300 hover:bg-stone-800 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Main Dashboard Area) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Hero Welcome Widget (Glassmorphic) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl bg-stone-900 border border-stone-800 p-8 shadow-2xl"
            >
              {/* Radial glow background effect */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10 w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full">
                  <div className="w-16 h-16 shrink-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-black text-2xl font-bold shadow-lg shadow-primary-500/30 relative">
                    {user.name.charAt(0).toUpperCase()}
                    {/* Fire Streak Badge */}
                    {(analyticsData?.streak || 0) > 0 && (
                      <div className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-extrabold px-2 py-0.5 rounded-full border-2 border-stone-900 shadow-[0_0_10px_rgba(220,38,38,0.5)] flex items-center gap-1 z-20" title={`${analyticsData?.streak} Day Streak!`}>
                        🔥 {analyticsData?.streak}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between w-full">
                      <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Welcome back, {user.name.split(" ")[0]} 
                      </h1>
                      <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-stone-950/50 hover:bg-stone-800 border border-stone-800 rounded-xl text-primary-400 font-medium transition-all ml-4 shrink-0"
                      >
                        <Edit className="w-4 h-4" /> Edit Profile
                      </button>
                    </div>
                    <p className="text-stone-400 mt-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" /> 
                      {analyticsData?.activePlanProgress 
                        ? `Week ${Math.ceil((analyticsData.activePlanProgress.completedDays + 1) / 7)} • ${analyticsData.activePlanProgress.percentage}% Plan Completed` 
                        : "AI Coach is ready for your next session"}
                    </p>
                    
                    {/* Active Plan Progress Bar */}
                    {analyticsData?.activePlanProgress && (
                      <div className="mt-4 max-w-sm">
                        <div className="flex justify-between text-xs font-bold text-stone-500 mb-1.5 uppercase tracking-wider">
                           <span>{analyticsData.activePlanProgress.goal.replace(/_/g, ' ')} PLAN</span>
                           <span className="text-primary-400">{analyticsData.activePlanProgress.completedDays} / {analyticsData.activePlanProgress.totalDays} Days</span>
                        </div>
                        <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${analyticsData.activePlanProgress.percentage}%` }}
                             transition={{ duration: 1, delay: 0.5 }}
                             className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full relative" 
                           >
                              <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/30 blur-sm" />
                           </motion.div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-stone-100">Edit Profile</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-stone-400 hover:text-stone-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-stone-400">Age (years)</label>
                  <input
                    type="number"
                    value={editFormData.age}
                    onChange={(e) => setEditFormData({...editFormData, age: e.target.value})}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-stone-100 outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-stone-400">Height (cm)</label>
                  <input
                    type="number"
                    value={editFormData.height}
                    onChange={(e) => setEditFormData({...editFormData, height: e.target.value})}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-stone-100 outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-stone-400">Fitness Goal</label>
                <select
                  value={editFormData.fitnessGoal}
                  onChange={(e) => setEditFormData({...editFormData, fitnessGoal: e.target.value})}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-100 outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="LOSE_WEIGHT">Lose Weight</option>
                  <option value="GAIN_MUSCLE">Build Muscle</option>
                  <option value="MAINTAIN">Stay Fit</option>
                  <option value="IMPROVE_ENDURANCE">Boost Endurance</option>
                  <option value="INCREASE_FLEXIBILITY">Get Flexible</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-stone-400">Activity Level</label>
                <select
                  value={editFormData.activityLevel}
                  onChange={(e) => setEditFormData({...editFormData, activityLevel: e.target.value})}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-100 outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="SEDENTARY">Sedentary</option>
                  <option value="LIGHTLY_ACTIVE">Lightly Active</option>
                  <option value="MODERATELY_ACTIVE">Moderately Active</option>
                  <option value="VERY_ACTIVE">Very Active</option>
                  <option value="EXTRA_ACTIVE">Athlete</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-stone-400">Diet Preference</label>
                <select
                  value={editFormData.dietPreference}
                  onChange={(e) => setEditFormData({...editFormData, dietPreference: e.target.value})}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-100 outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="NONE">No Preference</option>
                  <option value="VEGETARIAN">Vegetarian</option>
                  <option value="VEGAN">Vegan</option>
                  <option value="KETO">Keto</option>
                  <option value="PALEO">Paleo</option>
                  <option value="GLUTEN_FREE">Gluten Free</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-stone-400">Medical Conditions & Injuries</label>
                <textarea
                  value={editFormData.medicalConditions}
                  onChange={(e) => setEditFormData({...editFormData, medicalConditions: e.target.value})}
                  placeholder="E.g., Torn ACL, lower back pain, asthma..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-100 outline-none focus:border-primary-500 transition-colors h-24 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-stone-400 hover:text-stone-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-primary-500 text-black font-bold shadow-lg shadow-primary-500/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
