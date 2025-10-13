"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getRedirectPath } from "@/lib/auth-redirect";
import { UserType } from "@/app/generated/prisma";

export function AutoRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Attendre que l'authentification soit chargée

    if (user && user.type) {
      // Rediriger vers le dashboard approprié
      const redirectPath = getRedirectPath(user.type as UserType);
      router.push(redirectPath);
    }
  }, [user, loading, router]);

  // Afficher un loader pendant la redirection
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
}
