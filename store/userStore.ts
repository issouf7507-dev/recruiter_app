import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  type: string;
  name?: string;
  image?: string;
  candidat?: {
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
    competences: string[];
  };
  recruteur?: {
    id: string;
    name: string;
    type: string;
    entreprise?: string;
    logo?: string;
  };
  collaborateur?: {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    role: string;
    recruteurId: string;
    recruteur?: {
      id: string;
      name: string;
      entreprise?: string;
    };
  };
}

interface UserState {
  user: User | null;
  candidat: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setCandidat: (candidat: User | null) => void;
  setLoading: (loading: boolean) => void;

  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      candidat: null,
      loading: true,
      setUser: (user) => set({ user }),
      setCandidat: (candidat) => set({ candidat }),
      setLoading: (loading) => set({ loading }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage", // nom de la clé dans le localStorage
    }
  )
);
