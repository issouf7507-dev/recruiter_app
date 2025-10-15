"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getRedirectPath } from "@/lib/auth-redirect";
import { UserType } from "@/app/generated/prisma";

export function useAutoRedirect() {
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

  return { user, loading };
}
