// ============================================
// Weather Router - OpenWeather API Integration
// ============================================
import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { env } from "./lib/env";
import { TRPCError } from "@trpc/server";

const OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5";
const OPENWEATHER_GEO = "https://api.openweathermap.org/geo/1.0";

/**
 * Fetch current weather data
 */
async function fetchCurrentWeather(lat: number, lon: number): Promise<Record<string, any>> {
  const response = await fetch(
    `${OPENWEATHER_BASE}/weather?lat=${lat}&lon=${lon}&appid=${env.openweatherApiKey}&units=metric`
  );

  if (!response.ok) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Weather API error: ${response.statusText}`,
    });
  }

  return response.json() as Promise<Record<string, any>>;
}

/**
 * Fetch 5-day forecast
 */
async function fetchForecast(lat: number, lon: number): Promise<Record<string, any>> {
  const response = await fetch(
    `${OPENWEATHER_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${env.openweatherApiKey}&units=metric`
  );

  if (!response.ok) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Forecast API error: ${response.statusText}`,
    });
  }

  return response.json() as Promise<Record<string, any>>;
}

/**
 * Geocode city name to coordinates
 */
async function geocodeCity(city: string): Promise<{ lat: number; lon: number; name: string }> {
  const response = await fetch(
    `${OPENWEATHER_GEO}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${env.openweatherApiKey}`
  );

  if (!response.ok) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Geocoding error: ${response.statusText}`,
    });
  }

  const data = await response.json() as Array<{ lat: number; lon: number; name: string }>;
  if (!data || data.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `City not found: ${city}`,
    });
  }

  return {
    lat: data[0].lat,
    lon: data[0].lon,
    name: data[0].name,
  };
}

/**
 * Calculate weather-adjusted pace
 * Adjusts target pace based on temperature, humidity, and wind
 */
function calculateAdjustedPace(
  basePace: number, // min/km
  temperature: number, // celsius
  humidity: number, // percentage
  windSpeed: number // m/s
): {
  adjustedPace: number;
  adjustment: number;
  reason: string;
  recommendation: string;
} {
  let adjustment = 0;
  const reasons: string[] = [];

  // Temperature adjustment
  if (temperature > 25) {
    adjustment += 0.15; // ~9 sec/km slower per degree above 25
    reasons.push(`Hot (${temperature}C)`);
  } else if (temperature > 20) {
    adjustment += 0.05;
    reasons.push(`Warm (${temperature}C)`);
  } else if (temperature < 5) {
    adjustment += 0.05; // Cold muscles need more time
    reasons.push(`Cold (${temperature}C)`);
  } else if (temperature < -5) {
    adjustment += 0.1;
    reasons.push(`Very cold (${temperature}C)`);
  }

  // Humidity adjustment
  if (humidity > 80) {
    adjustment += 0.1; // Harder to cool body
    reasons.push(`High humidity (${humidity}%)`);
  } else if (humidity > 60 && temperature > 20) {
    adjustment += 0.05;
    reasons.push(`Moderate humidity (${humidity}%)`);
  }

  // Wind adjustment
  if (windSpeed > 10) {
    adjustment += 0.1; // Strong headwind
    reasons.push(`Strong wind (${Math.round(windSpeed * 3.6)}km/h)`);
  } else if (windSpeed > 5) {
    adjustment += 0.03;
    reasons.push(`Moderate wind (${Math.round(windSpeed * 3.6)}km/h)`);
  }

  const adjustedPace = Math.round((basePace + adjustment) * 100) / 100;

  let recommendation = "Conditions are good for your target pace.";
  if (adjustment >= 0.2) {
    recommendation = "Consider reducing intensity or moving workout indoors. Heat stress risk is elevated.";
  } else if (adjustment >= 0.1) {
    recommendation = "Slow down your easy runs and reduce interval intensity by 5-10%. Stay well hydrated.";
  } else if (adjustment >= 0.05) {
    recommendation = "Slight adjustment needed. Listen to your body and adjust effort accordingly.";
  } else if (adjustment <= -0.05) {
    recommendation = "Great conditions! You might be able to push slightly harder today.";
  }

  return {
    adjustedPace,
    adjustment: Math.round(adjustment * 100) / 100,
    reason: reasons.join(", ") || "Ideal conditions",
    recommendation,
  };
}

export const weatherRouter = createRouter({
  /**
   * Get current weather by coordinates
   */
  current: publicQuery
    .input(
      z.object({
        lat: z.number(),
        lon: z.number(),
      })
    )
    .query(async ({ input }) => {
      const weather = await fetchCurrentWeather(input.lat, input.lon);

      return {
        location: weather.name,
        temperature: Math.round(weather.main.temp),
        feelsLike: Math.round(weather.main.feels_like),
        humidity: weather.main.humidity,
        windSpeed: weather.wind.speed, // m/s
        windDeg: weather.wind.deg,
        description: weather.weather[0]?.description || "Unknown",
        icon: weather.weather[0]?.icon || "",
        visibility: weather.visibility || 10000,
        clouds: weather.clouds?.all || 0,
        sunrise: weather.sys?.sunrise,
        sunset: weather.sys?.sunset,
      };
    }),

  /**
   * Get current weather by city name
   */
  currentByCity: publicQuery
    .input(z.object({ city: z.string() }))
    .query(async ({ input }) => {
      const coords = await geocodeCity(input.city);
      const weather = await fetchCurrentWeather(coords.lat, coords.lon);

      return {
        location: weather.name,
        temperature: Math.round(weather.main.temp),
        feelsLike: Math.round(weather.main.feels_like),
        humidity: weather.main.humidity,
        windSpeed: weather.wind.speed,
        windDeg: weather.wind.deg,
        description: weather.weather[0]?.description || "Unknown",
        icon: weather.weather[0]?.icon || "",
        visibility: weather.visibility || 10000,
        clouds: weather.clouds?.all || 0,
        sunrise: weather.sys?.sunrise,
        sunset: weather.sys?.sunset,
      };
    }),

  /**
   * Get 5-day forecast
   */
  forecast: publicQuery
    .input(
      z.object({
        lat: z.number(),
        lon: z.number(),
      })
    )
    .query(async ({ input }) => {
      type ForecastItem = {
        dt_txt: string;
        main: { temp: number; humidity: number };
        wind: { speed: number };
        weather: Array<{ description: string; icon: string }>;
      };
      type ForecastResponse = {
        city: { name: string };
        list: ForecastItem[];
      };

      const forecast = await fetchForecast(input.lat, input.lon) as ForecastResponse;

      // Group by day and aggregate
      const dailyMap = new Map<string, ForecastItem[]>();

      forecast.list.forEach((item: ForecastItem) => {
        const date = item.dt_txt.split(" ")[0];
        if (!dailyMap.has(date)) {
          dailyMap.set(date, []);
        }
        dailyMap.get(date)!.push(item);
      });

      const daily = Array.from(dailyMap.entries()).map(([date, items]) => {
        const temps = items.map((i) => i.main.temp);
        const humidities = items.map((i) => i.main.humidity);
        const windSpeeds = items.map((i) => i.wind.speed);

        // Get most common weather description
        const descriptions = items.map((i) => i.weather[0]?.description);
        const description = descriptions[Math.floor(descriptions.length / 2)];
        const icon = items[Math.floor(items.length / 2)]?.weather[0]?.icon || "";

        return {
          date,
          tempMin: Math.round(Math.min(...temps)),
          tempMax: Math.round(Math.max(...temps)),
          tempAvg: Math.round(temps.reduce((a: number, b: number) => a + b, 0) / temps.length),
          humidity: Math.round(humidities.reduce((a: number, b: number) => a + b, 0) / humidities.length),
          windSpeed: Math.round((windSpeeds.reduce((a: number, b: number) => a + b, 0) / windSpeeds.length) * 10) / 10,
          description,
          icon,
          periods: items.map((i: ForecastItem) => ({
            time: i.dt_txt.split(" ")[1],
            temp: Math.round(i.main.temp),
            description: i.weather[0]?.description,
            icon: i.weather[0]?.icon,
          })),
        };
      });

      return {
        location: forecast.city.name,
        daily: daily.slice(0, 5), // Next 5 days
      };
    }),

  /**
   * Calculate weather-adjusted pace for a run
   */
  adjustedPace: publicQuery
    .input(
      z.object({
        basePace: z.number(), // min/km
        lat: z.number(),
        lon: z.number(),
      })
    )
    .query(async ({ input }) => {
      const weather = await fetchCurrentWeather(input.lat, input.lon);

      const result = calculateAdjustedPace(
        input.basePace,
        weather.main.temp,
        weather.main.humidity,
        weather.wind.speed
      );

      return {
        ...result,
        currentConditions: {
          temperature: Math.round(weather.main.temp),
          feelsLike: Math.round(weather.main.feels_like),
          humidity: weather.main.humidity,
          windSpeed: weather.wind.speed,
          description: weather.weather[0]?.description || "Unknown",
          location: weather.name,
        },
      };
    }),

  /**
   * Get running weather score (0-100)
   * Higher is better for running
   */
  runningScore: publicQuery
    .input(
      z.object({
        lat: z.number(),
        lon: z.number(),
      })
    )
    .query(async ({ input }) => {
      const weather = await fetchCurrentWeather(input.lat, input.lon);

      const temp = weather.main.temp;
      const humidity = weather.main.humidity;
      const windSpeed = weather.wind.speed;

      // Temperature score (ideal: 10-18C)
      let tempScore = 100;
      if (temp >= 10 && temp <= 18) tempScore = 100;
      else if (temp >= 5 && temp < 10) tempScore = 85;
      else if (temp > 18 && temp <= 22) tempScore = 85;
      else if (temp >= 0 && temp < 5) tempScore = 65;
      else if (temp > 22 && temp <= 27) tempScore = 60;
      else if (temp > 27 && temp <= 32) tempScore = 35;
      else tempScore = 20;

      // Humidity score (ideal: 30-60%)
      let humidityScore = 100;
      if (humidity >= 30 && humidity <= 60) humidityScore = 100;
      else if (humidity > 60 && humidity <= 75) humidityScore = 80;
      else if (humidity > 75 && humidity <= 85) humidityScore = 55;
      else humidityScore = 35;

      // Wind score (ideal: 0-10 km/h)
      const windKmh = windSpeed * 3.6;
      let windScore = 100;
      if (windKmh <= 10) windScore = 100;
      else if (windKmh <= 20) windScore = 80;
      else if (windKmh <= 30) windScore = 55;
      else windScore = 30;

      // Combined score (weighted)
      const score = Math.round(tempScore * 0.45 + humidityScore * 0.35 + windScore * 0.2);

      let rating = "Excellent";
      if (score >= 90) rating = "Excellent";
      else if (score >= 75) rating = "Good";
      else if (score >= 60) rating = "Fair";
      else if (score >= 40) rating = "Poor";
      else rating = "Challenging";

      return {
        score,
        rating,
        breakdown: {
          temperature: { value: Math.round(temp), score: tempScore },
          humidity: { value: humidity, score: humidityScore },
          wind: { value: Math.round(windKmh), score: windScore },
        },
        recommendation:
          score >= 80
            ? "Great conditions for running!"
            : score >= 60
            ? "Acceptable conditions. Adjust pace if needed."
            : "Consider indoor training or adjust expectations significantly.",
      };
    }),
});
