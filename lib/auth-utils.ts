import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export interface AuthenticatedUser {
  userId: string;
  type: "RECRUTEUR" | "COLLABORATEUR";
  recruteurId: string;
  name: string;
}

/**
 * Vérifie l'authentification et retourne les informations de l'utilisateur
 */
export async function getAuthenticatedUser(
  req: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "RECRUTEUR" && decoded.type !== "COLLABORATEUR") {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        recruteur: true,
        collaborateur: {
          include: {
            recruteur: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    let recruteurId: string;

    if (user.type === "RECRUTEUR" && user.recruteur) {
      recruteurId = user.recruteur.id;
    } else if (user.type === "COLLABORATEUR" && user.collaborateur) {
      if (!user.collaborateur.recruteur) {
        return null;
      }
      recruteurId = user.collaborateur.recruteur.id;
    } else {
      return null;
    }

    return {
      userId: user.id,
      type: user.type as "RECRUTEUR" | "COLLABORATEUR",
      recruteurId,
      name: user.name || "",
    };
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'authentification:",
      error
    );
    return null;
  }
}

/**
 * Vérifie si l'utilisateur a les permissions pour accéder aux données d'un recruteur
 */
export function hasAccessToRecruteurData(
  user: AuthenticatedUser,
  targetRecruteurId: string
): boolean {
  return user.recruteurId === targetRecruteurId;
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        collaborateur: true,
      },
    });

    if (user?.type === "COLLABORATEUR" && user.collaborateur) {
      return user.collaborateur.role;
    }

    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error);
    return null;
  }
}
