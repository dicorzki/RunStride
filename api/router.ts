import { authRouter } from "./auth-router";
import { stravaRouter } from "./strava-router";
import { aiRouter } from "./ai-router";
import { weatherRouter } from "./weather-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  strava: stravaRouter,
  ai: aiRouter,
  weather: weatherRouter,
});

export type AppRouter = typeof appRouter;
