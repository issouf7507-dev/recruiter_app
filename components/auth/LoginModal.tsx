"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, User, Building } from "lucide-react";
import Link from "next/link";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  showBothOptions?: boolean;
  userType?: "candidat" | "recruteur";
}

export default function LoginModal({
  isOpen,
  onClose,
  title = "Connexion requise",
  message = "Vous devez être connecté pour accéder à cette fonctionnalité.",
  showBothOptions = true,
  userType,
}: LoginModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showBothOptions ? (
            <>
              <div className="space-y-3">
                <Link href="/candidat/connexion" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <User className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">
                        Se connecter en tant que candidat
                      </div>
                      <div className="text-sm text-gray-500">
                        Postuler aux offres d'emploi
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/recruteur/connexion" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <Building className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">
                        Se connecter en tant que recruteur
                      </div>
                      <div className="text-sm text-gray-500">
                        Publier des offres d'emploi
                      </div>
                    </div>
                  </Button>
                </Link>
              </div>

              <div className="text-center text-sm text-gray-500">
                Pas encore de compte ?{" "}
                <Link
                  href="/candidat/inscription"
                  className="text-primary hover:underline"
                >
                  S'inscrire
                </Link>
              </div>
            </>
          ) : (
            <>
              {userType === "candidat" && (
                <Link href="/candidat/connexion" className="block">
                  <Button className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Se connecter en tant que candidat
                  </Button>
                </Link>
              )}

              {userType === "recruteur" && (
                <Link href="/recruteur/connexion" className="block">
                  <Button className="w-full">
                    <Building className="h-4 w-4 mr-2" />
                    Se connecter en tant que recruteur
                  </Button>
                </Link>
              )}

              <div className="text-center">
                <Button variant="ghost" onClick={onClose}>
                  Annuler
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
