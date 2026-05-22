// ============================================
// Gear Tracker Page
// ============================================

import { motion } from 'framer-motion';
import { Footprints, AlertTriangle, Check, Clock } from 'lucide-react';
import { useApp } from '@/App';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function GearPage() {
  const { state } = useApp();

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-8 md:pt-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-gray-900 mb-4"
      >
        Gear Tracker
      </motion.h1>

      {/* Gear Summary */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="grid grid-cols-3 gap-3 mb-5"
      >
        <div className="bg-white rounded-xl p-3 border border-gray-100 card-shadow text-center">
          <p className="text-xl font-bold text-strava-orange font-mono-stats">{state.gear.length}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Items</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 card-shadow text-center">
          <p className="text-xl font-bold text-blue-500 font-mono-stats">
            {state.gear.reduce((acc, g) => acc + g.mileage, 0).toFixed(0)}
          </p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total km</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-100 card-shadow text-center">
          <p className="text-xl font-bold text-yellow-500 font-mono-stats">
            {state.gear.filter(g => g.mileage / g.maxMileage > 0.7).length}
          </p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Replace Soon</p>
        </div>
      </motion.div>

      {/* Gear List */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {state.gear.map((item, index) => {
          const percentUsed = (item.mileage / item.maxMileage) * 100;
          const needsReplace = percentUsed > 80;
          const caution = percentUsed > 60;

          return (
            <motion.div
              key={item.id}
              custom={index}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl p-4 border border-gray-100 card-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Shoe Image */}
                <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-contain"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.brand} · <span className="capitalize">{item.surfaceType}</span></p>
                    </div>
                    {needsReplace && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        Replace
                      </span>
                    )}
                    {caution && !needsReplace && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-600 rounded-full text-[10px] font-medium">
                        <Clock className="w-3 h-3" />
                        Soon
                      </span>
                    )}
                    {!caution && !needsReplace && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-500 rounded-full text-[10px] font-medium">
                        <Check className="w-3 h-3" />
                        Good
                      </span>
                    )}
                  </div>

                  {/* Mileage Bar */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-gray-500">
                        <span className="font-mono-stats font-semibold text-gray-700">{item.mileage.toFixed(0)}</span> / {item.maxMileage} km
                      </span>
                      <span className="text-[11px] font-mono-stats font-medium" style={{ color: needsReplace ? '#EF4444' : caution ? '#F59E0B' : '#10B981' }}>
                        {percentUsed.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentUsed, 100)}%` }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: needsReplace ? '#EF4444' : caution ? '#F59E0B' : '#FC4C02',
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 mt-1.5">
                    Added {new Date(item.dateAdded).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Add Gear Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full mt-4 py-3.5 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-medium text-gray-400 hover:border-strava-orange hover:text-strava-orange transition-colors flex items-center justify-center gap-2"
      >
        <Footprints className="w-4 h-4" />
        Add New Gear
      </motion.button>
    </div>
  );
}
