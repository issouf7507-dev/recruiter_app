"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

interface GuestGuardRecruteurProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export default function GuestGuardRecruteur({
  children,
  redirectTo = "/dashboard-recruteurs", // dashboard recruteurs
  fallback,
}: GuestGuardRecruteurProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session) {
      router.push(redirectTo);
    }
  }, [session, isPending, router, redirectTo]);

  // Affichage du fallback personnalisé ou du loading par défaut
  if (isPending) {
    return (
      fallback || (
        <div className="bg-background h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Vérification de l'authentification...
            </p>
          </div>
        </div>
      )
    );
  }

  // Redirection si déjà connecté
  if (session) {
    return null; // Le useEffect va rediriger
  }

  // Utilisateur non connecté, afficher le contenu
  return <>{children}</>;
}
