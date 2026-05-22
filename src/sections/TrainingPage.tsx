// ============================================
// Training Plan Calendar Detail Page
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Check, Clock,
  MapPin, Heart, Flame, Dumbbell, Wind, Zap
} from 'lucide-react';
import { useApp } from '@/App';
import { getWorkoutLabel, getWorkoutColor } from '@/lib/sportsScience';
import AIGeneratePlan from '@/components/AIGeneratePlan';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

export default function TrainingPage() {
  const { state, dispatch } = useApp();
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const workoutIcons: Record<string, typeof Dumbbell> = {
    easy: Wind,
    tempo: Flame,
    interval: Zap,
    long_run: MapPin,
    recovery: Wind,
    rest: Clock,
    hills: Dumbbell,
    progression: Flame,
  };

  const handleToggleComplete = (date: string) => {
    dispatch({ type: 'TOGGLE_WORKOUT_COMPLETE', payload: date });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-8 md:pt-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-gray-900 mb-4"
      >
        Training Plan
      </motion.h1>

      {/* AI Training Plan Generator */}
      <div className="mb-4">
        <AIGeneratePlan />
      </div>

      {/* Week Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 bg-white rounded-xl p-3 border border-gray-100 card-shadow"
      >
        <button
          onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-900">Week {selectedWeek + 1}</p>
          <p className="text-[11px] text-gray-400">
            {state.trainingPlan.filter(d => d.completed).length} of {state.trainingPlan.length} completed
          </p>
        </div>
        <button
          onClick={() => setSelectedWeek(selectedWeek + 1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-5"
      >
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(state.trainingPlan.filter(d => d.completed).length / state.trainingPlan.length) * 100}%`
            }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="h-full rounded-full bg-strava-orange"
          />
        </div>
      </motion.div>

      {/* Training Days List */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        {state.trainingPlan.map((day, index) => {
          const Icon = workoutIcons[day.workoutType] || Dumbbell;
          const isSelected = selectedDay === day.date;
          const color = getWorkoutColor(day.workoutType);

          return (
            <motion.div
              key={day.date}
              custom={index}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <button
                onClick={() => setSelectedDay(isSelected ? null : day.date)}
                className={`w-full text-left rounded-xl border transition-all ${
                  isSelected ? 'border-strava-orange bg-orange-50' : 'border-gray-100 bg-white'
                } card-shadow hover:card-shadow-hover`}
              >
                <div className="flex items-center gap-3 p-3.5">
                  {/* Day Circle */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-400 w-8">{day.day}</span>
                      <span className="text-sm font-semibold text-gray-800 truncate">{day.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 ml-10">
                      {day.distance && (
                        <span className="text-[11px] text-gray-500 font-mono-stats">{day.distance}km</span>
                      )}
                      {day.duration && (
                        <span className="text-[11px] text-gray-500 font-mono-stats">{day.duration}min</span>
                      )}
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        {getWorkoutLabel(day.workoutType)}
                      </span>
                    </div>
                  </div>

                  {/* Complete Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleComplete(day.date);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      day.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 space-y-2 border-t border-gray-100/50">
                        <p className="text-xs text-gray-600 leading-relaxed">{day.description}</p>
                        {day.targetPace && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Zap className="w-3.5 h-3.5 text-strava-orange" />
                            <span>Target Pace: <span className="font-mono-stats font-semibold text-gray-700">{day.targetPace}/km</span></span>
                          </div>
                        )}
                        {day.targetHR && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Heart className="w-3.5 h-3.5 text-red-400" />
                            <span>Target HR: <span className="font-mono-stats font-semibold text-gray-700">{day.targetHR}</span></span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Weekly Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-5 bg-white rounded-2xl p-4 border border-gray-100 card-shadow"
      >
        <h3 className="text-sm font-bold text-gray-900 mb-3">Week Summary</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-2 bg-gray-50 rounded-xl">
            <p className="text-lg font-bold text-strava-orange font-mono-stats">
              {state.trainingPlan.reduce((acc, d) => acc + (d.distance || 0), 0).toFixed(0)}
            </p>
            <p className="text-[10px] text-gray-400">Planned km</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-xl">
            <p className="text-lg font-bold text-blue-500 font-mono-stats">
              {state.trainingPlan.reduce((acc, d) => acc + (d.duration || 0), 0)}
            </p>
            <p className="text-[10px] text-gray-400">Planned min</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-xl">
            <p className="text-lg font-bold text-green-500 font-mono-stats">
              {state.trainingPlan.filter(d => d.completed).length}
            </p>
            <p className="text-[10px] text-gray-400">Completed</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-xl">
            <p className="text-lg font-bold text-purple-500 font-mono-stats">
              {state.trainingPlan.filter(d => d.workoutType === 'rest').length}
            </p>
            <p className="text-[10px] text-gray-400">Rest Days</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
