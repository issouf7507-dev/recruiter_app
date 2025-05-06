import { NextResponse } from "next/server";
import { AlerteService } from "@/app/services/alerte.service";

export async function GET() {
  try {
    // Vérifier si la requête vient d'un service de cron légitime
    // TODO: Ajouter une authentification appropriée
    const matches = await AlerteService.checkNouvellesOffres();

    return NextResponse.json({
      success: true,
      message: "Vérification des alertes terminée",
      matches: matches.length,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification des alertes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la vérification des alertes",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
