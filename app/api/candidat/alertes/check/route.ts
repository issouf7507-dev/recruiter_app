import { NextRequest, NextResponse } from "next/server";
import { AlerteService } from "@/app/services/alerte.service";
import { verify } from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("candidat")?.value;
    if (!token) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "CANDIDAT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

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
