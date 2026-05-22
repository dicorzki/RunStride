// ============================================
// AI Training Plan Generator Component
// ============================================
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Target, Calendar, Gauge, Clock, Loader2 } from "lucide-react";
import { useAI } from "@/hooks/useAI";
import type { FitnessLevel } from "@/types";

export default function AIGeneratePlan() {
  const ai = useAI();
  const [showForm, setShowForm] = useState(false);
  const [params, setParams] = useState({
    goal: "half_marathon",
    goalTime: "",
    weeks: 12,
    runningDays: 5,
    fitnessLevel: "intermediate" as FitnessLevel,
    vdot: "",
    currentWeeklyMileage: 30,
    preferences: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ai.generateTrainingPlan({
      goal: params.goal,
      goalTime: params.goalTime || undefined,
      weeks: params.weeks,
      runningDays: params.runningDays,
      fitnessLevel: params.fitnessLevel,
      vdot: params.vdot ? parseFloat(params.vdot) : undefined,
      currentWeeklyMileage: params.currentWeeklyMileage,
      preferences: params.preferences || undefined,
    });
  };

  const goals = [
    { value: "5k", label: "5K Race" },
    { value: "10k", label: "10K Race" },
    { value: "half_marathon", label: "Half Marathon" },
    { value: "marathon", label: "Marathon" },
    { value: "general_fitness", label: "General Fitness" },
  ];

  const fitnessLevels = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "elite", label: "Elite" },
  ];

  return (
    <div className="space-y-4">
      {/* Trigger Button */}
      {!showForm && !ai.trainingPlan && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="w-full py-3 bg-strava-orange text-white rounded-xl text-sm font-semibold hover:bg-[#E04400] transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate AI Training Plan
        </motion.button>
      )}

      {/* Form */}
      <AnimatePresence>
        {showForm && !ai.trainingPlan && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-xl p-5 border border-orange-200 card-shadow overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-strava-orange flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                AI Training Plan Generator
              </h3>
            </div>

            <div className="space-y-4">
              {/* Goal */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2 block flex items-center gap-1">
                  <Target className="w-3 h-3" /> Goal
                </label>
                <select
                  value={params.goal}
                  onChange={(e) => setParams({ ...params, goal: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-strava-orange"
                >
                  {goals.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Goal Time & Weeks Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1 block flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Target Time
                  </label>
                  <input
                    type="text"
                    value={params.goalTime}
                    onChange={(e) => setParams({ ...params, goalTime: e.target.value })}
                    placeholder="e.g., 1:45:00"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-strava-orange font-mono-stats"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1 block flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Weeks
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={24}
                    value={params.weeks}
                    onChange={(e) => setParams({ ...params, weeks: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-strava-orange font-mono-stats"
                  />
                </div>
              </div>

              {/* Fitness Level & Running Days */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1 block flex items-center gap-1">
                    <Gauge className="w-3 h-3" /> Level
                  </label>
                  <select
                    value={params.fitnessLevel}
                    onChange={(e) =>
                      setParams({ ...params, fitnessLevel: e.target.value as FitnessLevel })
                    }
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-strava-orange"
                  >
                    {fitnessLevels.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1 block">
                    Days/Week
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={7}
                    value={params.runningDays}
                    onChange={(e) =>
                      setParams({ ...params, runningDays: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-strava-orange font-mono-stats"
                  />
                </div>
              </div>

              {/* VDOT & Weekly Mileage */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1 block">
                    VDOT (optional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={params.vdot}
                    onChange={(e) => setParams({ ...params, vdot: e.target.value })}
                    placeholder="e.g., 52.4"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-strava-orange font-mono-stats"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1 block">
                    Current km/week
                  </label>
                  <input
                    type="number"
                    value={params.currentWeeklyMileage}
                    onChange={(e) =>
                      setParams({ ...params, currentWeeklyMileage: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-strava-orange font-mono-stats"
                  />
                </div>
              </div>

              {/* Preferences */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1 block">
                  Preferences (optional)
                </label>
                <textarea
                  value={params.preferences}
                  onChange={(e) => setParams({ ...params, preferences: e.target.value })}
                  placeholder="e.g., prefer morning runs, avoid hills..."
                  rows={2}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-strava-orange resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ai.isGeneratingPlan}
                  className="flex-1 py-2.5 bg-strava-orange text-white rounded-xl text-sm font-semibold hover:bg-[#E04400] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {ai.isGeneratingPlan ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Generated Plan Preview */}
      <AnimatePresence>
        {ai.trainingPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl p-5 border border-green-200 card-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    AI Training Plan Generated
                  </h3>
                  <p className="text-xs text-gray-500">
                    {ai.trainingPlan.totalWeeks} weeks · {ai.trainingPlan.totalDays} workouts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="text-xs text-strava-orange font-medium hover:underline"
              >
                Regenerate
              </button>
            </div>

            {/* Plan Summary */}
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {ai.trainingPlan.plan.slice(0, 2).map((week: any) => (
                <div key={week.week} className="border border-gray-100 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">
                    Week {week.week}
                  </p>
                  <div className="space-y-1">
                    {week.days.slice(0, 3).map((day: any) => (
                      <div
                        key={day.date}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span className="text-gray-400 w-8">{day.day}</span>
                        <span className="font-medium text-gray-700 flex-1">
                          {day.title}
                        </span>
                        {day.distance && (
                          <span className="text-gray-500 font-mono-stats">
                            {day.distance}km
                          </span>
                        )}
                        <span
                          className="px-1.5 py-0.5 rounded-full text-[10px] font-medium capitalize"
                          style={{
                            backgroundColor: getWorkoutColor(day.workoutType),
                            color: "white",
                          }}
                        >
                          {day.workoutType}
                        </span>
                      </div>
                    ))}
                    {week.days.length > 3 && (
                      <p className="text-[10px] text-gray-400 pl-8">
                        +{week.days.length - 3} more days
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {ai.trainingPlan.plan.length > 2 && (
                <p className="text-xs text-gray-400 text-center">
                  +{ai.trainingPlan.plan.length - 2} more weeks
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getWorkoutColor(type: string): string {
  const colors: Record<string, string> = {
    easy: "#10B981",
    tempo: "#F59E0B",
    interval: "#FC4C02",
    long_run: "#3B82F6",
    recovery: "#8B5CF6",
    rest: "#9CA3AF",
    hills: "#EF4444",
    progression: "#EC4899",
  };
  return colors[type] || "#6B7280";
}
