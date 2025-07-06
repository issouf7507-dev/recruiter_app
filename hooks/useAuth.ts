import { useEffect, useCallback } from "react";
import { useUserStore } from "@/store/userStore";

interface User {
  id: string;
  email: string;
  type: string;
  recruteur?: {
    id: string;
    // Ajoutez d'autres champs du recruteur si nécessaire
  };
}

export function useAuth() {
  const { user, loading, setUser, setLoading } = useUserStore();

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading };
}
