// ============================================
// Strava Connect Component
// ============================================
import { motion } from "framer-motion";
import { Link, Unlink, RefreshCw, Activity } from "lucide-react";
import { useStrava } from "@/hooks/useStrava";
import { useEffect } from "react";

export default function StravaConnect() {
  const strava = useStrava();

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const connected = urlParams.get("strava_connected");

    if (code && connected === "true") {
      strava.connect(code);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (strava.isLoading) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-100 card-shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  if (strava.isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-orange-50 to-white rounded-xl p-4 border border-orange-200 card-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FC4C02] flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Strava Connected</p>
              <p className="text-xs text-gray-500">
                {strava.activitiesTotal} activities synced
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => strava.syncActivities()}
              disabled={strava.isSyncing}
              className="p-2 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
              title="Sync Activities"
            >
              <RefreshCw
                className={`w-4 h-4 text-[#FC4C02] ${strava.isSyncing ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => strava.disconnect()}
              disabled={strava.isDisconnecting}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Disconnect Strava"
            >
              <Unlink className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {strava.syncResult && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-xs text-green-600 mt-2 font-medium"
          >
            Synced {strava.syncResult.synced} activities successfully!
          </motion.p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl p-4 border border-gray-100 card-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Connect Strava</p>
            <p className="text-xs text-gray-500">Sync your activities automatically</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={strava.openStravaAuth}
          disabled={strava.isConnecting}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#FC4C02] text-white rounded-lg text-xs font-semibold hover:bg-[#E04400] transition-colors disabled:opacity-50"
        >
          <Link className="w-3.5 h-3.5" />
          Connect
        </motion.button>
      </div>
    </motion.div>
  );
}
