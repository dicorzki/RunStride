// ============================================
// Recovery & Nutrition Calculator Page
// ============================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Moon, Wind, Droplets, Flame, Timer,
  Brain, Sparkles
} from 'lucide-react';
import { useApp } from '@/App';
import { calculateNutrition } from '@/lib/sportsScience';
import type { IntensityLevel } from '@/types';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function RecoveryPage() {
  const { state } = useApp();
  const recovery = state.recovery;
  const user = state.user;

  // Nutrition calculator state
  const [duration, setDuration] = useState(60);
  const [intensity, setIntensity] = useState<IntensityLevel>('moderate');
  const [temperature, setTemperature] = useState(20);
  const [humidity, setHumidity] = useState(50);

  const nutrition = useMemo(() => {
    if (!user) return null;
    return calculateNutrition({
      duration,
      intensity,
      bodyWeight: user.weightKg,
      temperature,
      humidity,
    });
  }, [duration, intensity, temperature, humidity, user]);

  if (!recovery || !user) return null;

  const readinessColor = recovery.readiness >= 80 ? '#10B981' : recovery.readiness >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-8 md:pt-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-gray-900 mb-4"
      >
        Recovery & Nutrition
      </motion.h1>

      {/* Recovery Status Card */}
      <motion.div
        custom={0}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl p-5 border border-gray-100 card-shadow mb-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Brain className="w-4 h-4 text-purple-600" />
          </div>
          <h2 className="text-sm font-bold text-gray-900">Recovery Status</h2>
          <span
            className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full capitalize"
            style={{
              color: readinessColor,
              backgroundColor: `${readinessColor}15`,
            }}
          >
            {recovery.status} Recovery
          </span>
        </div>

        <div className="flex items-center justify-center py-4">
          {/* Readiness Ring */}
          <div className="relative">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <motion.path
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${recovery.readiness}, 100` }}
                transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' as const }}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={readinessColor}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 font-mono-stats">{recovery.readiness}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Score</span>
            </div>
          </div>
        </div>

        {/* Recovery Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
            <Moon className="w-4 h-4 text-indigo-400 mb-1" />
            <span className="text-sm font-bold font-mono-stats text-gray-900">{recovery.sleepHours}h</span>
            <span className="text-[10px] text-gray-400">Sleep</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
            <Heart className="w-4 h-4 text-pink-400 mb-1" />
            <span className="text-sm font-bold font-mono-stats text-gray-900">{recovery.hrv}</span>
            <span className="text-[10px] text-gray-400">HRV (ms)</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
            <Sparkles className="w-4 h-4 text-yellow-400 mb-1" />
            <span className="text-sm font-bold font-mono-stats text-gray-900">{recovery.sleepQuality}/10</span>
            <span className="text-[10px] text-gray-400">Quality</span>
          </div>
        </div>

        {/* Recommendation */}
        <div className="mt-4 p-3 bg-purple-50 rounded-xl">
          <p className="text-xs text-purple-700 leading-relaxed">{recovery.recommendation}</p>
        </div>
      </motion.div>

      {/* Nutrition Calculator */}
      <motion.div
        custom={1}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl p-5 border border-gray-100 card-shadow mb-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-sm font-bold text-gray-900">Nutrition Calculator</h2>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          {/* Duration Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-500 uppercase tracking-wider font-medium flex items-center gap-1">
                <Timer className="w-3 h-3" />Duration
              </label>
              <span className="text-sm font-bold font-mono-stats text-strava-orange">{duration} min</span>
            </div>
            <input
              type="range"
              min="15"
              max="300"
              step="5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full accent-strava-orange"
            />
          </div>

          {/* Intensity Selector */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2 block flex items-center gap-1">
              <Flame className="w-3 h-3" />Intensity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'moderate', 'hard'] as IntensityLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setIntensity(level)}
                  className={`py-2.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
                    intensity === level
                      ? 'border-strava-orange bg-orange-50 text-strava-orange'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Environment Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1 block flex items-center gap-1">
                <Wind className="w-3 h-3" />Temp (°C)
              </label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-strava-orange font-mono-stats"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1 block flex items-center gap-1">
                <Droplets className="w-3 h-3" />Humidity (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={humidity}
                onChange={(e) => setHumidity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-strava-orange font-mono-stats"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Nutrition Results */}
      {nutrition && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 card-shadow"
        >
          <h3 className="text-sm font-bold text-gray-900 mb-3">Recommendations</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-[11px] text-orange-600 uppercase tracking-wider font-medium">Carbs</p>
              <p className="text-xl font-bold text-strava-orange font-mono-stats">{nutrition.carbsPerHour}g</p>
              <p className="text-[10px] text-orange-400">/hour</p>
              <p className="text-[11px] text-gray-500 mt-1">Total: {nutrition.totalCarbs}g</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-[11px] text-blue-600 uppercase tracking-wider font-medium">Fluid</p>
              <p className="text-xl font-bold text-blue-600 font-mono-stats">{nutrition.fluidPerHour}ml</p>
              <p className="text-[10px] text-blue-400">/hour</p>
              <p className="text-[11px] text-gray-500 mt-1">Total: {nutrition.totalFluid}ml</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
              <p className="text-[11px] text-yellow-600 uppercase tracking-wider font-medium">Sodium</p>
              <p className="text-xl font-bold text-yellow-600 font-mono-stats">{nutrition.sodiumPerHour}mg</p>
              <p className="text-[10px] text-yellow-400">/hour</p>
              <p className="text-[11px] text-gray-500 mt-1">Total: {nutrition.totalSodium}mg</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl border border-green-100">
              <p className="text-[11px] text-green-600 uppercase tracking-wider font-medium">Pre-Workout</p>
              <p className="text-xl font-bold text-green-600 font-mono-stats">{nutrition.preWorkoutCarbs}g</p>
              <p className="text-[10px] text-green-400">carbs 1-2h before</p>
            </div>
          </div>

          {/* Post-Workout */}
          <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[11px] text-purple-600 uppercase tracking-wider font-medium">Post Protein</p>
                <p className="text-lg font-bold text-purple-700 font-mono-stats">{nutrition.postWorkoutProtein}g</p>
              </div>
              <div className="w-px h-8 bg-purple-200" />
              <div>
                <p className="text-[11px] text-purple-600 uppercase tracking-wider font-medium">Post Carbs</p>
                <p className="text-lg font-bold text-purple-700 font-mono-stats">{nutrition.postWorkoutCarbs}g</p>
              </div>
              <p className="text-[11px] text-purple-500 ml-auto">Within 30min</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
