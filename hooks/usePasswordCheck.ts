"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";

/**
 * Hook pour vérifier si l'utilisateur doit mettre à jour son mot de passe
 * et le rediriger vers /update-password si nécessaire
 */
export function usePasswordCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkPasswordStatus() {
      // Ne pas vérifier si on est déjà sur la page de mise à jour
      // ou sur les pages publiques (auth, etc.)
      const publicPaths = ["/auth/", "/update-password"];
      const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

      if (isPublicPath || isPending) {
        setIsChecking(false);
        return;
      }

      // Si l'utilisateur n'est pas connecté, ne rien faire
      if (!session?.user?.id) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/check-password-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: session.user.id,
          }),
        });

        if (response.ok) {
          const data = await response.json();

          // Si passwordNeedsUpdate est false, rediriger vers la page de mise à jour
          if (data.passwordNeedsUpdate === false) {
            router.push("/update-password");
            return;
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du mot de passe:", error);
      } finally {
        setIsChecking(false);
      }
    }

    checkPasswordStatus();
  }, [session, pathname, router, isPending]);

  return { isChecking };
}

