import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  kimiAuthUrl: required("KIMI_AUTH_URL"),
  kimiOpenUrl: required("KIMI_OPEN_URL"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  // Strava API
  stravaClientId: required("STRAVA_CLIENT_ID"),
  stravaClientSecret: required("STRAVA_CLIENT_SECRET"),
  stravaRedirectUri: process.env.STRAVA_REDIRECT_URI ?? "http://localhost:3000/api/strava/callback",
  // Gemini AI API
  geminiApiKey: required("GEMINI_API_KEY"),
  // OpenWeather API
  openweatherApiKey: required("OPENWEATHER_API_KEY"),
  // Supabase
  supabaseUrl: required("SUPABASE_URL"),
  supabaseServiceRole: required("SUPABASE_SERVICE_ROLE"),
  supabaseAnonKey: required("SUPABASE_ANON_KEY"),
};
