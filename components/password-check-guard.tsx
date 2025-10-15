"use client";

import { usePasswordCheck } from "@/hooks/usePasswordCheck";
import { ReactNode } from "react";

interface PasswordCheckGuardProps {
  children: ReactNode;
}

/**
 * Composant Guard qui vérifie automatiquement si l'utilisateur
 * doit mettre à jour son mot de passe et le redirige si nécessaire
 */
export function PasswordCheckGuard({ children }: PasswordCheckGuardProps) {
  const { isChecking } = usePasswordCheck();

  // Afficher un loader pendant la vérification si nécessaire
  // if (isChecking) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
  //         <p className="text-sm text-muted-foreground">Vérification...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return <>{children}</>;
}

