"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getRedirectPath, canAccessRoute } from "@/lib/auth-redirect";
import { UserType } from "@/app/generated/prisma";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredUserType?: UserType;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requiredUserType,
  redirectTo,
}: AuthGuardProps) {
  //   const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Attendre que l'authentification soit chargée

    if (!user) {
      // Utilisateur non connecté, rediriger vers la page de connexion
      router.push("/auth/connexion");
      return;
    }

    // Si un type d'utilisateur spécifique est requis
    if (requiredUserType && user.type !== requiredUserType) {
      // Rediriger vers le dashboard approprié pour ce type d'utilisateur
      const redirectPath = getRedirectPath(user.type as UserType);
      router.push(redirectPath);
      return;
    }

    // Si aucune redirection spécifique n'est demandée, vérifier l'accès à la route actuelle
    if (!redirectTo) {
      const currentPath = window.location.pathname;
      if (!canAccessRoute(user.type as UserType, currentPath)) {
        const redirectPath = getRedirectPath(user.type as UserType);
        router.push(redirectPath);
        return;
      }
    }
  }, [user, loading, router, requiredUserType, redirectTo]);

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, ne rien afficher (redirection en cours)
  if (!user) {
    return null;
  }

  // Vérifier l'accès si un type spécifique est requis
  if (requiredUserType && user.type !== requiredUserType) {
    return null; // Redirection en cours
  }

  return <>{children}</>;
}
