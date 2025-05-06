import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";

// GET /api/candidat/notifications - Récupérer les notifications
export async function GET(req: NextRequest) {
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

    const candidat = await prisma.candidat.findFirst({
      where: { userId: decoded.userId },
    });

    if (!candidat) {
      return NextResponse.json(
        { error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les notifications du candidat
    const notifications = await prisma.notification.findMany({
      where: { candidatId: candidat.id },
      orderBy: { createdAt: "desc" },
      take: 50, // Limiter à 50 notifications
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

// PATCH /api/candidat/notifications - Marquer les notifications comme lues
export async function PATCH(req: NextRequest) {
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

    const candidat = await prisma.candidat.findFirst({
      where: { userId: decoded.userId },
    });

    if (!candidat) {
      return NextResponse.json(
        { error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { notificationIds } = body;

    // Marquer les notifications comme lues
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        candidatId: candidat.id,
      },
      data: { lu: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATIONS_PATCH]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
