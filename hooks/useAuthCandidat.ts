import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";

interface User {
  candidat: {
    adresse: string | null;
    bio: string | null;
    cv: string | null;
    dateNaissance: string; // ISO date string
    favorite: boolean;
    id: string;
    letterm: string | null;
    nationalite: string;
    nom: string;
    pays: string;
    permisConduire: string;
    prenom: string;
    situationFamiliale: string;
    statut: string | null;
    telephone: string;
    userId: string;
    ville: string | null;
    image: string | null;
  };
  createdAt: string;
  email: string;
  emailVerified: string | null;
  id: string;
  image: string | null;
  name: string;
  type: "CANDIDAT";
  updatedAt: string;
}

export function useAuthCandidat() {
  const { loading, setLoading, setCandidat, candidat } = useUserStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me-cd");
        if (response.ok) {
          const data = await response.json();
          // setCandidat(data.user);
          setCandidat(data.user);
        } else {
          setCandidat(null);
        }
      } catch (error) {
        setCandidat(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [setCandidat, setLoading]);

  return { loading, candidat };
}
