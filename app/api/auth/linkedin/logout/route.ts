import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log("=== DÉCONNEXION LINKEDIN ===");
    console.log("Utilisateur:", authenticatedUser.userId);

    // Ici, vous devriez supprimer les credentials LinkedIn de votre base de données
    // await removeLinkedInCredentials(authenticatedUser.userId);

    // Pour l'instant, on simule une déconnexion réussie
    // En production, vous devriez :
    // 1. Supprimer l'access token de votre base de données
    // 2. Optionnellement, révoquer le token auprès de LinkedIn
    // 3. Nettoyer les données de session

    return NextResponse.json({
      success: true,
      message: "Déconnexion LinkedIn réussie",
      data: {
        userId: authenticatedUser.userId,
        loggedOut: true,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la déconnexion LinkedIn:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
