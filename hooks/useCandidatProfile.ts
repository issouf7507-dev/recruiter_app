import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";

interface CandidatProfile {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  dateNaissance?: string;
  nationalite?: string;
  situationFamiliale?: string;
  permisConduire?: string;
  bio?: string;
  cv?: string;
  letterm?: string;
  image?: string;
  email: string;
  competences: string[];
}

interface UpdateProfileData {
  nom?: string;
  prenom?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  dateNaissance?: Date;
  nationalite?: string;
  situationFamiliale?: string;
  permisConduire?: string;
  bio?: string;
  cv?: string;
  letterm?: string;
  image?: string;
  competences?: string[];
}

export function useCandidatProfile() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Query pour récupérer le profil
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery<CandidatProfile>({
    queryKey: ["candidat-profile"],
    queryFn: async () => {
      const response = await fetch("/api/candidat/profile");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement du profil");
      }
      const result = await response.json();
      return result.data;
    },
    enabled: !!session?.user?.id,
  });

  // Mutation pour mettre à jour le profil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      console.log("Données envoyées à l'API:", data);

      const response = await fetch("/api/candidat/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Erreur API:", error);
        throw new Error(
          error.message || error.error || "Erreur lors de la mise à jour"
        );
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider et refetch le profil après mise à jour
      queryClient.invalidateQueries({ queryKey: ["candidat-profile"] });
    },
    onError: (error) => {
      console.error("Erreur lors de la mutation:", error);
    },
  });

  return {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error,
  };
}
