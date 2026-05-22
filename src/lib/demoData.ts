// ============================================
// RunStride AI - Demo Data
// ============================================

import type {
  UserProfile, Activity, TrainingPlanDay, AIWorkoutSuggestion,
  RecoveryStatus, GearItem, Club, PersonalRecord, WeeklyMileage, ACWRData
} from '@/types';
import { calculateHRZones, calculateACWR, calculateTrainingLoad } from './sportsScience';

// Demo user profile
export const demoUser: UserProfile = {
  id: 'user-1',
  name: 'Alex Runner',
  avatar: '/images/avatar.jpg',
  age: 32,
  gender: 'male',
  heightCm: 178,
  weightKg: 72,
  restingHR: 48,
  maxHR: 192,
  vdot: 52.4,
  fitnessLevel: 'intermediate',
  weeklyMileage: 48,
  preferredDistanceUnit: 'km',
  stravaConnected: true,
  sweatRate: 'moderate',
  dietaryConstraint: 'none',
  fastingProtocol: 'none',
};

// Generate activities
export const demoActivities: Activity[] = [
  {
    id: 'act-1',
    userId: 'user-1',
    userName: 'Alex Runner',
    userAvatar: '/images/avatar.jpg',
    title: 'Morning Tempo Run',
    sport: 'run',
    date: '2026-05-22T06:30:00Z',
    distance: 12.5,
    duration: 3300, // 55:00
    pace: 4.40, // min/km
    avgHR: 165,
    maxHR: 178,
    elevationGain: 85,
    calories: 892,
    perceivedExertion: 7,
    mapImage: '/images/map-route.jpg',
    activityImage: '/images/activity-run.jpg',
    kudos: 24,
    comments: 5,
    aiInsight: 'Tempo pace in Zone 4. Solid threshold work!',
    hrZoneTime: { '1': 180, '2': 420, '3': 1200, '4': 1200, '5': 300 },
    splits: [
      { km: 1, pace: 4.55, elevation: 12, hr: 148 },
      { km: 2, pace: 4.42, elevation: 8, hr: 158 },
      { km: 3, pace: 4.38, elevation: -3, hr: 165 },
      { km: 4, pace: 4.35, elevation: 5, hr: 168 },
      { km: 5, pace: 4.40, elevation: 15, hr: 170 },
    ],
    route: [[40.7128, -74.0060], [40.7140, -74.0050], [40.7155, -74.0040]],
  },
  {
    id: 'act-2',
    userId: 'user-1',
    userName: 'Alex Runner',
    userAvatar: '/images/avatar.jpg',
    title: 'Trail Adventure — Bear Mountain',
    sport: 'trail_run',
    date: '2026-05-20T07:00:00Z',
    distance: 18.2,
    duration: 7200, // 2:00:00
    pace: 6.59, // min/km
    avgHR: 152,
    maxHR: 172,
    elevationGain: 650,
    calories: 1450,
    perceivedExertion: 8,
    mapImage: '/images/map-route.jpg',
    activityImage: '/images/trail-run.jpg',
    kudos: 42,
    comments: 12,
    aiInsight: 'Great elevation gain! 82% in aerobic zones.',
    hrZoneTime: { '1': 600, '2': 2400, '3': 3000, '4': 900, '5': 300 },
    route: [[40.7128, -74.0060], [40.7140, -74.0050], [40.7155, -74.0040]],
  },
  {
    id: 'act-3',
    userId: 'user-1',
    userName: 'Alex Runner',
    userAvatar: '/images/avatar.jpg',
    title: 'Easy Recovery Run',
    sport: 'run',
    date: '2026-05-19T18:00:00Z',
    distance: 6.0,
    duration: 2160, // 36:00
    pace: 6.00, // min/km
    avgHR: 135,
    maxHR: 145,
    elevationGain: 30,
    calories: 420,
    perceivedExertion: 3,
    mapImage: '/images/map-route.jpg',
    activityImage: '/images/activity-run.jpg',
    kudos: 15,
    comments: 2,
    aiInsight: 'Perfect recovery pace. Zone 2 at 72% maxHR.',
    hrZoneTime: { '1': 300, '2': 1500, '3': 300, '4': 0, '5': 0 },
  },
  {
    id: 'act-4',
    userId: 'user-1',
    userName: 'Alex Runner',
    userAvatar: '/images/avatar.jpg',
    title: 'Interval Session — 8x800m',
    sport: 'run',
    date: '2026-05-17T06:15:00Z',
    distance: 10.5,
    duration: 3000, // 50:00
    pace: 4.76, // min/km avg
    avgHR: 168,
    maxHR: 185,
    elevationGain: 20,
    calories: 780,
    perceivedExertion: 9,
    mapImage: '/images/map-route.jpg',
    activityImage: '/images/activity-run.jpg',
    kudos: 31,
    comments: 8,
    aiInsight: 'Intervals at 5K pace. VO2 max stimulus achieved!',
    hrZoneTime: { '1': 300, '2': 600, '3': 600, '4': 900, '5': 600 },
  },
  {
    id: 'act-5',
    userId: 'user-1',
    userName: 'Alex Runner',
    userAvatar: '/images/avatar.jpg',
    title: 'Weekend Long Ride',
    sport: 'ride',
    date: '2026-05-16T08:00:00Z',
    distance: 65.0,
    duration: 9000, // 2:30:00
    pace: 2.31, // min/km
    avgHR: 138,
    maxHR: 165,
    elevationGain: 420,
    calories: 1200,
    perceivedExertion: 5,
    mapImage: '/images/map-route.jpg',
    activityImage: '/images/activity-cycle.jpg',
    kudos: 28,
    comments: 6,
    aiInsight: 'Cross-training. Good aerobic base maintenance.',
    hrZoneTime: { '1': 600, '2': 4200, '3': 3000, '4': 900, '5': 0 },
  },
  {
    id: 'act-6',
    userId: 'user-1',
    userName: 'Alex Runner',
    userAvatar: '/images/avatar.jpg',
    title: 'Open Water Swim',
    sport: 'swim',
    date: '2026-05-14T06:45:00Z',
    distance: 2.0,
    duration: 2400, // 40:00
    pace: 20.0, // min/km
    avgHR: 142,
    maxHR: 155,
    elevationGain: 0,
    calories: 380,
    perceivedExertion: 5,
    mapImage: '/images/map-route.jpg',
    activityImage: '/images/activity-swim.jpg',
    kudos: 18,
    comments: 3,
    aiInsight: 'Cross-training recovery. Low impact aerobic work.',
    hrZoneTime: { '1': 300, '2': 1800, '3': 300, '4': 0, '5': 0 },
  },
  {
    id: 'act-7',
    userId: 'user-1',
    userName: 'Alex Runner',
    userAvatar: '/images/avatar.jpg',
    title: 'Hill Repeats — 6x200m',
    sport: 'run',
    date: '2026-05-13T06:30:00Z',
    distance: 8.5,
    duration: 2700, // 45:00
    pace: 5.29, // min/km
    avgHR: 162,
    maxHR: 180,
    elevationGain: 280,
    calories: 650,
    perceivedExertion: 8,
    mapImage: '/images/map-route.jpg',
    activityImage: '/images/activity-run.jpg',
    kudos: 22,
    comments: 4,
    aiInsight: 'Hill repeats build power. Good neuromuscular work.',
    hrZoneTime: { '1': 300, '2': 600, '3': 600, '4': 600, '5': 600 },
  },
  {
    id: 'act-8',
    userId: 'user-1',
    userName: 'Alex Runner',
    userAvatar: '/images/avatar.jpg',
    title: 'Summit Hike — Weekend Adventure',
    sport: 'hike',
    date: '2026-05-11T09:00:00Z',
    distance: 14.3,
    duration: 16200, // 4:30:00
    pace: 18.88, // min/km
    avgHR: 118,
    maxHR: 145,
    elevationGain: 920,
    calories: 980,
    perceivedExertion: 4,
    mapImage: '/images/map-route.jpg',
    activityImage: '/images/activity-hike.jpg',
    kudos: 35,
    comments: 9,
    aiInsight: 'Active recovery hike. Great for aerobic base.',
    hrZoneTime: { '1': 2400, '2': 5400, '3': 1800, '4': 0, '5': 0 },
  },
];

// Training plan for the current week
export const demoTrainingPlan: TrainingPlanDay[] = [
  { day: 'Mon', date: '2026-05-19', workoutType: 'rest', title: 'Rest Day', description: 'Complete rest or light stretching. Foam rolling recommended.', completed: true },
  { day: 'Tue', date: '2026-05-20', workoutType: 'easy', title: 'Easy Run', distance: 8, duration: 50, targetPace: '5:30-6:00', targetHR: 'Zone 2 (135-145)', description: 'Easy aerobic run. Focus on form and breathing.', completed: true },
  { day: 'Wed', date: '2026-05-21', workoutType: 'interval', title: 'Track Intervals', distance: 10, duration: 55, targetPace: '4:00-4:15', targetHR: 'Zone 4-5 (165-180)', description: '8x800m at 5K pace with 2min jog recovery.', completed: true },
  { day: 'Thu', date: '2026-05-22', workoutType: 'tempo', title: 'Tempo Run', distance: 12, duration: 55, targetPace: '4:20-4:40', targetHR: 'Zone 4 (160-170)', description: '2km warm-up + 8km tempo + 2km cool-down.', completed: false },
  { day: 'Fri', date: '2026-05-23', workoutType: 'recovery', title: 'Recovery Run', distance: 6, duration: 36, targetPace: '6:00-6:30', targetHR: 'Zone 1-2 (130-145)', description: 'Very easy recovery jog. Keep HR low.', completed: false },
  { day: 'Sat', date: '2026-05-24', workoutType: 'long_run', title: 'Long Run', distance: 24, duration: 150, targetPace: '5:15-5:45', targetHR: 'Zone 2-3 (140-160)', description: 'Steady long run. Fuel every 45min.', completed: false },
  { day: 'Sun', date: '2026-05-25', workoutType: 'rest', title: 'Rest or Yoga', description: 'Full rest day. Optional yoga or stretching.', completed: false },
];

// AI workout suggestions
export const demoAISuggestions: AIWorkoutSuggestion[] = [
  {
    id: 'ai-1',
    title: 'Tempo Progression Run',
    workoutType: 'progression',
    duration: 55,
    distance: 12,
    targetPace: '4:20-4:50/km',
    targetRPE: 7,
    reasoning: 'Based on your VDOT of 52.4, this tempo run will build your lactate threshold. Your recent ACWR of 1.15 shows you\'re in the optimal training zone.',
  },
  {
    id: 'ai-2',
    title: 'Pyramid Intervals',
    workoutType: 'interval',
    duration: 50,
    distance: 10,
    targetPace: '3:55-4:10/km',
    targetRPE: 8,
    reasoning: 'Your 5K PR suggests strong VO2max. Pyramid intervals (400m-800m-1200m-800m-400m) will top-end speed and pacing skills.',
  },
  {
    id: 'ai-3',
    title: 'Hill Circuit',
    workoutType: 'hills',
    duration: 45,
    distance: 8,
    targetPace: '5:00-5:30/km',
    targetRPE: 7,
    reasoning: 'Hill repeats build running economy and power. 6x90sec hill efforts with jog-down recovery. Great for trail race prep.',
  },
];

// Recovery status
export const demoRecovery: RecoveryStatus = {
  readiness: 78,
  status: 'full',
  sleepHours: 7.5,
  sleepQuality: 8,
  hrv: 62,
  hrvBaseline: 58,
  recommendation: 'You are well-recovered. A tempo run or interval session would be appropriate today.',
  nextHardDay: 'Tomorrow',
};

// Gear items
export const demoGear: GearItem[] = [
  {
    id: 'gear-1',
    name: 'Pegasus Turbo 3',
    type: 'shoe',
    brand: 'Nike',
    image: '/images/running-shoe.png',
    mileage: 342,
    maxMileage: 800,
    surfaceType: 'road',
    dateAdded: '2026-01-15',
    isActive: true,
  },
  {
    id: 'gear-2',
    name: 'Speedgoat 5',
    type: 'shoe',
    brand: 'Hoka',
    image: '/images/running-shoe.png',
    mileage: 156,
    maxMileage: 700,
    surfaceType: 'trail',
    dateAdded: '2026-03-01',
    isActive: true,
  },
  {
    id: 'gear-3',
    name: 'Vaporfly Next% 3',
    type: 'shoe',
    brand: 'Nike',
    image: '/images/running-shoe.png',
    mileage: 45,
    maxMileage: 400,
    surfaceType: 'road',
    dateAdded: '2026-04-20',
    isActive: true,
  },
];

// Clubs
export const demoClubs: Club[] = [
  {
    id: 'club-1',
    name: 'NYC Runners',
    coverImage: '/images/club-cover.jpg',
    memberCount: 2453,
    location: 'New York, NY',
    activityTypes: ['run', 'trail_run'],
    joined: true,
  },
  {
    id: 'club-2',
    name: 'Central Park Track',
    coverImage: '/images/club-cover.jpg',
    memberCount: 892,
    location: 'New York, NY',
    activityTypes: ['run'],
    joined: false,
  },
  {
    id: 'club-3',
    name: 'Trail Blazers',
    coverImage: '/images/club-cover.jpg',
    memberCount: 567,
    location: 'Hudson Valley, NY',
    activityTypes: ['trail_run', 'hike'],
    joined: true,
  },
  {
    id: 'club-4',
    name: 'Triathlon NYC',
    coverImage: '/images/club-cover.jpg',
    memberCount: 1234,
    location: 'New York, NY',
    activityTypes: ['run', 'ride', 'swim'],
    joined: false,
  },
];

// Personal records
export const demoPRs: PersonalRecord[] = [
  { distance: '5K', time: '18:32', date: '2026-04-15', vdot: 52.4 },
  { distance: '10K', time: '38:45', date: '2026-03-22', vdot: 51.8 },
  { distance: 'Half Marathon', time: '1:26:14', date: '2026-02-10', vdot: 50.2 },
  { distance: 'Marathon', time: '3:05:42', date: '2025-11-03', vdot: 48.9 },
];

// Weekly mileage history (most recent first)
export const demoWeeklyMileages: WeeklyMileage[] = [
  { weekStart: '2026-05-19', distance: 48.2, activities: 5, duration: 310 },
  { weekStart: '2026-05-12', distance: 52.1, activities: 6, duration: 340 },
  { weekStart: '2026-05-05', distance: 45.8, activities: 5, duration: 295 },
  { weekStart: '2026-04-28', distance: 50.3, activities: 6, duration: 325 },
  { weekStart: '2026-04-21', distance: 42.5, activities: 5, duration: 280 },
  { weekStart: '2026-04-14', distance: 46.0, activities: 5, duration: 305 },
  { weekStart: '2026-04-07', distance: 40.2, activities: 5, duration: 265 },
  { weekStart: '2026-03-31', distance: 38.5, activities: 4, duration: 250 },
];

// ACWR data
export const demoACWRData: ACWRData[] = [
  { date: '2026-03-31', acuteLoad: 250, chronicLoad: 260, ratio: 0.96 },
  { date: '2026-04-07', acuteLoad: 265, chronicLoad: 258, ratio: 1.03 },
  { date: '2026-04-14', acuteLoad: 305, chronicLoad: 268, ratio: 1.14 },
  { date: '2026-04-21', acuteLoad: 280, chronicLoad: 275, ratio: 1.02 },
  { date: '2026-04-28', acuteLoad: 325, chronicLoad: 283, ratio: 1.15 },
  { date: '2026-05-05', acuteLoad: 295, chronicLoad: 296, ratio: 1.00 },
  { date: '2026-05-12', acuteLoad: 340, chronicLoad: 301, ratio: 1.13 },
  { date: '2026-05-19', acuteLoad: 310, chronicLoad: 315, ratio: 0.98 },
];

// Map route coordinates (NYC Central Park loop)
export const demoMapRoute: [number, number][] = [
  [40.768, -73.981],
  [40.770, -73.978],
  [40.773, -73.975],
  [40.776, -73.974],
  [40.779, -73.973],
  [40.782, -73.974],
  [40.784, -73.976],
  [40.786, -73.978],
  [40.787, -73.981],
  [40.788, -73.985],
  [40.787, -73.989],
  [40.785, -73.992],
  [40.782, -73.995],
  [40.779, -73.997],
  [40.776, -73.998],
  [40.773, -73.997],
  [40.770, -73.995],
  [40.768, -73.991],
  [40.767, -73.987],
  [40.768, -73.981],
];

// Initialize all demo data with calculated fields
export function initializeDemoData() {
  // Calculate HR zones and attach to user
  const hrZones = calculateHRZones(demoUser.maxHR, demoUser.restingHR);

  // Calculate ACWR
  const weeklyLoads = demoWeeklyMileages.map(w => w.distance);
  const acwr = calculateACWR(weeklyLoads);

  // Calculate training loads for activities
  const activitiesWithLoad = demoActivities.map(a => ({
    ...a,
    trainingLoad: calculateTrainingLoad(a.duration / 60, a.avgHR, demoUser.maxHR, demoUser.restingHR),
  }));

  return {
    user: { ...demoUser, hrZones },
    activities: activitiesWithLoad,
    trainingPlan: demoTrainingPlan,
    aiSuggestions: demoAISuggestions,
    recovery: demoRecovery,
    gear: demoGear,
    clubs: demoClubs,
    personalRecords: demoPRs,
    weeklyMileages: demoWeeklyMileages,
    acwrData: demoACWRData,
    acwr,
    mapRoute: demoMapRoute,
  };
}
