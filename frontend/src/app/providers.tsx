import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/store";
import "@/i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setAuth, setInitialized, setAccessToken, clearAuth } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const refreshData = await authApi.refreshToken();
        if (refreshData?.access_token && mounted) {
          setAccessToken(refreshData.access_token);
          const user = await authApi.getMe();
          if (mounted) {
            setAuth(user, refreshData.access_token);
          }
        }
      } catch {
        if (mounted) {
          clearAuth();
        }
      } finally {
        if (mounted) {
          setInitialized(true);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [setAuth, setInitialized, setAccessToken, clearAuth]);

  return <>{children}</>;
};

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>{children}</AuthInitializer>
    </QueryClientProvider>
  );
};
