// ============================================
// Record / Log Activity Page
// ============================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Square, MapPin, Timer, Heart, Mountain,
  Gauge, Flame, Save, RotateCcw
} from 'lucide-react';
import { useApp } from '@/App';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function RecordPage() {
  const { state, dispatch, navigate } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    sport: 'run' as string,
    distance: '',
    duration: '',
    avgHR: '',
    maxHR: '',
    elevation: '',
    calories: '',
    rpe: '5',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const distance = parseFloat(formData.distance) || 0;
    const duration = parseInt(formData.duration) * 60 || 0;
    const pace = distance > 0 ? (duration / 60) / distance : 0;

    const newActivity = {
      id: `act-${Date.now()}`,
      userId: state.user?.id || '',
      userName: state.user?.name || '',
      userAvatar: state.user?.avatar || '',
      title: formData.title || 'Manual Entry',
      sport: formData.sport as any,
      date: new Date().toISOString(),
      distance,
      duration,
      pace,
      avgHR: parseInt(formData.avgHR) || 0,
      maxHR: parseInt(formData.maxHR) || 0,
      elevationGain: parseInt(formData.elevation) || 0,
      calories: parseInt(formData.calories) || 0,
      perceivedExertion: parseInt(formData.rpe),
      mapImage: '/images/map-route.jpg',
      kudos: 0,
      comments: 0,
      aiInsight: `Logged manually. ${parseInt(formData.rpe) > 7 ? 'High effort session!' : 'Steady effort. Good work!'}`,
    };

    dispatch({ type: 'ADD_ACTIVITY', payload: newActivity });
    navigate('home');
  };

  const sports = [
    { value: 'run', label: 'Run', icon: '🏃' },
    { value: 'trail_run', label: 'Trail Run', icon: '⛰️' },
    { value: 'ride', label: 'Ride', icon: '🚴' },
    { value: 'swim', label: 'Swim', icon: '🏊' },
    { value: 'hike', label: 'Hike', icon: '🥾' },
    { value: 'treadmill', label: 'Treadmill', icon: '🏃' },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8 md:pt-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-gray-900 mb-4"
      >
        Record Activity
      </motion.h1>

      {/* Quick Record Timer */}
      <motion.div
        custom={0}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl p-5 border border-gray-100 card-shadow mb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-strava-orange" />
            <h2 className="text-sm font-bold text-gray-900">Quick Record</h2>
          </div>
          {isRecording && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-red-500">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Recording
            </span>
          )}
        </div>

        {/* Timer Display */}
        <div className="flex items-center justify-center py-6">
          <div className="text-center">
            <div className="text-5xl font-bold font-mono-stats text-gray-900 tabular-nums">
              {Math.floor(elapsed / 3600).toString().padStart(2, '0')}:
              {Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0')}:
              {(elapsed % 60).toString().padStart(2, '0')}
            </div>
            <p className="text-xs text-gray-400 mt-2">Elapsed Time</p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4">
          {!isRecording ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsRecording(true)}
              className="flex items-center gap-2 px-6 py-3 bg-strava-orange text-white rounded-xl font-semibold hover:bg-[#E04400] transition-colors"
            >
              <Play className="w-5 h-5" />
              Start
            </motion.button>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRecording(false)}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                <Square className="w-5 h-5" />
                Stop
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setElapsed(0)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </motion.button>
            </>
          )}
        </div>
      </motion.div>

      {/* Manual Entry Form */}
      <motion.div
        custom={1}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl p-5 border border-gray-100 card-shadow"
      >
        <div className="flex items-center gap-2 mb-4">
          <Save className="w-5 h-5 text-blue-500" />
          <h2 className="text-sm font-bold text-gray-900">Manual Entry</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1 block">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Morning Run"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-strava-orange focus:border-transparent"
            />
          </div>

          {/* Sport Type */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2 block">Sport</label>
            <div className="grid grid-cols-3 gap-2">
              {sports.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, sport: s.value }))}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all ${
                    formData.sport === s.value
                      ? 'border-strava-orange bg-orange-50 text-strava-orange'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-[11px] font-medium">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Distance & Duration Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1 block">
                <MapPin className="w-3 h-3 inline mr-1" />Distance (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.distance}
                onChange={(e) => setFormData(prev => ({ ...prev, distance: e.target.value }))}
                placeholder="10.5"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-strava-orange focus:border-transparent font-mono-stats"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1 block">
                <Timer className="w-3 h-3 inline mr-1" />Duration (min)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="50"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-strava-orange focus:border-transparent font-mono-stats"
              />
            </div>
          </div>

          {/* HR & Elevation Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1 block">
                <Heart className="w-3 h-3 inline mr-1" />Avg HR
              </label>
              <input
                type="number"
                value={formData.avgHR}
                onChange={(e) => setFormData(prev => ({ ...prev, avgHR: e.target.value }))}
                placeholder="155"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-strava-orange focus:border-transparent font-mono-stats"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1 block">
                <Mountain className="w-3 h-3 inline mr-1" />Elevation (m)
              </label>
              <input
                type="number"
                value={formData.elevation}
                onChange={(e) => setFormData(prev => ({ ...prev, elevation: e.target.value }))}
                placeholder="85"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-strava-orange focus:border-transparent font-mono-stats"
              />
            </div>
          </div>

          {/* Calories & RPE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1 block">
                <Flame className="w-3 h-3 inline mr-1" />Calories
              </label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData(prev => ({ ...prev, calories: e.target.value }))}
                placeholder="750"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-strava-orange focus:border-transparent font-mono-stats"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1 block">
                <Gauge className="w-3 h-3 inline mr-1" />RPE (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.rpe}
                onChange={(e) => setFormData(prev => ({ ...prev, rpe: e.target.value }))}
                className="w-full mt-3 accent-strava-orange"
              />
              <div className="text-center text-sm font-mono-stats font-semibold text-strava-orange">{formData.rpe}/10</div>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3.5 bg-strava-orange text-white rounded-xl font-semibold text-sm hover:bg-[#E04400] transition-colors mt-2"
          >
            Save Activity
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
