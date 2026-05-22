// ============================================
// Stats Page - VDOT, HR Zones, ACWR, Pace Zones
// ============================================

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceArea,
  BarChart, Bar
} from 'recharts';
import { TrendingUp, Heart, Activity, Zap, Target } from 'lucide-react';
import { useApp } from '@/App';
import { calculateHRZones, getPaceZones, getACWRColor } from '@/lib/sportsScience';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export default function StatsPage() {
  const { state } = useApp();
  const user = state.user;

  if (!user) return null;

  const hrZones = useMemo(() => calculateHRZones(user.maxHR, user.restingHR), [user.maxHR, user.restingHR]);
  const paceZones = useMemo(() => getPaceZones(user.vdot), [user.vdot]);

  // Aggregate HR zone time from all activities
  const hrZoneData = useMemo(() => {
    const totals: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    state.activities.forEach(a => {
      if (a.hrZoneTime) {
        Object.entries(a.hrZoneTime).forEach(([zone, seconds]) => {
          totals[parseInt(zone)] = (totals[parseInt(zone)] || 0) + seconds / 60; // convert to minutes
        });
      }
    });
    return Object.entries(totals).map(([zone, minutes]) => ({
      name: `Z${zone}`,
      value: Math.round(minutes),
      zone: parseInt(zone),
    }));
  }, [state.activities]);

  const hrZoneColors = ['#9CA3AF', '#10B981', '#F59E0B', '#FC4C02', '#EF4444'];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-8 md:pt-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-gray-900 mb-4"
      >
        Training Stats
      </motion.h1>

      {/* VDOT Card */}
      <motion.div
        custom={0}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl p-5 border border-gray-100 card-shadow mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-strava-orange flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Current VDOT</p>
              <p className="text-3xl font-bold text-strava-orange font-mono-stats">{user.vdot}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Fitness Level</p>
            <p className="text-sm font-semibold text-gray-700 capitalize">{user.fitnessLevel}</p>
          </div>
        </div>
        {/* VDOT Visual Meter */}
        <div className="mt-4">
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(user.vdot / 85) * 100}%` }}
              transition={{ delay: 0.5, duration: 1, ease: 'easeOut' as const }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #FC4C02, #FF8A5C)' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-400">Beginner (30)</span>
            <span className="text-[10px] text-gray-400">Elite (85)</span>
          </div>
        </div>
      </motion.div>

      {/* Pace Zones */}
      <motion.div
        custom={1}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl p-5 border border-gray-100 card-shadow mb-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-strava-orange" />
          <h2 className="text-sm font-bold text-gray-900">Pace Zones (VDOT Based)</h2>
        </div>
        <div className="space-y-2.5">
          {paceZones.map((zone, i) => {
            const paceDisplay = `${Math.floor(zone.max)}:${Math.round((zone.max % 1) * 60).toString().padStart(2, '0')}`;
            return (
              <div key={zone.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: zone.color }} />
                <span className="text-xs text-gray-500 w-28 flex-shrink-0">{zone.name}</span>
                <div className="flex-1 h-5 bg-gray-50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - i * 18}%` }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.6 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: zone.color, opacity: 0.8 }}
                  />
                </div>
                <span className="text-xs font-mono-stats font-semibold text-gray-700 w-14 text-right flex-shrink-0">
                  {paceDisplay}/km
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* HR Zones */}
      <motion.div
        custom={2}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl p-5 border border-gray-100 card-shadow mb-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-red-500" />
          <h2 className="text-sm font-bold text-gray-900">Heart Rate Zones</h2>
          <span className="text-[11px] text-gray-400 ml-auto">{user.maxHR} max · {user.restingHR} resting</span>
        </div>
        {/* Donut Chart */}
        <div className="w-full h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={hrZoneData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                dataKey="value"
                nameKey="name"
                paddingAngle={2}
              >
                {hrZoneData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={hrZoneColors[entry.zone - 1]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} min`, 'Time']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* HR Zone Bars */}
        <div className="space-y-2">
          {hrZones.map((zone) => (
            <div key={zone.zone} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: zone.color }} />
              <span className="text-xs text-gray-500 w-24 flex-shrink-0">{zone.name}</span>
              <div className="flex-1 h-4 bg-gray-50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(zone.maxHR - zone.minHR) / (user.maxHR - user.restingHR) * 100}%` }}
                  transition={{ delay: 0.7 + zone.zone * 0.1, duration: 0.6 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: zone.color, opacity: 0.7 }}
                />
              </div>
              <span className="text-[11px] font-mono-stats text-gray-500 w-16 text-right flex-shrink-0">
                {zone.minHR}-{zone.maxHR}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ACWR Trend */}
      <motion.div
        custom={3}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl p-5 border border-gray-100 card-shadow mb-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-500" />
          <h2 className="text-sm font-bold text-gray-900">Training Load (ACWR)</h2>
          <span className="text-[11px] text-gray-400 ml-auto">Acute:Chronic Workload</span>
        </div>
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={state.acwrData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                tick={{ fontSize: 10 }}
              />
              <YAxis domain={[0.5, 1.8]} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(value: number) => [value.toFixed(2), 'Ratio']}
              />
              <ReferenceArea y1={0.8} y2={1.3} fill="#10B981" fillOpacity={0.08} />
              <Line
                type="monotone"
                dataKey="ratio"
                stroke="#FC4C02"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#FC4C02' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] text-gray-400">Safe (0.8-1.3)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-[10px] text-gray-400">Caution (1.3-1.5)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[10px] text-gray-400">High Risk (&gt;1.5)</span>
            </div>
          </div>
          {state.acwrData.length > 0 && (
            <span
              className="text-xs font-bold px-2 py-1 rounded-full"
              style={{
                color: getACWRColor(state.acwrData[state.acwrData.length - 1].ratio),
                backgroundColor: `${getACWRColor(state.acwrData[state.acwrData.length - 1].ratio)}15`,
              }}
            >
              Current: {state.acwrData[state.acwrData.length - 1].ratio.toFixed(2)}
            </span>
          )}
        </div>
      </motion.div>

      {/* Weekly Mileage Trend */}
      <motion.div
        custom={4}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl p-5 border border-gray-100 card-shadow"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <h2 className="text-sm font-bold text-gray-900">Weekly Distance</h2>
        </div>
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...state.weeklyMileages].reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="weekStart"
                tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                tick={{ fontSize: 9 }}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(value: number) => [`${value.toFixed(1)} km`, 'Distance']}
              />
              <Bar dataKey="distance" fill="#FC4C02" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
