"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { scanMeal, logMeal, FoodScanResult } from "../../lib/api";
import {
  Camera,
  Loader2,
  ArrowLeft,
  Upload,
  X,
  Sparkles,
  Flame,
  Beef,
  Wheat,
  Droplets,
  CheckCircle,
  ImageIcon,
  Leaf,
  RotateCcw,
  Utensils,
  Scale,
} from "lucide-react";

export default function ScanMealPage() {
  const { isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<FoodScanResult | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [logged, setLogged] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [mealName, setMealName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [servingSize, setServingSize] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/signin");
  }, [authLoading, isAuthenticated, router]);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, or WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanResult(null);
    setError("");
    setLogged(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleAnalyze = async () => {
    if (!accessToken || !selectedFile) return;
    setIsScanning(true);
    setError("");
    setScanResult(null);
    try {
      const hints =
        mealName.trim() || ingredients.trim() || servingSize.trim()
          ? {
              mealName: mealName.trim() || undefined,
              ingredients: ingredients.trim() || undefined,
              servingSize: servingSize.trim() || undefined,
            }
          : undefined;
      const result = await scanMeal(accessToken, selectedFile, hints);
      setScanResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze image");
    } finally {
      setIsScanning(false);
    }
  };

  const handleLogMeal = async () => {
    if (!accessToken || !scanResult) return;
    setIsLogging(true);
    setError("");
    try {
      await logMeal(accessToken, {
        foodName: scanResult.foodName,
        calories: scanResult.estimatedCalories,
        protein: scanResult.protein,
        carbs: scanResult.carbs,
        fat: scanResult.fat,
      });
      setLogged(true);
      setTimeout(() => router.push("/meals"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log meal");
    } finally {
      setIsLogging(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setError("");
    setLogged(false);
    setMealName("");
    setIngredients("");
    setServingSize("");
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (logged) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-stone-100 mb-2">
            Meal Logged!
          </h2>
          <p className="text-stone-500">Redirecting to meals...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <header className="border-b border-stone-800">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            href="/meals"
            className="text-stone-500 hover:text-stone-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-stone-100">
              Scan Meal
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-950/30 border border-red-800 rounded-xl text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Area */}
        {!previewUrl ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
              isDragging
                ? "border-primary-400 bg-primary-500/10"
                : "border-stone-700 hover:border-stone-600 bg-stone-900/50 hover:bg-stone-900"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
            <div className="flex flex-col items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                  isDragging
                    ? "bg-primary-500/20 border border-primary-500/30"
                    : "bg-stone-800 border border-stone-700"
                }`}
              >
                {isDragging ? (
                  <Upload className="w-7 h-7 text-primary-400" />
                ) : (
                  <ImageIcon className="w-7 h-7 text-stone-500" />
                )}
              </div>
              <div>
                <p className="text-stone-200 font-medium mb-1">
                  {isDragging ? "Drop your image here" : "Upload a meal photo"}
                </p>
                <p className="text-stone-500 text-sm">
                  Drag & drop or click to browse • JPEG, PNG, WebP • Max 5MB
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Image Preview */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900"
          >
            <img
              src={previewUrl}
              alt="Meal preview"
              className="w-full max-h-80 object-cover"
            />
            <button
              onClick={handleReset}
              className="absolute top-3 right-3 p-2 bg-stone-900/80 backdrop-blur-sm border border-stone-700 rounded-xl text-stone-400 hover:text-stone-200 hover:border-stone-600 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Meal Details — always visible after image upload */}
        {previewUrl && !scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4"
          >
            <div>
              <p className="text-sm font-medium text-stone-200 mb-1">Know what this is?</p>
              <p className="text-xs text-stone-500">Help us identify it for a more accurate result. All fields are optional.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-stone-400 mb-1.5">
                  <Utensils className="w-3.5 h-3.5" />
                  Meal Name
                </label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g. Chicken Fried Rice"
                  className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-200 text-sm placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-stone-400 mb-1.5">
                  <Leaf className="w-3.5 h-3.5" />
                  Ingredients
                </label>
                <input
                  type="text"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="e.g. rice, chicken, soy sauce, eggs, vegetables"
                  className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-200 text-sm placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-stone-400 mb-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  Serving Size
                </label>
                <input
                  type="text"
                  value={servingSize}
                  onChange={(e) => setServingSize(e.target.value)}
                  placeholder="e.g. 1 plate, 2 cups, large bowl"
                  className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-200 text-sm placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Analyze Button */}
        {previewUrl && !scanResult && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleAnalyze}
            disabled={isScanning}
            className="w-full flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 disabled:from-stone-700 disabled:to-stone-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all cursor-pointer disabled:cursor-not-allowed disabled:shadow-none text-lg"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze Meal
              </>
            )}
          </motion.button>
        )}

        {/* Scanning State */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 bg-stone-900 border border-stone-800 rounded-2xl text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-400 animate-pulse" />
              </div>
              <p className="text-stone-200 font-medium mb-1">
                AI is analyzing your meal...
              </p>
              <p className="text-stone-500 text-sm">
                Identifying ingredients and estimating nutrition
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Food Name & Confidence */}
              <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-primary-400 font-medium mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI DETECTED
                    </div>
                    <h3 className="text-xl font-bold text-stone-100">
                      {scanResult.foodName}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      scanResult.confidenceScore >= 0.8
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : scanResult.confidenceScore >= 0.6
                        ? "bg-primary-500/10 text-primary-400 border border-primary-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {Math.round(scanResult.confidenceScore * 100)}% confident
                  </span>
                </div>

                {/* Calories Hero */}
                <div className="flex items-center gap-2 p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl mb-4">
                  <Flame className="w-5 h-5 text-primary-400" />
                  <span className="text-2xl font-bold text-primary-400">
                    {scanResult.estimatedCalories}
                  </span>
                  <span className="text-sm text-primary-400/70">kcal</span>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-stone-800/50 rounded-xl text-center">
                    <Beef className="w-4 h-4 text-primary-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-stone-100">
                      {scanResult.protein}g
                    </div>
                    <div className="text-xs text-stone-500">Protein</div>
                  </div>
                  <div className="p-3 bg-stone-800/50 rounded-xl text-center">
                    <Wheat className="w-4 h-4 text-primary-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-stone-100">
                      {scanResult.carbs}g
                    </div>
                    <div className="text-xs text-stone-500">Carbs</div>
                  </div>
                  <div className="p-3 bg-stone-800/50 rounded-xl text-center">
                    <Droplets className="w-4 h-4 text-primary-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-stone-100">
                      {scanResult.fat}g
                    </div>
                    <div className="text-xs text-stone-500">Fat</div>
                  </div>
                </div>
              </div>

              {/* Detected Ingredients */}
              {scanResult.detectedIngredients &&
                scanResult.detectedIngredients.length > 0 && (
                  <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl">
                    <div className="flex items-center gap-2 text-sm font-medium text-stone-300 mb-3">
                      <Leaf className="w-4 h-4 text-primary-400" />
                      Detected Ingredients
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scanResult.detectedIngredients.map(
                        (ingredient, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-sm text-stone-300"
                          >
                            {ingredient}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 border border-stone-700 hover:border-stone-600 text-stone-400 hover:text-stone-200 font-medium rounded-xl transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Scan Again
                </button>
                <button
                  onClick={handleLogMeal}
                  disabled={isLogging}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLogging ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Log This Meal
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
