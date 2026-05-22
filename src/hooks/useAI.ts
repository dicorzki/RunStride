// ============================================
// useAI Hook - Gemini AI Integration
// ============================================
import { useCallback } from "react";
import { trpc } from "@/providers/trpc";

export function useAI() {
  const generatePlanMutation = trpc.ai.generateTrainingPlan.useMutation();

  const generateSuggestionsMutation = trpc.ai.generateWorkoutSuggestions.useMutation();

  const analyzeActivityMutation = trpc.ai.analyzeActivity.useMutation();

  const generateTrainingPlan = useCallback(
    (params: {
      goal: string;
      goalTime?: string;
      weeks?: number;
      runningDays?: number;
      fitnessLevel?: "beginner" | "intermediate" | "advanced" | "elite";
      vdot?: number;
      currentWeeklyMileage?: number;
      preferences?: string;
    }) => {
      generatePlanMutation.mutate({
        goal: params.goal,
        goalTime: params.goalTime,
        weeks: params.weeks ?? 12,
        runningDays: params.runningDays ?? 5,
        fitnessLevel: params.fitnessLevel ?? "intermediate",
        vdot: params.vdot,
        currentWeeklyMileage: params.currentWeeklyMileage ?? 30,
        preferences: params.preferences,
      });
    },
    [generatePlanMutation]
  );

  const generateWorkoutSuggestions = useCallback(
    (params: {
      vdot: number;
      recentActivities?: string;
      targetRace?: string;
      fatigue?: "low" | "moderate" | "high";
    }) => {
      generateSuggestionsMutation.mutate(params);
    },
    [generateSuggestionsMutation]
  );

  const analyzeActivity = useCallback(
    (params: {
      title: string;
      sport: string;
      distance: number;
      duration: number;
      avgHR: number;
      maxHR: number;
      elevationGain: number;
      pace: number;
      vdot?: number;
    }) => {
      analyzeActivityMutation.mutate(params);
    },
    [analyzeActivityMutation]
  );

  return {
    // Training Plan
    generateTrainingPlan,
    trainingPlan: generatePlanMutation.data,
    isGeneratingPlan: generatePlanMutation.isPending,
    planError: generatePlanMutation.error,

    // Workout Suggestions
    generateWorkoutSuggestions,
    suggestions: generateSuggestionsMutation.data,
    isGeneratingSuggestions: generateSuggestionsMutation.isPending,

    // Activity Analysis
    analyzeActivity,
    analysis: analyzeActivityMutation.data,
    isAnalyzing: analyzeActivityMutation.isPending,
  };
}
