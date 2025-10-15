import { UserType } from "@/app/generated/prisma";

/**
 * Détermine la route de redirection basée sur le type d'utilisateur
 */

export function getRedirectPath(userType: UserType | null | undefined): string {
  switch (userType) {
    case UserType.RECRUTEUR:
      return "/dashboard-recruteurs";
    case UserType.CANDIDAT:
      return "/dashboard-candidats";
    case UserType.COLLABORATEUR:
      return "/dashboard-recruteurs"; // Les collaborateurs utilisent le même dashboard que les recruteurs
    default:
      return "/"; // Redirection par défaut si le type n'est pas défini
  }
}

/**
 * Vérifie si l'utilisateur a accès à une route spécifique
 */
export function canAccessRoute(
  userType: UserType | null | undefined,
  pathname: string
): boolean {
  switch (userType) {
    case UserType.RECRUTEUR:
    case UserType.COLLABORATEUR:
      return (
        pathname.startsWith("/dashboard-recruteurs") ||
        pathname.startsWith("/mesoffres")
      );
    case UserType.CANDIDAT:
      return pathname.startsWith("/dashboard-candidats");
    default:
      return false;
  }
}
