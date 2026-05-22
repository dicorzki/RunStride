// ============================================
// Home Page - Activity Feed, Readiness, Stats
// ============================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, MessageCircle, TrendingUp, Zap, Trophy,
  ChevronRight, Sparkles, Play, Calendar, Activity,
  Brain
} from 'lucide-react';
import { useApp } from '@/App';
import { formatTime, formatPace, formatDistance, timeAgo, getWorkoutLabel, getWorkoutColor } from '@/lib/sportsScience';
import type { Activity as ActivityType } from '@/types';
import StravaConnect from '@/components/StravaConnect';
import WeatherWidget from '@/components/WeatherWidget';
import AIGeneratePlan from '@/components/AIGeneratePlan';

// ---- Animation Variants ----
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

export default function HomePage() {
  const { state } = useApp();

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-8 md:pt-6">
      {/* Section 1: Readiness & AI Coach Banner */}
      <ReadinessBanner />

      {/* Strava Connect & Weather */}
      <div className="mt-4 space-y-3">
        <StravaConnect />
        <WeatherWidget />
      </div>

      {/* Section 3: Quick Stats Grid */}
      <QuickStatsGrid />

      {/* AI Training Plan Generator */}
      <div className="mt-4">
        <AIGeneratePlan />
      </div>

      {/* Section 5: Weekly Training Plan Calendar */}
      <TrainingPlanCalendar />

      {/* Section 4: Personal Records */}
      <PersonalRecords />

      {/* Section 2: Activity Feed */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Activity Feed</h2>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            {state.activities.length} Activities
          </span>
        </div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {state.activities.map((activity, index) => (
            <ActivityCard key={activity.id} activity={activity} index={index} />
          ))}
        </motion.div>
      </div>

      {/* Section 6: AI Coach Suggestions */}
      <AISuggestions />

      {/* Footer */}
      <footer className="mt-8 text-center pb-4">
        <p className="text-xs text-gray-400">RunStride AI — Your AI Running Coach</p>
        <p className="text-[10px] text-gray-300 mt-1">v1.0.0</p>
      </footer>
    </div>
  );
}

// ============================================
// Readiness & AI Coach Banner
// ============================================

function ReadinessBanner() {
  const { state, navigate } = useApp();
  const readiness = state.recovery;

  if (!readiness) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-4 text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FC4C02 0%, #FF8A5C 100%)' }}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-medium text-white/80 uppercase tracking-wider">Today&apos;s Readiness</p>
            <p className="text-sm mt-0.5 text-white/90">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/20"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeDasharray={`${readiness.readiness}, 100`}
              />
            </svg>
            <span className="absolute text-sm font-bold">{readiness.readiness}</span>
          </div>
        </div>

        {/* AI Coach message */}
        <div className="flex items-start gap-2 mb-3 bg-white/15 rounded-xl p-3">
          <Brain className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm leading-relaxed">{readiness.recommendation}</p>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate('record')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white text-strava-orange rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            <Play className="w-4 h-4" />
            Start Workout
          </button>
          <button
            onClick={() => navigate('training')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            View Plan
          </button>
          <button
            onClick={() => navigate('record')}
            className="px-3 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
          >
            Log
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// Quick Stats Grid
// ============================================

function QuickStatsGrid() {
  const { state } = useApp();
  const thisWeek = state.weeklyMileages[0];
  const lastWeek = state.weeklyMileages[1];
  const weekChange = lastWeek ? ((thisWeek.distance - lastWeek.distance) / lastWeek.distance * 100) : 0;
  const latestACWR = state.acwrData[state.acwrData.length - 1];

  const stats = [
    {
      label: 'This Week',
      value: `${thisWeek.distance.toFixed(1)}`,
      unit: 'km',
      change: `${weekChange >= 0 ? '+' : ''}${weekChange.toFixed(0)}%`,
      icon: TrendingUp,
      changeColor: weekChange >= 0 ? 'text-green-500' : 'text-red-500',
    },
    {
      label: 'VDOT Score',
      value: `${state.user?.vdot}`,
      unit: '',
      change: 'Elite',
      icon: Zap,
      changeColor: 'text-strava-orange',
    },
    {
      label: 'ACWR Ratio',
      value: `${latestACWR?.ratio.toFixed(2)}`,
      unit: '',
      change: latestACWR?.ratio <= 1.3 ? 'Optimal' : 'Caution',
      icon: Activity,
      changeColor: latestACWR?.ratio <= 1.3 ? 'text-green-500' : 'text-yellow-500',
    },
    {
      label: 'Resting HR',
      value: `${state.user?.restingHR}`,
      unit: 'bpm',
      change: '-2 vs avg',
      icon: Heart,
      changeColor: 'text-green-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="grid grid-cols-2 gap-3 mt-4"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          custom={index}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl p-3.5 border border-gray-100 card-shadow"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <stat.icon className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{stat.label}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-strava-orange font-mono-stats">{stat.value}</span>
            {stat.unit && <span className="text-xs text-gray-400">{stat.unit}</span>}
          </div>
          <span className={`text-[11px] font-medium ${stat.changeColor}`}>{stat.change}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================
// Training Plan Calendar (Horizontal Day Pills)
// ============================================

function TrainingPlanCalendar() {
  const { state, navigate } = useApp();
  const [selectedDay, setSelectedDay] = useState(state.trainingPlan[3]?.date || '');

  const selectedWorkout = state.trainingPlan.find(d => d.date === selectedDay);

  const workoutIcons: Record<string, string> = {
    easy: '🏃',
    tempo: '⚡',
    interval: '🔥',
    long_run: '🏔️',
    recovery: '💚',
    rest: '💤',
    hills: '⛰️',
    progression: '📈',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="mt-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-gray-900">This Week&apos;s Plan</h2>
        <button
          onClick={() => navigate('training')}
          className="text-xs text-strava-orange font-medium flex items-center gap-0.5 hover:underline"
        >
          Full Plan <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Day pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {state.trainingPlan.map((day, index) => (
          <motion.button
            key={day.date}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 + index * 0.05 }}
            onClick={() => setSelectedDay(day.date)}
            className={`flex flex-col items-center min-w-[48px] p-2 rounded-xl transition-all ${
              selectedDay === day.date
                ? 'bg-strava-orange text-white shadow-md shadow-orange-200'
                : 'bg-white border border-gray-100 text-gray-600'
            }`}
          >
            <span className="text-[10px] font-medium uppercase">{day.day}</span>
            <span className="text-lg mt-0.5">{workoutIcons[day.workoutType] || '🏃'}</span>
            {day.completed && (
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${selectedDay === day.date ? 'bg-white' : 'bg-green-500'}`} />
            )}
          </motion.button>
        ))}
      </div>

      {/* Selected day detail */}
      <AnimatePresence mode="wait">
        {selectedWorkout && (
          <motion.div
            key={selectedWorkout.date}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 bg-white rounded-xl p-3.5 border border-gray-100 card-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-8 rounded-full"
                  style={{ backgroundColor: getWorkoutColor(selectedWorkout.workoutType) }}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedWorkout.title}</p>
                  <p className="text-xs text-gray-500">{getWorkoutLabel(selectedWorkout.workoutType)}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  // Would toggle completion
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  selectedWorkout.completed
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {selectedWorkout.completed ? 'Done' : 'Mark Done'}
              </button>
            </div>
            {selectedWorkout.distance && (
              <div className="flex gap-4 mt-2 ml-4">
                <span className="text-xs text-gray-500">
                  <span className="font-mono-stats font-semibold text-gray-700">{selectedWorkout.distance}km</span> distance
                </span>
                <span className="text-xs text-gray-500">
                  <span className="font-mono-stats font-semibold text-gray-700">{selectedWorkout.duration}min</span> duration
                </span>
                {selectedWorkout.targetPace && (
                  <span className="text-xs text-gray-500">
                    <span className="font-mono-stats font-semibold text-gray-700">{selectedWorkout.targetPace}</span> pace
                  </span>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1.5 ml-4">{selectedWorkout.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// Personal Records Horizontal Scroll
// ============================================

function PersonalRecords() {
  const { state } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="mt-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="w-4 h-4 text-yellow-500" />
        <h2 className="text-sm font-bold text-gray-900">Personal Records</h2>
      </div>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1">
        {state.personalRecords.map((pr, index) => (
          <motion.div
            key={pr.distance}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + index * 0.1 }}
            className="snap-start flex-shrink-0 w-[120px] h-[80px] rounded-xl p-3 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FC4C02, #FF8A5C)' }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <Trophy className="w-4 h-4 mb-1 relative z-10" />
            <p className="text-[11px] font-medium opacity-90 relative z-10">{pr.distance}</p>
            <p className="text-sm font-bold font-mono-stats relative z-10">{pr.time}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================
// Activity Feed Card (Strava-style)
// ============================================

function ActivityCard({ activity, index }: { activity: ActivityType; index: number }) {
  const { dispatch } = useApp();
  const [kudoGiven, setKudoGiven] = useState(false);

  const sportIcons: Record<string, string> = {
    run: '🏃',
    ride: '🚴',
    swim: '🏊',
    hike: '🥾',
    treadmill: '🏃',
    trail_run: '⛰️',
  };

  const handleKudos = () => {
    if (!kudoGiven) {
      dispatch({ type: 'GIVE_KUDOS', payload: activity.id });
      setKudoGiven(true);
    }
  };

  return (
    <motion.div
      custom={index}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl border border-gray-100 card-shadow overflow-hidden"
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 p-3 pb-2">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          <img src={activity.userAvatar} alt={activity.userName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{activity.userName}</p>
          <p className="text-[11px] text-gray-400">{timeAgo(activity.date)} · {sportIcons[activity.sport] || '🏃'} {activity.sport.replace('_', ' ')}</p>
        </div>
        <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <span className="text-gray-400 text-lg leading-none">⋯</span>
        </button>
      </div>

      {/* Title */}
      <p className="px-3 text-sm font-semibold text-gray-800">{activity.title}</p>

      {/* Map or Activity Image */}
      {(activity.mapImage || activity.activityImage) && (
        <div className="mt-2 mx-3 rounded-lg overflow-hidden aspect-[16/9] bg-gray-100">
          <img
            src={activity.mapImage || activity.activityImage}
            alt={activity.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Stats Row */}
      <div className="flex items-center gap-4 px-3 py-2.5 mt-1">
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 uppercase tracking-wider">Distance</span>
          <span className="text-sm font-bold font-mono-stats text-gray-900">{formatDistance(activity.distance)}</span>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 uppercase tracking-wider">Pace</span>
          <span className="text-sm font-bold font-mono-stats text-gray-900">{formatPace(activity.pace)}/km</span>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 uppercase tracking-wider">Time</span>
          <span className="text-sm font-bold font-mono-stats text-gray-900">{formatTime(activity.duration)}</span>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 uppercase tracking-wider">Elev</span>
          <span className="text-sm font-bold font-mono-stats text-gray-900">{activity.elevationGain}m</span>
        </div>
      </div>

      {/* AI Insight Pill */}
      {activity.aiInsight && (
        <div className="px-3 pb-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-strava-orange text-[11px] font-medium rounded-full">
            <Sparkles className="w-3 h-3" />
            {activity.aiInsight}
          </span>
        </div>
      )}

      {/* Engagement Bar */}
      <div className="flex items-center gap-1 px-3 py-2 border-t border-gray-50">
        <button
          onClick={handleKudos}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            kudoGiven ? 'bg-orange-50 text-strava-orange' : 'hover:bg-gray-50 text-gray-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${kudoGiven ? 'fill-current' : ''}`} />
          <span className="text-xs font-medium">
            {activity.kudos + (kudoGiven ? 1 : 0)} Kudos
          </span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-medium">{activity.comments}</span>
        </button>
      </div>
    </motion.div>
  );
}

// ============================================
// AI Coach Workout Suggestions
// ============================================

function AISuggestions() {
  const { state, navigate } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mt-5 bg-white rounded-xl border border-orange-200 overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, white 0%, #FFF7ED 100%)' }}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-strava-orange flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">AI Coach Recommends</h3>
            <p className="text-[11px] text-gray-500">Based on your VDOT {state.user?.vdot} profile</p>
          </div>
        </div>

        <div className="space-y-2">
          {state.aiSuggestions.slice(0, 2).map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-3 bg-white rounded-xl border border-orange-100 card-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getWorkoutColor(suggestion.workoutType) }}
                  />
                  <p className="text-sm font-semibold text-gray-800">{suggestion.title}</p>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">RPE {suggestion.targetRPE}/10</span>
              </div>
              <div className="flex gap-3 mt-1.5 ml-4">
                <span className="text-[11px] text-gray-500">
                  <span className="font-mono-stats font-semibold text-gray-700">{suggestion.duration}min</span>
                </span>
                {suggestion.distance && (
                  <span className="text-[11px] text-gray-500">
                    <span className="font-mono-stats font-semibold text-gray-700">{suggestion.distance}km</span>
                  </span>
                )}
                <span className="text-[11px] text-gray-500">
                  <span className="font-mono-stats font-semibold text-gray-700">{suggestion.targetPace}</span> pace
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5 ml-4 leading-relaxed">{suggestion.reasoning}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('training')}
          className="w-full mt-3 py-3 bg-strava-orange text-white rounded-xl text-sm font-semibold hover:bg-[#E04400] transition-colors active:scale-[0.98]"
        >
          Generate New Plan
        </button>
      </div>
    </motion.div>
  );
}

import { AnimatePresence } from 'framer-motion';
