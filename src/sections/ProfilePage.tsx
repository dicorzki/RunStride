// ============================================
// Profile Page - User Profile & Settings
// ============================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, ChevronRight, LogOut, Trophy, Target,
  Heart, Zap, TrendingUp, Award, Ruler, Weight, Calendar
} from 'lucide-react';
import { useApp } from '@/App';
import StravaConnect from '@/components/StravaConnect';
import WeatherWidget from '@/components/WeatherWidget';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function ProfilePage() {
  const { state, dispatch, navigate } = useApp();
  const user = state.user;
  const [activeSection, setActiveSection] = useState<'overview' | 'edit'>('overview');

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please log in</p>
      </div>
    );
  }

  const menuItems = [
    { icon: Trophy, label: 'Personal Records', page: undefined as undefined, value: `${state.personalRecords.length} records` },
    { icon: Target, label: 'Training Plans', page: 'training' as const, value: `${state.trainingPlan.filter(d => d.completed).length}/${state.trainingPlan.length} done` },
    { icon: Heart, label: 'Recovery & Nutrition', page: 'recovery' as const, value: `${state.recovery?.readiness || 0}% readiness` },
    { icon: Zap, label: 'Gear Tracker', page: 'gear' as const, value: `${state.gear.length} items` },
    { icon: TrendingUp, label: 'Full Analytics', page: 'stats' as const, value: 'View charts' },
    { icon: Award, label: 'Clubs', page: 'clubs' as const, value: `${state.clubs.filter(c => c.joined).length} joined` },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-8 md:pt-6">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 border border-gray-100 card-shadow mb-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden ring-3 ring-strava-orange ring-offset-2">
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500">@{user.name.toLowerCase().replace(' ', '')} · {user.fitnessLevel}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs bg-orange-50 text-strava-orange px-2 py-0.5 rounded-full font-medium">
                VDOT {user.vdot}
              </span>
              <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                {user.weeklyMileage}km/week
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveSection(activeSection === 'overview' ? 'edit' : 'overview')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 font-mono-stats">{state.activities.length}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Activities</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 font-mono-stats">
              {state.activities.reduce((acc, a) => acc + a.distance, 0).toFixed(0)}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total km</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 font-mono-stats">{state.activities.reduce((acc, a) => acc + a.elevationGain, 0)}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Elevation m</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 font-mono-stats">{user.restingHR}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Rest HR</p>
          </div>
        </div>
      </motion.div>

      {activeSection === 'overview' ? (
        <>
          {/* Strava & Weather */}
          <div className="space-y-3 mb-4">
            <StravaConnect />
            <WeatherWidget />
          </div>

          {/* Physical Stats */}
          <motion.div
            custom={1}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl p-4 border border-gray-100 card-shadow mb-4"
          >
            <h2 className="text-sm font-bold text-gray-900 mb-3">Physical Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[11px] text-gray-400">Age</p>
                  <p className="text-sm font-semibold text-gray-800">{user.age} years</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                <Ruler className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[11px] text-gray-400">Height</p>
                  <p className="text-sm font-semibold text-gray-800">{user.heightCm} cm</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                <Weight className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[11px] text-gray-400">Weight</p>
                  <p className="text-sm font-semibold text-gray-800">{user.weightKg} kg</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                <Heart className="w-4 h-4 text-red-400" />
                <div>
                  <p className="text-[11px] text-gray-400">Max HR</p>
                  <p className="text-sm font-semibold text-gray-800">{user.maxHR} bpm</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Menu Items */}
          <motion.div
            custom={2}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="space-y-1"
          >
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => item.page && navigate(item.page)}
                className="w-full flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100 card-shadow hover:card-shadow-hover transition-all text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                </div>
                <span className="text-xs text-gray-400 mr-1">{item.value}</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </motion.div>

          {/* Sign Out */}
          <motion.div
            custom={3}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mt-4"
          >
            <button
              onClick={() => dispatch({ type: 'LOGOUT' })}
              className="w-full flex items-center justify-center gap-2 p-3.5 bg-red-50 rounded-xl text-red-600 font-medium text-sm hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.div>
        </>
      ) : (
        /* Edit Profile Form */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 card-shadow"
        >
          <h2 className="text-sm font-bold text-gray-900 mb-4">Edit Profile</h2>
          <div className="space-y-4">
            {[
              { label: 'Name', value: user.name, key: 'name' },
              { label: 'Age', value: user.age.toString(), key: 'age' },
              { label: 'Height (cm)', value: user.heightCm.toString(), key: 'height' },
              { label: 'Weight (kg)', value: user.weightKg.toString(), key: 'weight' },
              { label: 'Resting HR', value: user.restingHR.toString(), key: 'rhr' },
              { label: 'Max HR', value: user.maxHR.toString(), key: 'maxhr' },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1 block">
                  {field.label}
                </label>
                <input
                  type="text"
                  defaultValue={field.value}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-strava-orange focus:border-transparent"
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActiveSection('overview')}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setActiveSection('overview')}
                className="flex-1 py-3 bg-strava-orange text-white rounded-xl font-medium text-sm hover:bg-[#E04400] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
