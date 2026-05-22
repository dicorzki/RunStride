// ============================================
// Weather Widget Component
// ============================================
import { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, Wind, Thermometer, MapPin } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { DEFAULT_LOCATION } from "@/hooks/useWeather";

export default function WeatherWidget() {
  const weather = useWeather();
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [cityInput, setCityInput] = useState("");

  const { data: current, isLoading } = weather.useCurrentWeather(
    location.lat,
    location.lon
  );
  const { data: score } = weather.useRunningScore(location.lat, location.lon);

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      // Use a geocoding approach - for now use default coordinates
      // In production, you'd want to use a geocoding API
      setLocation((prev) => ({ ...prev, city: cityInput.trim() }));
      setCityInput("");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-100 card-shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-100 card-shadow">
        <p className="text-sm text-gray-500">Weather data unavailable</p>
      </div>
    );
  }

  const scoreColor =
    score?.score && score.score >= 80
      ? "text-green-500"
      : score?.score && score.score >= 60
      ? "text-yellow-500"
      : "text-red-500";

  const scoreBg =
    score?.score && score.score >= 80
      ? "bg-green-50"
      : score?.score && score.score >= 60
      ? "bg-yellow-50"
      : "bg-red-50";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 border border-gray-100 card-shadow"
    >
      {/* Location */}
      <form onSubmit={handleCitySearch} className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          placeholder={current.location || location.city}
          className="text-sm font-medium text-gray-900 bg-transparent flex-1 focus:outline-none"
        />
      </form>

      {/* Main Weather */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-gray-900">
            {current.temperature}°
          </div>
          <div className="text-xs text-gray-500">
            <p className="capitalize">{current.description}</p>
            <p>Feels like {current.feelsLike}°</p>
          </div>
        </div>
        {score && (
          <div className={`px-3 py-1.5 rounded-lg ${scoreBg}`}>
            <p className={`text-xs font-semibold ${scoreColor}`}>
              {score.rating}
            </p>
            <p className="text-[10px] text-gray-500">Run Score: {score.score}</p>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Droplets className="w-3.5 h-3.5 text-blue-400" />
          <span>{current.humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Wind className="w-3.5 h-3.5 text-gray-400" />
          <span>{Math.round(current.windSpeed * 3.6)} km/h</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Thermometer className="w-3.5 h-3.5 text-red-400" />
          <span>{current.temperature}°C</span>
        </div>
      </div>

      {/* Recommendation */}
      {score?.recommendation && (
        <p className="text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-100">
          {score.recommendation}
        </p>
      )}
    </motion.div>
  );
}
