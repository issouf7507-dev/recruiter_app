import { useUserStore } from "@/store/userStore";

/**
 * Hook personnalisé pour récupérer le recruteurId selon le type d'utilisateur
 * Fonctionne pour les recruteurs et les collaborateurs
 */
export const useRecruteurId = () => {
  const { user } = useUserStore();

  const getRecruteurId = () => {
    if (user?.type === "RECRUTEUR" && user?.recruteur?.id) {
      return user.recruteur.id;
    } else if (
      user?.type === "COLLABORATEUR" &&
      user?.collaborateur?.recruteurId
    ) {
      return user.collaborateur.recruteurId;
    }
    return null;
  };

  return getRecruteurId();
};
