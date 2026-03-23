const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api/v1";

// ── Types ────────────────────────────────────────────────────────────────────

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  height?: number;
  weight?: number;
  targetWeight?: number;
  fitnessGoal?: string;
  dietPreference?: string;
  activityLevel?: string;
  medicalConditions?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface UpdateProfileData {
  age?: number;
  height?: number;
  weight?: number;
  targetWeight?: number;
  fitnessGoal?: string;
  dietPreference?: string;
  activityLevel?: string;
  medicalConditions?: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  let res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (
    res.status === 401 &&
    !url.includes("/auth/login") &&
    !url.includes("/auth/refresh") &&
    !url.includes("/auth/register")
  ) {
    if (typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("nf_refresh_token");
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          if (refreshRes.ok) {
            const refreshJson = await refreshRes.json();
            const tokens =
              refreshJson.data !== undefined ? refreshJson.data : refreshJson;

            if (tokens.accessToken && tokens.refreshToken) {
              localStorage.setItem("nf_access_token", tokens.accessToken);
              localStorage.setItem("nf_refresh_token", tokens.refreshToken);
              window.dispatchEvent(
                new CustomEvent("token_refreshed", {
                  detail: tokens.accessToken,
                })
              );

              // Retry original request
              const newHeaders = new Headers(options.headers || {});
              newHeaders.set("Authorization", `Bearer ${tokens.accessToken}`);
              newHeaders.set("Content-Type", "application/json");

              res = await fetch(url, {
                ...options,
                headers: newHeaders,
              });
            }
          } else {
            // Refresh failed
            localStorage.removeItem("nf_access_token");
            localStorage.removeItem("nf_refresh_token");
            localStorage.removeItem("nf_user");
            window.location.href = "/signin";
            throw new Error("Session expired. Please log in again.");
          }
        } catch (e) {
          // Prevent failing silent on hard crash, keep flow
        }
      } else {
        localStorage.removeItem("nf_access_token");
        localStorage.removeItem("nf_user");
        window.location.href = "/signin";
      }
    }
  }

  const json = await res.json();

  if (!res.ok) {
    const message =
      json?.message || json?.error || `Request failed (${res.status})`;
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  // The BE wraps responses in { data, statusCode, ... }
  return json.data !== undefined ? json.data : json;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function register(data: RegisterData): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(data: LoginData): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getProfile(token: string): Promise<User> {
  return request<User>("/auth/profile", {
    headers: authHeaders(token),
  });
}

export async function logout(token: string): Promise<void> {
  return request<void>("/auth/logout", {
    method: "POST",
    headers: authHeaders(token),
  });
}

// ── User Profile ─────────────────────────────────────────────────────────────

export async function updateProfile(
  userId: string,
  token: string,
  data: UpdateProfileData
): Promise<User> {
  return request<User>(`/users/${userId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

// ── Workout Types ────────────────────────────────────────────────────────────

export interface GenerateWorkoutData {
  fitnessGoal: string;
  activityLevel: string;
  difficulty: string;
  durationWeeks?: number;
  notes?: string;
}

export interface LogWorkoutData {
  exercise: string;
  reps?: number;
  sets?: number;
  duration?: number;
  formScore?: number;
  date?: string;
  notes?: string;
  workoutPlanId?: string;
  planWeek?: number;
  planDay?: string;
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  restPeriod: string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: WorkoutExercise[] | string[];
}

export interface WorkoutWeek {
  week: number;
  days: WorkoutDay[];
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  goal: string;
  difficulty: string;
  durationWeeks: number;
  workouts: WorkoutWeek[];
  createdAt: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutPlanId?: string;
  planWeek?: number;
  planDay?: string;
  exercise: string;
  reps?: number;
  sets?: number;
  duration?: number;
  formScore?: number;
  notes?: string;
  date: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ── Workouts ─────────────────────────────────────────────────────────────────

export async function generateWorkout(
  token: string,
  data: GenerateWorkoutData
): Promise<WorkoutPlan> {
  return request<WorkoutPlan>("/workouts/generate", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function logWorkoutSession(
  token: string,
  data: LogWorkoutData
): Promise<WorkoutSession> {
  return request<WorkoutSession>("/workouts/log", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function getWorkoutHistory(
  token: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<WorkoutSession>> {
  return request<PaginatedResponse<WorkoutSession>>(
    `/workouts/history?page=${page}&limit=${limit}`,
    { headers: authHeaders(token) }
  );
}

export async function getWorkoutPlans(
  token: string,
  userId: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<WorkoutPlan>> {
  return request<PaginatedResponse<WorkoutPlan>>(
    `/workouts/${userId}?page=${page}&limit=${limit}`,
    { headers: authHeaders(token) }
  );
}

export async function updateWorkoutSession(
  token: string,
  id: string,
  data: Partial<LogWorkoutData>
): Promise<WorkoutSession> {
  return request<WorkoutSession>(`/workouts/log/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteWorkoutSession(token: string, id: string): Promise<void> {
  return request<void>(`/workouts/log/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function deleteWorkoutPlan(token: string, id: string): Promise<void> {
  return request<void>(`/workouts/plan/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

// ── Meal Types ───────────────────────────────────────────────────────────────

export interface GenerateMealPlanData {
  fitnessGoal: string;
  dietPreference?: string;
  targetCalories?: number;
  allergies?: string;
}

export interface LogMealData {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
  date?: string;
}

export interface MealItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

export interface MealPlan {
  id: string;
  userId: string;
  calories: number;
  macros: { protein: number; carbs: number; fat: number };
  meals: MealItem[];
  createdAt: string;
}

export interface MealLog {
  id: string;
  userId: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
  date: string;
}

export interface FoodScanResult {
  foodName: string;
  estimatedCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidenceScore: number;
  detectedIngredients: string[];
}

// ── Meals ────────────────────────────────────────────────────────────────────

export async function generateMealPlan(
  token: string,
  data: GenerateMealPlanData
): Promise<MealPlan> {
  return request<MealPlan>("/meals/generate", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function logMeal(
  token: string,
  data: LogMealData
): Promise<MealLog> {
  return request<MealLog>("/meals/log", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function getMealHistory(
  token: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<MealLog>> {
  return request<PaginatedResponse<MealLog>>(
    `/meals/history?page=${page}&limit=${limit}`,
    { headers: authHeaders(token) }
  );
}

export async function getMealPlans(
  token: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<MealPlan>> {
  return request<PaginatedResponse<MealPlan>>(
    `/meals/plans?page=${page}&limit=${limit}`,
    { headers: authHeaders(token) }
  );
}

export async function scanMeal(
  token: string,
  imageFile: File,
  hints?: { mealName?: string; ingredients?: string; servingSize?: string }
): Promise<FoodScanResult> {
  const formData = new FormData();
  formData.append("image", imageFile);
  if (hints?.mealName) formData.append("mealName", hints.mealName);
  if (hints?.ingredients) formData.append("ingredients", hints.ingredients);
  if (hints?.servingSize) formData.append("servingSize", hints.servingSize);

  const url = `${API_URL}/meals/scan`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const json = await res.json();

  if (!res.ok) {
    const message =
      json?.message || json?.error || `Request failed (${res.status})`;
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return json.data !== undefined ? json.data : json;
}

export async function updateMealLog(
  token: string,
  id: string,
  data: Partial<LogMealData>
): Promise<MealLog> {
  return request<MealLog>(`/meals/log/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteMealLog(token: string, id: string): Promise<void> {
  return request<void>(`/meals/log/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function deleteMealPlan(token: string, id: string): Promise<void> {
  return request<void>(`/meals/plan/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

// ── Progress Tracking ────────────────────────────────────────────────────────

export interface LogProgressData {
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  sleepHours?: number;
  waterIntake?: number;
  steps?: number;
  notes?: string;
  date?: string;
}

export interface ProgressLog {
  id: string;
  userId: string;
  weight: number | null;
  bodyFat: number | null;
  muscleMass: number | null;
  sleepHours: number | null;
  waterIntake: number | null;
  steps: number | null;
  notes: string | null;
  date: string;
}

export interface ProgressAnalytics {
  userId: string;
  targetWeight: number | null;
  startingWeight: number | null;
  currentWeight: number | null;
  streak?: number;
  activePlanProgress?: {
    planId: string;
    goal: string;
    completedDays: number;
    totalDays: number;
    percentage: number;
  } | null;
  weightTrend: { date: string; weight: number }[];
  weightChange: { value: number; unit: string } | null;
  healthMetrics: {
    avgSleep: number;
    avgWater: number;
    avgSteps: number;
  };
  workoutFrequency: {
    sessionsPerWeek: number;
    last30Days: number;
  };
  formScore: {
    average: number | null;
    totalAnalyzed: number;
  };
  nutrition: {
    avgDailyCalories: number;
    totalMealsLogged: number;
    recentMealsLogged: number;
  };
  activityCalendar: {
    date: string;
    hasWorkout: boolean;
    hasMeal: boolean;
    hasProgress: boolean;
  }[];
}

export async function logProgress(
  token: string,
  data: LogProgressData
): Promise<ProgressLog> {
  return request<ProgressLog>("/progress/log", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function getProgressHistory(
  token: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<ProgressLog>> {
  return request<PaginatedResponse<ProgressLog>>(
    `/progress/history?page=${page}&limit=${limit}`,
    { headers: authHeaders(token) }
  );
}

export async function getProgressAnalytics(
  token: string,
  timeframe?: string
): Promise<ProgressAnalytics> {
  const url = timeframe
    ? `${API_URL}/progress/analytics?timeframe=${timeframe}`
    : `${API_URL}/progress/analytics`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch analytics");
  const json = await res.json();
  return json.data;
}

export async function updateProgress(
  token: string,
  id: string,
  data: Partial<LogProgressData>
): Promise<ProgressLog> {
  return request<ProgressLog>(`/progress/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteProgress(token: string, id: string): Promise<void> {
  return request<void>(`/progress/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

// ── AI ───────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'ai';
  content: string;
  createdAt: string;
}

export const aiApi = {
  chat: async (token: string, message: string) => {
    return request<any>("/ai/chat", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ message }),
    });
  },

  getChatHistory: async (token: string) => {
    return request<{ data: ChatMessage[]; message: string }>("/ai/chat/history", {
      headers: authHeaders(token),
    });
  },
};

