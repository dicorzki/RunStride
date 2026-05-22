// ============================================
// RunStride AI - Main Application Shell
// Context, Reducer, Navigation, Routing
// Fullstack with tRPC + Supabase + Strava + AI
// ============================================

import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, Search } from 'lucide-react';
import type { AppState, AppAction, Page } from '@/types';
import { initializeDemoData } from '@/lib/demoData';
import { calculateReadiness, getReadinessRecommendation } from '@/lib/sportsScience';
import { trpc } from '@/providers/trpc';

// ---- Pages ----
import HomePage from '@/sections/HomePage';
import MapPage from '@/sections/MapPage';
import RecordPage from '@/sections/RecordPage';
import StatsPage from '@/sections/StatsPage';
import ProfilePage from '@/sections/ProfilePage';
import RecoveryPage from '@/sections/RecoveryPage';
import TrainingPage from '@/sections/TrainingPage';
import GearPage from '@/sections/GearPage';
import ClubsPage from '@/sections/ClubsPage';
import BottomNav from '@/sections/BottomNav';

// ============================================
// Initial State
// ============================================

const demoData = initializeDemoData();

const initialState: AppState = {
  currentPage: 'home',
  user: demoData.user,
  activities: demoData.activities,
  trainingPlan: demoData.trainingPlan,
  aiSuggestions: demoData.aiSuggestions,
  recovery: demoData.recovery,
  gear: demoData.gear,
  clubs: demoData.clubs,
  personalRecords: demoData.personalRecords,
  weeklyMileages: demoData.weeklyMileages,
  acwrData: demoData.acwrData,
  isLoggedIn: true,
  sidebarOpen: false,
};

// ============================================
// Reducer
// ============================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload, sidebarOpen: false };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities] };
    case 'GIVE_KUDOS': {
      const updatedActivities = state.activities.map(a =>
        a.id === action.payload ? { ...a, kudos: a.kudos + 1 } : a
      );
      return { ...state, activities: updatedActivities };
    }
    case 'SET_TRAINING_PLAN':
      return { ...state, trainingPlan: action.payload };
    case 'TOGGLE_WORKOUT_COMPLETE': {
      const updatedPlan = state.trainingPlan.map(day =>
        day.date === action.payload ? { ...day, completed: !day.completed } : day
      );
      return { ...state, trainingPlan: updatedPlan };
    }
    case 'SET_AI_SUGGESTIONS':
      return { ...state, aiSuggestions: action.payload };
    case 'SET_RECOVERY':
      return { ...state, recovery: action.payload };
    case 'SET_GEAR':
      return { ...state, gear: action.payload };
    case 'SET_CLUBS':
      return { ...state, clubs: action.payload };
    case 'TOGGLE_CLUB_JOIN': {
      const updatedClubs = state.clubs.map(c =>
        c.id === action.payload ? { ...c, joined: !c.joined } : c
      );
      return { ...state, clubs: updatedClubs };
    }
    case 'SET_PERSONAL_RECORDS':
      return { ...state, personalRecords: action.payload };
    case 'SET_WEEKLY_MILEAGES':
      return { ...state, weeklyMileages: action.payload };
    case 'SET_ACWR_DATA':
      return { ...state, acwrData: action.payload };
    case 'LOGIN':
      return { ...state, user: action.payload, isLoggedIn: true };
    case 'LOGOUT':
      return { ...state, user: null, isLoggedIn: false, currentPage: 'home' };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    default:
      return state;
  }
}

// ============================================
// Context
// ============================================

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  navigate: (page: Page) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

// ============================================
// App Component
// ============================================

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // tRPC hooks for API integration
  const { data: stravaStatus } = trpc.strava.status.useQuery(undefined, {
    enabled: state.isLoggedIn,
    retry: false,
  });

  const syncActivitiesMutation = trpc.strava.syncActivities.useMutation();

  // Recalculate readiness on mount
  useEffect(() => {
    if (state.recovery && state.acwrData.length > 0) {
      const latestACWR = state.acwrData[state.acwrData.length - 1];
      const readiness = calculateReadiness(
        latestACWR.ratio,
        state.recovery.sleepHours,
        state.recovery.sleepQuality,
        state.recovery.hrv,
        state.recovery.hrvBaseline
      );
      const recommendation = getReadinessRecommendation(readiness);
      dispatch({
        type: 'SET_RECOVERY',
        payload: { ...state.recovery, readiness, recommendation },
      });
    }
  }, []);

  // Auto-sync Strava activities when connected
  useEffect(() => {
    if (stravaStatus?.connected && state.isLoggedIn) {
      syncActivitiesMutation.mutate(
        { page: 1, perPage: 30 },
        {
          onSuccess: (data) => {
            if (data.activities.length > 0) {
              // Merge synced activities with local activities
              const newActivities = data.activities.map((a: any) => ({
                id: `strava-${a.id}`,
                userId: state.user?.id || '',
                userName: state.user?.name || '',
                userAvatar: state.user?.avatar || '',
                title: a.title,
                sport: a.sport,
                date: a.date,
                distance: a.distance,
                duration: a.duration,
                pace: a.pace,
                avgHR: a.avg_hr || 0,
                maxHR: a.max_hr || 0,
                elevationGain: a.elevation_gain || 0,
                calories: a.calories || 0,
                perceivedExertion: 5,
                kudos: 0,
                comments: 0,
                aiInsight: 'Synced from Strava',
              }));
              dispatch({ type: 'SET_ACTIVITIES', payload: [...newActivities, ...state.activities] });
            }
          },
        }
      );
    }
  }, [stravaStatus?.connected]);

  const navigate = useCallback((page: Page) => {
    dispatch({ type: 'SET_PAGE', payload: page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (state.sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [state.sidebarOpen]);

  const renderPage = () => {
    switch (state.currentPage) {
      case 'home': return <HomePage />;
      case 'map': return <MapPage />;
      case 'record': return <RecordPage />;
      case 'stats': return <StatsPage />;
      case 'profile': return <ProfilePage />;
      case 'recovery': return <RecoveryPage />;
      case 'training': return <TrainingPage />;
      case 'gear': return <GearPage />;
      case 'clubs': return <ClubsPage />;
      default: return <HomePage />;
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, navigate }}>
      <div className="min-h-screen bg-white">
        {/* Desktop Header */}
        <DesktopHeader />

        {/* Main Content */}
        <main className="pb-24 md:pb-6 md:pt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />

        {/* Mobile Sidebar Drawer */}
        <SidebarDrawer />
      </div>
    </AppContext.Provider>
  );
}

// ============================================
// Desktop Header
// ============================================

function DesktopHeader() {
  const { state, dispatch, navigate } = useApp();

  return (
    <header className="hidden md:flex fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 items-center px-4 lg:px-6">
      <button
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors mr-4"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Logo */}
      <button
        onClick={() => navigate('home')}
        className="flex items-center gap-2 mr-auto"
      >
        <div className="w-8 h-8 rounded-lg bg-strava-orange flex items-center justify-center">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        <span className="font-bold text-lg text-gray-900 tracking-tight">RunStride AI</span>
      </button>

      {/* Desktop Nav Links */}
      <nav className="hidden lg:flex items-center gap-1 mr-6">
        <NavLink page="home" label="Home" />
        <NavLink page="map" label="Map" />
        <NavLink page="stats" label="Stats" />
        <NavLink page="training" label="Training" />
        <NavLink page="recovery" label="Recovery" />
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-strava-orange rounded-full" />
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Search className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={() => navigate('profile')}
          className="ml-2 w-8 h-8 rounded-full overflow-hidden ring-2 ring-strava-orange ring-offset-1"
        >
          {state.user && (
            <img src={state.user.avatar} alt="Profile" className="w-full h-full object-cover" />
          )}
        </button>
      </div>
    </header>
  );
}

function NavLink({ page, label }: { page: Page; label: string }) {
  const { state, navigate } = useApp();
  const isActive = state.currentPage === page;

  return (
    <button
      onClick={() => navigate(page)}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-orange-50 text-strava-orange'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}

// ============================================
// Mobile Sidebar Drawer
// ============================================

function SidebarDrawer() {
  const { state, dispatch, navigate } = useApp();

  const menuItems: { page: Page; label: string; icon: string }[] = [
    { page: 'home', label: 'Home Feed', icon: '\u{1F3E0}' },
    { page: 'map', label: 'Explore Map', icon: '\u{1F5FA}' },
    { page: 'stats', label: 'My Stats', icon: '\u{1F4CA}' },
    { page: 'training', label: 'Training Plan', icon: '\u{1F4C5}' },
    { page: 'recovery', label: 'Recovery', icon: '\u{1F4A4}' },
    { page: 'gear', label: 'Gear Tracker', icon: '\u{1F45F}' },
    { page: 'clubs', label: 'Clubs', icon: '\u{1F465}' },
    { page: 'profile', label: 'Profile', icon: '\u{1F464}' },
  ];

  return (
    <AnimatePresence>
      {state.sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="fixed inset-0 bg-black/40 z-[60] md:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[70] shadow-xl md:hidden"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {state.user && (
                    <img src={state.user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">{state.user?.name}</p>
                  <p className="text-xs text-gray-500">@{state.user?.name.toLowerCase().replace(' ', '')}</p>
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="p-2 mt-2">
              {menuItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => {
                    navigate(item.page);
                    dispatch({ type: 'TOGGLE_SIDEBAR' });
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                    state.currentPage === item.page
                      ? 'bg-orange-50 text-strava-orange font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                  {state.currentPage === item.page && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-strava-orange" />
                  )}
                </button>
              ))}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
              <button
                onClick={() => dispatch({ type: 'LOGOUT' })}
                className="w-full py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Sign Out
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">RunStride AI v2.0</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default App;
