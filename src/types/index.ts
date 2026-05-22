// ============================================
// RunStride AI - Complete Type Definitions
// ============================================

export type SportType = 'run' | 'ride' | 'swim' | 'hike' | 'treadmill' | 'trail_run';

export type WorkoutType = 'easy' | 'tempo' | 'interval' | 'long_run' | 'recovery' | 'rest' | 'hills' | 'progression';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

export type Page = 'home' | 'map' | 'record' | 'stats' | 'profile' | 'training' | 'recovery' | 'gear' | 'clubs';

export type IntensityLevel = 'easy' | 'moderate' | 'hard';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  restingHR: number;
  maxHR: number;
  vdot: number;
  fitnessLevel: FitnessLevel;
  weeklyMileage: number;
  preferredDistanceUnit: 'km' | 'mi';
  stravaConnected: boolean;
  // Advanced
  sweatRate: 'low' | 'moderate' | 'heavy' | 'salty';
  dietaryConstraint?: 'vegan' | 'vegetarian' | 'gluten_free' | 'keto' | 'none';
  fastingProtocol?: 'none' | '16_8' | 'OMAD' | '5_2';
  // Female physiology
  cycleTrackingEnabled?: boolean;
  cyclePhase?: 'follicular' | 'ovulation' | 'luteal' | 'menstruation';
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  sport: SportType;
  date: string; // ISO date
  distance: number; // km
  duration: number; // seconds
  pace: number; // min/km
  avgHR: number;
  maxHR: number;
  elevationGain: number; // meters
  calories: number;
  perceivedExertion: number; // 1-10 RPE
  mapImage?: string;
  activityImage?: string;
  kudos: number;
  comments: number;
  aiInsight?: string;
  splits?: ActivitySplit[];
  // HR zone time distribution
  hrZoneTime?: Record<string, number>; // seconds in each zone
  // GPS route (simplified)
  route?: [number, number][]; // lat, lng pairs
}

export interface ActivitySplit {
  km: number;
  pace: number; // min/km
  elevation: number; // meters
  hr: number;
}

export interface PaceZone {
  name: string;
  min: number; // min/km
  max: number; // min/km
  color: string;
}

export interface HRZone {
  name: string;
  zone: number;
  minPct: number;
  maxPct: number;
  minHR: number;
  maxHR: number;
  color: string;
}

export interface WeeklyMileage {
  weekStart: string;
  distance: number;
  activities: number;
  duration: number;
}

export interface ACWRData {
  date: string;
  acuteLoad: number;
  chronicLoad: number;
  ratio: number;
}

export interface PersonalRecord {
  distance: string; // "5K", "10K", "Half Marathon", "Marathon"
  time: string; // formatted time "18:32"
  date: string;
  vdot: number;
}

export interface TrainingPlanDay {
  day: string; // "Mon", "Tue", etc.
  date: string;
  workoutType: WorkoutType;
  title: string;
  distance?: number; // km
  duration?: number; // minutes
  targetPace?: string;
  targetHR?: string;
  description: string;
  completed: boolean;
}

export interface AIWorkoutSuggestion {
  id: string;
  title: string;
  workoutType: WorkoutType;
  duration: number; // minutes
  distance?: number; // km
  targetPace: string;
  targetRPE: number;
  reasoning: string;
}

export interface RecoveryStatus {
  readiness: number; // 0-100
  status: 'full' | 'partial' | 'rest';
  sleepHours: number;
  sleepQuality: number; // 1-10
  hrv: number; // ms
  hrvBaseline: number;
  recommendation: string;
  nextHardDay: string;
}

export interface NutritionResult {
  carbsPerHour: number; // grams
  fluidPerHour: number; // ml
  sodiumPerHour: number; // mg
  totalCarbs: number;
  totalFluid: number;
  totalSodium: number;
  preWorkoutCarbs: number;
  postWorkoutProtein: number;
  postWorkoutCarbs: number;
}

export interface GearItem {
  id: string;
  name: string;
  type: 'shoe' | 'bike' | 'watch' | 'other';
  brand: string;
  image: string;
  mileage: number; // km
  maxMileage: number; // recommended lifespan km
  surfaceType: 'road' | 'trail' | 'track' | 'mixed';
  dateAdded: string;
  isActive: boolean;
}

export interface Club {
  id: string;
  name: string;
  coverImage: string;
  memberCount: number;
  location: string;
  activityTypes: SportType[];
  joined: boolean;
}

export interface AppState {
  currentPage: Page;
  user: UserProfile | null;
  activities: Activity[];
  trainingPlan: TrainingPlanDay[];
  aiSuggestions: AIWorkoutSuggestion[];
  recovery: RecoveryStatus | null;
  gear: GearItem[];
  clubs: Club[];
  personalRecords: PersonalRecord[];
  weeklyMileages: WeeklyMileage[];
  acwrData: ACWRData[];
  isLoggedIn: boolean;
  sidebarOpen: boolean;
}

export type AppAction =
  | { type: 'SET_PAGE'; payload: Page }
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'SET_TRAINING_PLAN'; payload: TrainingPlanDay[] }
  | { type: 'TOGGLE_WORKOUT_COMPLETE'; payload: string }
  | { type: 'SET_AI_SUGGESTIONS'; payload: AIWorkoutSuggestion[] }
  | { type: 'SET_RECOVERY'; payload: RecoveryStatus }
  | { type: 'SET_GEAR'; payload: GearItem[] }
  | { type: 'SET_CLUBS'; payload: Club[] }
  | { type: 'TOGGLE_CLUB_JOIN'; payload: string }
  | { type: 'SET_PERSONAL_RECORDS'; payload: PersonalRecord[] }
  | { type: 'SET_WEEKLY_MILEAGES'; payload: WeeklyMileage[] }
  | { type: 'SET_ACWR_DATA'; payload: ACWRData[] }
  | { type: 'LOGIN'; payload: UserProfile }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'GIVE_KUDOS'; payload: string };

export interface NutritionInputs {
  duration: number; // minutes
  intensity: IntensityLevel;
  bodyWeight: number; // kg
  temperature: number; // celsius
  humidity: number; // percent
}
