// ============================================
// Community & Clubs Page
// ============================================

import { motion } from 'framer-motion';
import { Users, MapPin, UserPlus, UserCheck } from 'lucide-react';
import { useApp } from '@/App';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

export default function ClubsPage() {
  const { state, dispatch } = useApp();

  const sportIcons: Record<string, string> = {
    run: '🏃',
    ride: '🚴',
    swim: '🏊',
    hike: '🥾',
    trail_run: '⛰️',
  };

  const handleToggleJoin = (clubId: string) => {
    dispatch({ type: 'TOGGLE_CLUB_JOIN', payload: clubId });
  };

  const joinedClubs = state.clubs.filter(c => c.joined);
  const availableClubs = state.clubs.filter(c => !c.joined);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-8 md:pt-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-gray-900 mb-4"
      >
        Clubs & Community
      </motion.h1>

      {/* My Clubs */}
      {joinedClubs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="w-4 h-4 text-green-500" />
            <h2 className="text-sm font-bold text-gray-900">My Clubs</h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {joinedClubs.map((club, index) => (
              <motion.div
                key={club.id}
                custom={index}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 card-shadow"
              >
                <div className="h-24 overflow-hidden relative">
                  <img src={club.coverImage} alt={club.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 left-3">
                    <h3 className="text-white font-bold text-sm">{club.name}</h3>
                    <div className="flex items-center gap-1 text-white/80 text-[11px]">
                      <MapPin className="w-3 h-3" />
                      {club.location}
                    </div>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="w-3.5 h-3.5" />
                      {club.memberCount.toLocaleString()}
                    </div>
                    <div className="flex gap-1">
                      {club.activityTypes.map(t => (
                        <span key={t} className="text-sm">{sportIcons[t] || '🏃'}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleJoin(club.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Joined
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Discover Clubs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-strava-orange" />
          <h2 className="text-sm font-bold text-gray-900">Discover</h2>
        </div>

        {/* Horizontal Scroll Cards */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-4 px-4">
          {availableClubs.map((club, index) => (
            <motion.div
              key={club.id}
              custom={index}
              variants={fadeInRight}
              initial="hidden"
              animate="visible"
              className="snap-start flex-shrink-0 w-[200px] bg-white rounded-2xl overflow-hidden border border-gray-100 card-shadow"
            >
              <div className="h-20 overflow-hidden relative">
                <img src={club.coverImage} alt={club.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-bold text-gray-900 truncate">{club.name}</h3>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {club.location}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-gray-500">{club.memberCount.toLocaleString()} members</span>
                  <button
                    onClick={() => handleToggleJoin(club.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-strava-orange text-white rounded-lg text-[11px] font-medium hover:bg-[#E04400] transition-colors"
                  >
                    <UserPlus className="w-3 h-3" />
                    Join
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Create Club CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-strava-orange flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900">Start Your Own Club</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Create a club for your running group, team, or community. Invite members and organize events.
            </p>
            <button className="mt-3 px-4 py-2 bg-strava-orange text-white rounded-lg text-xs font-semibold hover:bg-[#E04400] transition-colors">
              Create Club
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
