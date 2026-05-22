// ============================================
// Strava Router - OAuth & Activity Sync
// ============================================
import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { env } from "./lib/env";
import { supabase } from "./supabase-client";
import { TRPCError } from "@trpc/server";

const STRAVA_API_BASE = "https://www.strava.com/api/v3";
const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";

/**
 * Get Strava authorization URL for OAuth flow
 */
function getStravaAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: env.stravaClientId,
    redirect_uri: env.stravaRedirectUri,
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read_all,profile:read_all",
    ...(state ? { state } : {}),
  });
  return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeStravaCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: any;
}> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.stravaClientId,
      client_secret: env.stravaClientSecret,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Strava token exchange failed: ${error}`,
    });
  }

  return response.json() as Promise<{ access_token: string; refresh_token: string; expires_at: number; athlete: any }>;
}

/**
 * Refresh Strava access token
 */
async function refreshStravaToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_at: number;
}> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.stravaClientId,
      client_secret: env.stravaClientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Failed to refresh Strava token",
    });
  }

  return response.json() as Promise<{ access_token: string; refresh_token: string; expires_at: number }>;
}

/**
 * Fetch athlete's activities from Strava
 */
async function fetchStravaActivities(
  accessToken: string,
  page: number = 1,
  perPage: number = 30
): Promise<any[]> {
  const response = await fetch(
    `${STRAVA_API_BASE}/athlete/activities?page=${page}&per_page=${perPage}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Failed to fetch Strava activities: ${response.statusText}`,
    });
  }

  return response.json() as Promise<any[]>;
}

/**
 * Fetch authenticated athlete profile from Strava
 */
async function fetchStravaAthlete(accessToken: string): Promise<any> {
  const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Failed to fetch Strava athlete: ${response.statusText}`,
    });
  }

  return response.json();
}

export const stravaRouter = createRouter({
  /**
   * Get Strava OAuth authorization URL
   */
  getAuthUrl: publicQuery.query(() => {
    return {
      url: getStravaAuthUrl(),
    };
  }),

  /**
   * Exchange OAuth code and connect Strava to user account
   */
  connect: authedQuery
    .input(
      z.object({
        code: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Exchange code for tokens
      const tokenData = await exchangeStravaCode(input.code);

      // Store tokens in Supabase
      const { error } = await supabase
        .from("users")
        .update({
          strava_connected: true,
          strava_access_token: tokenData.access_token,
          strava_refresh_token: tokenData.refresh_token,
          strava_token_expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
          strava_athlete_id: tokenData.athlete.id.toString(),
        })
        .eq("id", userId);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to store Strava tokens: ${error.message}`,
        });
      }

      return {
        success: true,
        athlete: {
          id: tokenData.athlete.id,
          firstname: tokenData.athlete.firstname,
          lastname: tokenData.athlete.lastname,
          profile: tokenData.athlete.profile,
          city: tokenData.athlete.city,
          state: tokenData.athlete.state,
          country: tokenData.athlete.country,
        },
      };
    }),

  /**
   * Disconnect Strava from user account
   */
  disconnect: authedQuery.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    const { error } = await supabase
      .from("users")
      .update({
        strava_connected: false,
        strava_access_token: null,
        strava_refresh_token: null,
        strava_token_expires_at: null,
        strava_athlete_id: null,
      })
      .eq("id", userId);

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to disconnect Strava: ${error.message}`,
      });
    }

    return { success: true };
  }),

  /**
   * Get Strava connection status
   */
  status: authedQuery.query(async ({ ctx }) => {
    const { data, error } = await supabase
      .from("users")
      .select("strava_connected, strava_athlete_id")
      .eq("id", ctx.user.id)
      .single();

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to check Strava status: ${error.message}`,
      });
    }

    return {
      connected: data?.strava_connected ?? false,
      athleteId: data?.strava_athlete_id ?? null,
    };
  }),

  /**
   * Fetch activities from Strava and sync to database
   */
  syncActivities: authedQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(200).default(30),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Get user's Strava tokens
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("strava_access_token, strava_refresh_token, strava_token_expires_at")
        .eq("id", userId)
        .single();

      if (userError || !userData?.strava_access_token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Strava not connected. Please connect Strava first.",
        });
      }

      // Check if token needs refresh
      const expiresAt = new Date(userData.strava_token_expires_at).getTime();
      let accessToken = userData.strava_access_token;

      if (Date.now() >= expiresAt - 300000) {
        // Refresh if expiring in 5 minutes
        const refreshed = await refreshStravaToken(userData.strava_refresh_token);
        accessToken = refreshed.access_token;

        // Update tokens in database
        await supabase
          .from("users")
          .update({
            strava_access_token: refreshed.access_token,
            strava_refresh_token: refreshed.refresh_token,
            strava_token_expires_at: new Date(refreshed.expires_at * 1000).toISOString(),
          })
          .eq("id", userId);
      }

      // Fetch activities from Strava
      const stravaActivities = await fetchStravaActivities(
        accessToken,
        input.page,
        input.perPage
      );

      // Transform and store in Supabase
      const transformedActivities = stravaActivities.map((activity: any) => ({
        user_id: userId,
        strava_id: activity.id.toString(),
        title: activity.name,
        sport: mapStravaSportType(activity.sport_type || activity.type),
        date: activity.start_date,
        distance: (activity.distance / 1000).toFixed(2), // meters to km
        duration: Math.round(activity.moving_time), // seconds
        pace: activity.distance > 0
          ? (activity.moving_time / 60) / (activity.distance / 1000) // min/km
          : 0,
        avg_hr: activity.average_heartrate || null,
        max_hr: activity.max_heartrate || null,
        elevation_gain: Math.round(activity.total_elevation_gain || 0), // meters
        calories: Math.round(activity.calories || 0),
        perceived_exertion: activity.perceived_exertion || 5,
      }));

      // Upsert activities (avoid duplicates)
      const { error: upsertError } = await supabase
        .from("activities")
        .upsert(transformedActivities, {
          onConflict: "strava_id",
          ignoreDuplicates: true,
        });

      if (upsertError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to sync activities: ${upsertError.message}`,
        });
      }

      return {
        success: true,
        synced: transformedActivities.length,
        activities: transformedActivities.map((a: any) => ({
          id: a.strava_id,
          title: a.title,
          sport: a.sport,
          distance: parseFloat(a.distance),
          duration: a.duration,
          date: a.date,
        })),
      };
    }),

  /**
   * Get synced activities from database
   */
  getActivities: authedQuery
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(30),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const limit = input?.limit ?? 30;
      const offset = input?.offset ?? 0;

      const { data, error, count } = await supabase
        .from("activities")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch activities: ${error.message}`,
        });
      }

      return {
        activities: data ?? [],
        total: count ?? 0,
      };
    }),

  /**
   * Fetch athlete profile from Strava
   */
  getAthlete: authedQuery.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("strava_access_token, strava_refresh_token")
      .eq("id", userId)
      .single();

    if (userError || !userData?.strava_access_token) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Strava not connected",
      });
    }

    const athlete = await fetchStravaAthlete(userData.strava_access_token);

    return {
      id: athlete.id,
      firstname: athlete.firstname,
      lastname: athlete.lastname,
      profile: athlete.profile,
      city: athlete.city,
      state: athlete.state,
      country: athlete.country,
      sex: athlete.sex,
      weight: athlete.weight,
      measurement_preference: athlete.measurement_preference,
    };
  }),
});

/**
 * Map Strava sport type to our sport types
 */
function mapStravaSportType(stravaType: string): string {
  const mapping: Record<string, string> = {
    Run: "run",
    TrailRun: "trail_run",
    Ride: "ride",
    MountainBikeRide: "ride",
    GravelRide: "ride",
    Swim: "swim",
    Hike: "hike",
    Walk: "hike",
    VirtualRun: "treadmill",
    Treadmill: "treadmill",
  };
  return mapping[stravaType] || "run";
}
