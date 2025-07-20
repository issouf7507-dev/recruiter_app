import { useEffect, useRef, useState } from "react";
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

// Singleton pour éviter les appels multiples
let authPromise: Promise<any> | null = null;
let authInitialized = false;

export function useAuth() {
  const { user, loading, setUser, setLoading } = useUserStore();
  const [isInitialized, setIsInitialized] = useState(authInitialized);

  useEffect(() => {
    if (authInitialized) {
      setIsInitialized(true);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/auth/me");

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          console.warn(
            "Auth check failed:",
            response.status,
            response.statusText
          );
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
        authInitialized = true;
        setIsInitialized(true);
      }
    };

    // Utiliser un singleton pour éviter les appels multiples
    if (!authPromise) {
      authPromise = fetchUser();
    } else {
      authPromise.then(() => {
        setIsInitialized(true);
      });
    }
  }, []); // Exécution unique

  return { user, loading: loading || !isInitialized };
}
