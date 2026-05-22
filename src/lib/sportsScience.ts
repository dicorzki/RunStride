// ============================================
// RunStride AI - Sports Science Engine
// VDOT, HR Zones, ACWR, Pace Zones, Nutrition
// ============================================

import type { HRZone, PaceZone, NutritionInputs, NutritionResult } from '@/types';

// ============================================
// VDOT Calculation (Jack Daniels' Running Formula)
// ============================================

/**
 * Calculate VDOT from a race performance
 * Uses the standard Daniels & Gilbert formula
 * @param distanceMeters - Race distance in meters
 * @param timeSeconds - Race time in seconds
 * @returns VDOT score (typically 20-85)
 */
export function calculateVDOT(distanceMeters: number, timeSeconds: number): number {
  const velocity = distanceMeters / timeSeconds; // m/s
  const percentMax = 0.8 + 0.1894393 * Math.exp(-0.012778 * timeSeconds / 60)
    + 0.2989558 * Math.exp(-0.1932605 * timeSeconds / 60);
  const vo2 = -4.6 + velocity * 60 / (percentMax * 4.2);
  return Math.round(vo2 * 10) / 10;
}

/**
 * Get VDOT from common race distances
 */
export function getVDOTFrom5K(timeSeconds: number): number {
  return calculateVDOT(5000, timeSeconds);
}

export function getVDOTFrom10K(timeSeconds: number): number {
  return calculateVDOT(10000, timeSeconds);
}

export function getVDOTFromHalfMarathon(timeSeconds: number): number {
  return calculateVDOT(21097.5, timeSeconds);
}

export function getVDOTFromMarathon(timeSeconds: number): number {
  return calculateVDOT(42195, timeSeconds);
}

/**
 * Predict race time from VDOT for a given distance
 */
export function predictRaceTime(vdot: number, distanceMeters: number): number {
  // Binary search to find the time that produces the given VDOT
  let low = 60; // 1 minute
  let high = 14400; // 4 hours
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const calculatedVDOT = calculateVDOT(distanceMeters, mid);
    if (calculatedVDOT < vdot) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return Math.round((low + high) / 2);
}

/**
 * Predict 5K time from VDOT
 */
export function predict5KTime(vdot: number): number {
  return predictRaceTime(vdot, 5000);
}

/**
 * Predict marathon time from VDOT
 */
export function predictMarathonTime(vdot: number): number {
  return predictRaceTime(vdot, 42195);
}

// ============================================
// Pace Zones (from VDOT)
// ============================================

/**
 * Get training pace zones based on VDOT score
 * Returns zones in min/km
 */
export function getPaceZones(vdot: number): PaceZone[] {
  // E pace (Easy) = ~59-74% VO2max velocity
  // M pace (Marathon) = ~75-84% VO2max velocity
  // T pace (Threshold) = ~83-88% VO2max velocity
  // I pace (Interval) = ~97-100% VO2max velocity
  // R pace (Repetition) = ~105-108% VO2max velocity

  const easyVelocity = getVelocityForPercentVDOT(vdot, 0.65);
  const marathonVelocity = getVelocityForPercentVDOT(vdot, 0.80);
  const thresholdVelocity = getVelocityForPercentVDOT(vdot, 0.86);
  const intervalVelocity = getVelocityForPercentVDOT(vdot, 0.98);
  const repVelocity = getVelocityForPercentVDOT(vdot, 1.06);

  const toMinPerKm = (v: number) => 1000 / v / 60;

  return [
    { name: 'Easy (E)', min: Math.round(toMinPerKm(easyVelocity * 1.15) * 100) / 100, max: Math.round(toMinPerKm(easyVelocity) * 100) / 100, color: '#6B7280' },
    { name: 'Marathon (M)', min: Math.round(toMinPerKm(marathonVelocity * 1.05) * 100) / 100, max: Math.round(toMinPerKm(marathonVelocity) * 100) / 100, color: '#10B981' },
    { name: 'Threshold (T)', min: Math.round(toMinPerKm(thresholdVelocity * 1.03) * 100) / 100, max: Math.round(toMinPerKm(thresholdVelocity) * 100) / 100, color: '#F59E0B' },
    { name: 'Interval (I)', min: Math.round(toMinPerKm(intervalVelocity * 1.02) * 100) / 100, max: Math.round(toMinPerKm(intervalVelocity) * 100) / 100, color: '#FC4C02' },
    { name: 'Repetition (R)', min: Math.round(toMinPerKm(repVelocity * 1.02) * 100) / 100, max: Math.round(toMinPerKm(repVelocity) * 100) / 100, color: '#EF4444' },
  ];
}

/**
 * Get velocity for a given percentage of VDOT
 */
function getVelocityForPercentVDOT(vdot: number, percent: number): number {
  // Inverse of the VDOT calculation
  const targetVO2 = vdot * percent;
  // Approximate velocity from VO2
  return (targetVO2 + 4.6) / 60 * 4.2;
}

/**
 * Get the pace zone for a given pace (min/km)
 */
export function getPaceZoneForPace(vdot: number, paceMinPerKm: number): string {
  const zones = getPaceZones(vdot);
  for (const zone of zones) {
    if (paceMinPerKm <= zone.max && paceMinPerKm >= zone.min * 0.95) {
      return zone.name;
    }
  }
  if (paceMinPerKm > zones[0].max) return zones[0].name;
  return zones[zones.length - 1].name;
}

// ============================================
// Heart Rate Zones
// ============================================

/**
 * Calculate HR zones based on ACTUAL max HR and resting HR (Karvonen method)
 * @param maxHR - User's actual measured max HR
 * @param restingHR - User's resting HR
 * @returns Array of HR zones
 */
export function calculateHRZones(maxHR: number, restingHR: number): HRZone[] {
  const hrr = maxHR - restingHR; // Heart Rate Reserve

  return [
    { name: 'Recovery', zone: 1, minPct: 50, maxPct: 60, minHR: Math.round(restingHR + hrr * 0.50), maxHR: Math.round(restingHR + hrr * 0.60), color: '#9CA3AF' },
    { name: 'Aerobic (Easy)', zone: 2, minPct: 60, maxPct: 70, minHR: Math.round(restingHR + hrr * 0.60), maxHR: Math.round(restingHR + hrr * 0.70), color: '#10B981' },
    { name: 'Tempo', zone: 3, minPct: 70, maxPct: 80, minHR: Math.round(restingHR + hrr * 0.70), maxHR: Math.round(restingHR + hrr * 0.80), color: '#F59E0B' },
    { name: 'Threshold', zone: 4, minPct: 80, maxPct: 90, minHR: Math.round(restingHR + hrr * 0.80), maxHR: Math.round(restingHR + hrr * 0.90), color: '#FC4C02' },
    { name: 'VO2 Max', zone: 5, minPct: 90, maxPct: 100, minHR: Math.round(restingHR + hrr * 0.90), maxHR: maxHR, color: '#EF4444' },
  ];
}

/**
 * Get the HR zone number for a given heart rate
 */
export function getHRZoneNumber(hr: number, zones: HRZone[]): number {
  for (const zone of zones) {
    if (hr >= zone.minHR && hr <= zone.maxHR) {
      return zone.zone;
    }
  }
  if (hr < zones[0].minHR) return 1;
  return 5;
}

// ============================================
// Acute:Chronic Workload Ratio (ACWR)
// ============================================

/**
 * Calculate ACWR from weekly training loads
 * acute = last 7 days, chronic = average of previous 21-28 days
 * @param weeklyLoads - Array of weekly load values (most recent first)
 * @returns ACWR ratio
 */
export function calculateACWR(weeklyLoads: number[]): number {
  if (weeklyLoads.length < 2) return 1.0;
  const acute = weeklyLoads[0]; // Most recent week
  const chronicWeeks = weeklyLoads.slice(1, 5); // Previous up to 4 weeks
  const chronic = chronicWeeks.reduce((a, b) => a + b, 0) / chronicWeeks.length;
  if (chronic === 0) return 1.0;
  return Math.round((acute / chronic) * 100) / 100;
}

/**
 * Get ACWR injury risk category
 */
export function getACWRRiskCategory(ratio: number): 'low' | 'optimal' | 'caution' | 'high' {
  if (ratio < 0.8) return 'low';
  if (ratio <= 1.3) return 'optimal';
  if (ratio <= 1.5) return 'caution';
  return 'high';
}

/**
 * Get color for ACWR ratio
 */
export function getACWRColor(ratio: number): string {
  const category = getACWRRiskCategory(ratio);
  switch (category) {
    case 'low': return '#3B82F6';
    case 'optimal': return '#10B981';
    case 'caution': return '#F59E0B';
    case 'high': return '#EF4444';
  }
}

/**
 * Calculate training load from an activity
 * Uses TRIMP-like calculation: duration * average HR reserve
 */
export function calculateTrainingLoad(durationMinutes: number, avgHR: number, maxHR: number, restingHR: number): number {
  const hrReserve = (avgHR - restingHR) / (maxHR - restingHR);
  return Math.round(durationMinutes * hrReserve * 1.5);
}

// ============================================
// 80/20 Intensity Distribution
// ============================================

/**
 * Calculate time spent in low vs high intensity
 * Returns percentages that should ideally be ~80/20
 */
export function calculate8020Distribution(zoneTimes: Record<number, number>): {
  lowIntensity: number;
  highIntensity: number;
} {
  let low = 0;
  let high = 0;
  for (const [zone, seconds] of Object.entries(zoneTimes)) {
    const z = parseInt(zone);
    if (z <= 2) {
      low += seconds;
    } else {
      high += seconds;
    }
  }
  const total = low + high;
  if (total === 0) return { lowIntensity: 80, highIntensity: 20 };
  return {
    lowIntensity: Math.round((low / total) * 100),
    highIntensity: Math.round((high / total) * 100),
  };
}

// ============================================
// Fitness Level Auto-Detection
// ============================================

/**
 * Auto-detect fitness level based on weekly mileage and consistency
 */
export function detectFitnessLevel(
  weeklyMileage: number,
  weeksOfData: number,
  vdot: number
): 'beginner' | 'intermediate' | 'advanced' | 'elite' {
  if (weeksOfData < 4) {
    // Not enough data, use VDOT only
    if (vdot < 35) return 'beginner';
    if (vdot < 50) return 'intermediate';
    if (vdot < 65) return 'advanced';
    return 'elite';
  }

  // Combined algorithm
  let score = 0;
  // Mileage score
  if (weeklyMileage < 20) score += 1;
  else if (weeklyMileage < 50) score += 2;
  else if (weeklyMileage < 80) score += 3;
  else score += 4;

  // VDOT score
  if (vdot < 35) score += 1;
  else if (vdot < 50) score += 2;
  else if (vdot < 65) score += 3;
  else score += 4;

  const avg = score / 2;
  if (avg < 1.5) return 'beginner';
  if (avg < 2.5) return 'intermediate';
  if (avg < 3.5) return 'advanced';
  return 'elite';
}

// ============================================
// Nutrition & Hydration Calculator
// ============================================

/**
 * Calculate sweat rate based on temperature and humidity
 */
function getSweatRateFactor(temperature: number, humidity: number): number {
  let factor = 1.0;
  if (temperature > 25) factor += 0.3;
  else if (temperature > 20) factor += 0.15;
  else if (temperature < 10) factor -= 0.1;

  if (humidity > 70) factor += 0.2;
  else if (humidity > 50) factor += 0.1;

  return factor;
}

/**
 * Calculate nutrition needs for a workout
 */
export function calculateNutrition(inputs: NutritionInputs): NutritionResult {
  const { duration, intensity: intensityLevel, bodyWeight, temperature, humidity } = inputs;
  const hours = duration / 60;
  const intensity = intensityLevel;

  // Base sweat rate: 0.5-2.0 L/hour depending on intensity
  let baseSweatRate = 0.8; // L/hour
  if (intensity === 'moderate') baseSweatRate = 1.2;
  if (intensity === 'hard') baseSweatRate = 1.8;

  // Adjust for body weight (heavier = more sweat)
  const weightFactor = bodyWeight / 70;

  // Adjust for environment
  const envFactor = getSweatRateFactor(temperature, humidity);

  const sweatRate = baseSweatRate * weightFactor * envFactor;
  const fluidPerHour = Math.round(sweatRate * 1000 * 0.8); // Replace 80% of losses
  const totalFluid = Math.round(fluidPerHour * hours);

  // Carb needs: 30-90g/hour depending on intensity
  let carbsPerHour = 30;
  if (intensity === 'moderate') carbsPerHour = 60;
  if (intensity === 'hard') carbsPerHour = 90;

  // Adjust for duration (shorter = less needed)
  if (duration < 45) carbsPerHour = Math.round(carbsPerHour * 0.5);
  else if (duration < 75) carbsPerHour = Math.round(carbsPerHour * 0.7);

  const totalCarbs = Math.round(carbsPerHour * hours);

  // Sodium: 200-700mg/L of sweat
  const sodiumPerHour = Math.round(sweatRate * 500); // mg
  const totalSodium = Math.round(sodiumPerHour * hours);

  // Pre-workout: 1-4g carbs/kg 1-4 hours before
  const preWorkoutCarbs = Math.round(bodyWeight * 2); // moderate recommendation

  // Post-workout
  const postWorkoutProtein = Math.round(bodyWeight * 0.3); // ~0.3g/kg
  const postWorkoutCarbs = Math.round(bodyWeight * 1.0); // ~1g/kg

  return {
    carbsPerHour,
    fluidPerHour,
    sodiumPerHour,
    totalCarbs,
    totalFluid,
    totalSodium,
    preWorkoutCarbs,
    postWorkoutProtein,
    postWorkoutCarbs,
  };
}

// ============================================
// Readiness Score Calculator
// ============================================

/**
 * Calculate daily readiness score
 * Combines: ACWR, sleep quality, HRV trend
 */
export function calculateReadiness(
  acwr: number,
  sleepHours: number,
  sleepQuality: number, // 1-10
  hrv: number,
  hrvBaseline: number
): number {
  // ACWR component (0-40 points)
  let acwrScore = 30;
  if (acwr >= 0.8 && acwr <= 1.2) acwrScore = 40;
  else if (acwr <= 1.3) acwrScore = 35;
  else if (acwr <= 0.6) acwrScore = 25;
  else if (acwr <= 1.5) acwrScore = 20;
  else acwrScore = 10;

  // Sleep component (0-30 points)
  let sleepScore = 0;
  if (sleepHours >= 8) sleepScore = 20 + (sleepQuality / 10) * 10;
  else if (sleepHours >= 7) sleepScore = 15 + (sleepQuality / 10) * 8;
  else if (sleepHours >= 6) sleepScore = 10 + (sleepQuality / 10) * 6;
  else sleepScore = 5 + (sleepQuality / 10) * 4;

  // HRV component (0-30 points)
  let hrvScore = 20;
  const hrvRatio = hrv / hrvBaseline;
  if (hrvRatio >= 1.1) hrvScore = 30; // Well recovered
  else if (hrvRatio >= 0.95) hrvScore = 25; // Good
  else if (hrvRatio >= 0.85) hrvScore = 18; // Slight fatigue
  else if (hrvRatio >= 0.75) hrvScore = 12; // Fatigued
  else hrvScore = 8; // Very fatigued

  const total = Math.round(acwrScore + sleepScore + hrvScore);
  return Math.min(100, Math.max(0, total));
}

/**
 * Get readiness recommendation
 */
export function getReadinessRecommendation(readiness: number): string {
  if (readiness >= 80) return 'Ready to train hard. Go for that PR!';
  if (readiness >= 65) return 'Good to go. Moderate intensity recommended.';
  if (readiness >= 50) return 'Proceed with caution. Keep it easy today.';
  if (readiness >= 35) return 'Take a recovery run or rest day.';
  return 'Rest day. Your body needs recovery.';
}

// ============================================
// Utility Formatters
// ============================================

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format pace (min/km) to MM:SS
 */
export function formatPace(paceMinPerKm: number): string {
  const m = Math.floor(paceMinPerKm);
  const s = Math.round((paceMinPerKm - m) * 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format distance with unit
 */
export function formatDistance(km: number, unit: 'km' | 'mi' = 'km'): string {
  if (unit === 'mi') {
    return `${(km * 0.621371).toFixed(1)} mi`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Get time ago string
 */
export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

/**
 * Get workout type icon/label
 */
export function getWorkoutLabel(type: string): string {
  const labels: Record<string, string> = {
    easy: 'Easy Run',
    tempo: 'Tempo Run',
    interval: 'Intervals',
    long_run: 'Long Run',
    recovery: 'Recovery',
    rest: 'Rest Day',
    hills: 'Hill Repeats',
    progression: 'Progression',
  };
  return labels[type] || type;
}

/**
 * Get workout type color
 */
export function getWorkoutColor(type: string): string {
  const colors: Record<string, string> = {
    easy: '#10B981',
    tempo: '#F59E0B',
    interval: '#FC4C02',
    long_run: '#3B82F6',
    recovery: '#8B5CF6',
    rest: '#9CA3AF',
    hills: '#EF4444',
    progression: '#EC4899',
  };
  return colors[type] || '#6B7280';
}
