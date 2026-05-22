// ============================================
// useWeather Hook - OpenWeather API Integration
// ============================================
import { trpc } from "@/providers/trpc";

export function useWeather() {
  // Current weather by coordinates
  const useCurrentWeather = (lat: number, lon: number) => {
    return trpc.weather.current.useQuery(
      { lat, lon },
      {
        enabled: lat !== 0 && lon !== 0,
        staleTime: 1000 * 60 * 10, // 10 minutes
      }
    );
  };

  // Current weather by city
  const useCurrentByCity = (city: string) => {
    return trpc.weather.currentByCity.useQuery(
      { city },
      {
        enabled: city.length > 0,
        staleTime: 1000 * 60 * 10,
      }
    );
  };

  // 5-day forecast
  const useForecast = (lat: number, lon: number) => {
    return trpc.weather.forecast.useQuery(
      { lat, lon },
      {
        enabled: lat !== 0 && lon !== 0,
        staleTime: 1000 * 60 * 30, // 30 minutes
      }
    );
  };

  // Weather-adjusted pace
  const useAdjustedPace = (basePace: number, lat: number, lon: number) => {
    return trpc.weather.adjustedPace.useQuery(
      { basePace, lat, lon },
      {
        enabled: basePace > 0 && lat !== 0 && lon !== 0,
        staleTime: 1000 * 60 * 10,
      }
    );
  };

  // Running weather score
  const useRunningScore = (lat: number, lon: number) => {
    return trpc.weather.runningScore.useQuery(
      { lat, lon },
      {
        enabled: lat !== 0 && lon !== 0,
        staleTime: 1000 * 60 * 10,
      }
    );
  };

  return {
    useCurrentWeather,
    useCurrentByCity,
    useForecast,
    useAdjustedPace,
    useRunningScore,
  };
}

/**
 * Default location (can be changed based on user preference)
 */
export const DEFAULT_LOCATION = {
  lat: -6.2088, // Jakarta
  lon: 106.8456,
  city: "Jakarta",
};
