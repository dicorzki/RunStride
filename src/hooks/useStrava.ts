// ============================================
// useStrava Hook - Strava Integration
// ============================================
import { useCallback } from "react";
import { trpc } from "@/providers/trpc";

export function useStrava() {
  const utils = trpc.useUtils();

  const { data: status, isLoading: statusLoading } = trpc.strava.status.useQuery(
    undefined,
    {
      retry: false,
      staleTime: 1000 * 60 * 5,
    }
  );

  const { data: athlete } = trpc.strava.getAthlete.useQuery(undefined, {
    enabled: status?.connected ?? false,
    retry: false,
  });

  const { data: activities, isLoading: activitiesLoading } =
    trpc.strava.getActivities.useQuery(
      { limit: 30, offset: 0 },
      {
        enabled: status?.connected ?? false,
        retry: false,
      }
    );

  const connectMutation = trpc.strava.connect.useMutation({
    onSuccess: () => {
      utils.strava.status.invalidate();
    },
  });

  const disconnectMutation = trpc.strava.disconnect.useMutation({
    onSuccess: () => {
      utils.strava.status.invalidate();
      utils.strava.getActivities.invalidate();
    },
  });

  const syncMutation = trpc.strava.syncActivities.useMutation({
    onSuccess: () => {
      utils.strava.getActivities.invalidate();
    },
  });

  const getAuthUrl = trpc.strava.getAuthUrl.useQuery();

  const connect = useCallback(
    (code: string) => {
      connectMutation.mutate({ code });
    },
    [connectMutation]
  );

  const disconnect = useCallback(() => {
    disconnectMutation.mutate();
  }, [disconnectMutation]);

  const syncActivities = useCallback(
    (page?: number, perPage?: number) => {
      syncMutation.mutate({ page: page ?? 1, perPage: perPage ?? 30 });
    },
    [syncMutation]
  );

  const openStravaAuth = useCallback(() => {
    if (getAuthUrl.data?.url) {
      window.location.href = getAuthUrl.data.url;
    }
  }, [getAuthUrl.data]);

  return {
    isConnected: status?.connected ?? false,
    isLoading: statusLoading,
    athleteId: status?.athleteId ?? null,
    athlete,
    activities: activities?.activities ?? [],
    activitiesTotal: activities?.total ?? 0,
    activitiesLoading,
    connect,
    disconnect,
    syncActivities,
    openStravaAuth,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    isSyncing: syncMutation.isPending,
    syncResult: syncMutation.data,
  };
}
