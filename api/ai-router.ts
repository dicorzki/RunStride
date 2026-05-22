// ============================================
// AI Router - Gemini-powered Training Plans
// ============================================
import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { env } from "./lib/env";
import { supabase } from "./supabase-client";
import { TRPCError } from "@trpc/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(env.geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Generate a training plan using Gemini AI
 */
export const aiRouter = createRouter({
  /**
   * Generate a personalized training plan based on user profile and goals
   */
  generateTrainingPlan: authedQuery
    .input(
      z.object({
        goal: z.string(), // e.g., "marathon", "half_marathon", "5k", "10k", "general_fitness"
        goalTime: z.string().optional(), // e.g., "3:30:00" for marathon
        weeks: z.number().min(4).max(24).default(12),
        runningDays: z.number().min(2).max(7).default(5),
        fitnessLevel: z.enum(["beginner", "intermediate", "advanced", "elite"]).default("intermediate"),
        vdot: z.number().optional(),
        currentWeeklyMileage: z.number().default(30),
        preferences: z.string().optional(), // e.g., "prefer morning runs, avoid hills"
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Get user profile data
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("age, gender, weight_kg, height_cm, resting_hr, max_hr, vdot, fitness_level, weekly_mileage")
        .eq("id", userId)
        .single();

      if (userError) {
        // Use input values if user data not available
        console.warn("Could not fetch user data, using input values");
      }

      const profile = {
        age: userData?.age ?? 30,
        gender: userData?.gender ?? "not specified",
        weight: userData?.weight_kg ?? 70,
        height: userData?.height_cm ?? 175,
        restingHR: userData?.resting_hr ?? 60,
        maxHR: userData?.max_hr ?? 180,
        vdot: input.vdot ?? userData?.vdot ?? 45,
        fitnessLevel: input.fitnessLevel,
        currentWeeklyMileage: input.currentWeeklyMileage,
      };

      // Build the prompt for Gemini
      const prompt = `You are an expert running coach with deep knowledge of exercise physiology, periodization, and the Jack Daniels' VDOT system. Create a detailed ${input.weeks}-week training plan for a ${profile.fitnessLevel} runner.

RUNNER PROFILE:
- Age: ${profile.age}
- Gender: ${profile.gender}
- Weight: ${profile.weight}kg
- Height: ${profile.height}cm
- Resting HR: ${profile.restingHR} bpm
- Max HR: ${profile.maxHR} bpm
- VDOT Score: ${profile.vdot}
- Current Weekly Mileage: ${profile.currentWeeklyMileage}km
- Running Days Per Week: ${input.runningDays}
- Goal: ${input.goal}${input.goalTime ? ` (Target time: ${input.goalTime})` : ""}
${input.preferences ? `\nPREFERENCES: ${input.preferences}` : ""}

IMPORTANT INSTRUCTIONS:
1. Create a periodized plan with proper progression (no more than 10% weekly mileage increase)
2. Follow the 80/20 intensity distribution rule (80% easy, 20% hard)
3. Include rest days and recovery weeks every 3-4 weeks
4. Use proper workout types: easy, tempo, interval, long_run, recovery, rest, hills, progression
5. Specify target paces based on the VDOT of ${profile.vdot}
6. Include specific workout descriptions
7. Format output as VALID JSON with this exact structure:

{
  "plan": [
    {
      "week": 1,
      "days": [
        {
          "day": "Mon",
          "date": "2026-05-26",
          "workoutType": "rest",
          "title": "Rest Day",
          "description": "Complete rest. Light stretching optional.",
          "distance": null,
          "duration": null,
          "targetPace": null,
          "targetHR": null
        },
        {
          "day": "Tue",
          "date": "2026-05-27",
          "workoutType": "easy",
          "title": "Easy Run",
          "description": "Easy aerobic run at conversational pace.",
          "distance": 8,
          "duration": 50,
          "targetPace": "5:30-6:00/km",
          "targetHR": "Zone 2"
        }
      ]
    }
  ]
}

Generate a complete ${input.weeks}-week plan. Use dates starting from the upcoming Monday. Make sure the JSON is valid and complete.`;

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AI returned invalid format. Please try again.",
          });
        }

        const planData = JSON.parse(jsonMatch[0]);

        // Store the plan in database
        const flattenedDays: any[] = [];
        planData.plan.forEach((week: any) => {
          week.days.forEach((day: any) => {
            flattenedDays.push({
              user_id: userId,
              week_number: week.week,
              day: day.day,
              date: day.date,
              workout_type: day.workoutType,
              title: day.title,
              description: day.description,
              distance: day.distance,
              duration: day.duration,
              target_pace: day.targetPace,
              target_hr: day.targetHR,
              completed: false,
            });
          });
        });

        // Clear existing plans and insert new ones
        await supabase.from("trainingPlans").delete().eq("user_id", userId);

        const { error: insertError } = await supabase
          .from("trainingPlans")
          .insert(flattenedDays);

        if (insertError) {
          console.warn("Failed to store plan:", insertError.message);
        }

        return {
          success: true,
          plan: planData.plan,
          totalWeeks: input.weeks,
          totalDays: flattenedDays.length,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate training plan: ${error.message}`,
        });
      }
    }),

  /**
   * Generate AI workout suggestions based on current fitness data
   */
  generateWorkoutSuggestions: authedQuery
    .input(
      z.object({
        vdot: z.number(),
        recentActivities: z.string().optional(), // JSON string of recent activities
        targetRace: z.string().optional(),
        fatigue: z.enum(["low", "moderate", "high"]).default("moderate"),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `You are an expert AI running coach. Based on the following runner profile, suggest 3 optimal workouts for today.

RUNNER PROFILE:
- VDOT: ${input.vdot}
- Fatigue Level: ${input.fatigue}
${input.targetRace ? `- Target Race: ${input.targetRace}` : ""}
${input.recentActivities ? `- Recent Activities: ${input.recentActivities}` : ""}

Generate 3 workout suggestions as VALID JSON:
{
  "suggestions": [
    {
      "title": "Workout Name",
      "workoutType": "tempo",
      "duration": 45,
      "distance": 8,
      "targetPace": "4:30/km",
      "targetRPE": 7,
      "reasoning": "Why this workout is recommended based on the runner's profile."
    }
  ]
}`;

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AI returned invalid format",
          });
        }

        return JSON.parse(jsonMatch[0]);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate suggestions: ${error.message}`,
        });
      }
    }),

  /**
   * Analyze activity and provide AI insight
   */
  analyzeActivity: publicQuery
    .input(
      z.object({
        title: z.string(),
        sport: z.string(),
        distance: z.number(),
        duration: z.number(), // seconds
        avgHR: z.number(),
        maxHR: z.number(),
        elevationGain: z.number(),
        pace: z.number(), // min/km
        vdot: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `Analyze this running activity and provide a brief, insightful comment (max 100 characters):

Activity: ${input.title}
Distance: ${input.distance.toFixed(1)}km
Duration: ${Math.round(input.duration / 60)}min
Pace: ${input.pace.toFixed(2)}/km
Avg HR: ${input.avgHR}
Max HR: ${input.maxHR}
Elevation: ${input.elevationGain}m
${input.vdot ? `VDOT: ${input.vdot}` : ""}

Respond with ONLY a JSON object:
{"insight": "Your brief, encouraging insight here."}`;

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          return { insight: "Great effort! Keep up the consistent training." };
        }

        return JSON.parse(jsonMatch[0]);
      } catch {
        return { insight: "Solid workout! Consistency is key to improvement." };
      }
    }),
});
