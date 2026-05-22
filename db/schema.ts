import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  float,
  int,
  json,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

// ============================================
// RunStride AI - Database Schema
// ============================================

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
  // RunStride-specific profile fields
  age: int("age"),
  gender: varchar("gender", { length: 20 }),
  heightCm: float("heightCm"),
  weightKg: float("weightKg"),
  restingHR: int("restingHR"),
  maxHR: int("maxHR"),
  vdot: float("vdot"),
  fitnessLevel: mysqlEnum("fitnessLevel", ["beginner", "intermediate", "advanced", "elite"]).default("intermediate"),
  weeklyMileage: float("weeklyMileage"),
  preferredDistanceUnit: mysqlEnum("preferredDistanceUnit", ["km", "mi"]).default("km"),
  stravaConnected: boolean("stravaConnected").default(false),
  stravaAccessToken: text("stravaAccessToken"),
  stravaRefreshToken: text("stravaRefreshToken"),
  stravaTokenExpiresAt: timestamp("stravaTokenExpiresAt"),
  stravaAthleteId: varchar("stravaAthleteId", { length: 100 }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Activities table
export const activities = mysqlTable("activities", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  stravaId: varchar("stravaId", { length: 100 }),
  title: varchar("title", { length: 255 }).notNull(),
  sport: mysqlEnum("sport", ["run", "ride", "swim", "hike", "treadmill", "trail_run"]).default("run").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  distance: float("distance"), // km
  duration: int("duration"), // seconds
  pace: float("pace"), // min/km
  avgHR: int("avgHR"),
  maxHR: int("maxHR"),
  elevationGain: int("elevationGain"), // meters
  calories: int("calories"),
  perceivedExertion: int("perceivedExertion"), // 1-10 RPE
  kudos: int("kudos").default(0),
  comments: int("comments").default(0),
  aiInsight: text("aiInsight"),
  hrZoneTime: json("hrZoneTime"), // { "1": seconds, "2": seconds, ... }
  route: json("route"), // [[lat, lng], ...]
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

// Training Plan table
export const trainingPlans = mysqlTable("trainingPlans", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  day: varchar("day", { length: 10 }).notNull(), // Mon, Tue, etc.
  date: varchar("date", { length: 20 }).notNull(), // YYYY-MM-DD
  workoutType: mysqlEnum("workoutType", ["easy", "tempo", "interval", "long_run", "recovery", "rest", "hills", "progression"]).default("easy").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  distance: float("distance"), // km
  duration: int("duration"), // minutes
  targetPace: varchar("targetPace", { length: 50 }),
  targetHR: varchar("targetHR", { length: 50 }),
  description: text("description"),
  completed: boolean("completed").default(false),
  weekNumber: int("weekNumber").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrainingPlan = typeof trainingPlans.$inferSelect;
export type InsertTrainingPlan = typeof trainingPlans.$inferInsert;

// Gear table
export const gear = mysqlTable("gear", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["shoe", "bike", "watch", "other"]).default("shoe").notNull(),
  brand: varchar("brand", { length: 100 }),
  mileage: float("mileage").default(0), // km
  maxMileage: float("maxMileage").default(800), // recommended lifespan km
  surfaceType: mysqlEnum("surfaceType", ["road", "trail", "track", "mixed"]).default("road"),
  dateAdded: timestamp("dateAdded").defaultNow().notNull(),
  isActive: boolean("isActive").default(true),
});

export type Gear = typeof gear.$inferSelect;
export type InsertGear = typeof gear.$inferInsert;

// Clubs table
export const clubs = mysqlTable("clubs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  coverImage: text("coverImage"),
  memberCount: int("memberCount").default(0),
  location: varchar("location", { length: 255 }),
  activityTypes: json("activityTypes"), // ["run", "ride", ...]
});

export type Club = typeof clubs.$inferSelect;
export type InsertClub = typeof clubs.$inferInsert;

// User Club memberships
export const clubMemberships = mysqlTable("clubMemberships", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  clubId: bigint("clubId", { mode: "number", unsigned: true }).notNull(),
  joined: boolean("joined").default(true),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type ClubMembership = typeof clubMemberships.$inferSelect;
export type InsertClubMembership = typeof clubMemberships.$inferInsert;

// Personal Records table
export const personalRecords = mysqlTable("personalRecords", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  distance: varchar("distance", { length: 50 }).notNull(), // "5K", "10K", etc.
  time: varchar("time", { length: 20 }).notNull(), // "18:32"
  date: varchar("date", { length: 20 }).notNull(),
  vdot: float("vdot"),
});

export type PersonalRecord = typeof personalRecords.$inferSelect;
export type InsertPersonalRecord = typeof personalRecords.$inferInsert;

// Recovery data table
export const recoveryData = mysqlTable("recoveryData", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  readiness: int("readiness"), // 0-100
  status: mysqlEnum("status", ["full", "partial", "rest"]).default("partial"),
  sleepHours: float("sleepHours"),
  sleepQuality: int("sleepQuality"), // 1-10
  hrv: int("hrv"), // ms
  hrvBaseline: int("hrvBaseline"),
  recommendation: text("recommendation"),
  nextHardDay: varchar("nextHardDay", { length: 50 }),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export type RecoveryData = typeof recoveryData.$inferSelect;
export type InsertRecoveryData = typeof recoveryData.$inferInsert;
