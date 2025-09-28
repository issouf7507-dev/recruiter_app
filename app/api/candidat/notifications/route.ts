import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { auth } from "@/lib/auth";

// GET - Récupérer les notifications d'un candidat
export async function GET(request: NextRequest) {
  try {
    // const token = request.cookies.get("candidat")?.value;

    // if (!token) {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    // }

    // const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
    //   userId: string;
    //   type: string;
    // };

    // if (decoded.type !== "CANDIDAT") {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    // }

    // // Récupérer le candidat
    // const candidat = await prisma.candidat.findUnique({
    //   where: { userId: decoded.userId },
    // });

    // if (!candidat) {
    //   return NextResponse.json(
    //     { error: "Candidat non trouvé" },
    //     { status: 404 }
    //   );
    // }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const candidat = await prisma.candidat.findUnique({
      where: { userId: session?.user.id },
    });
    // Récupérer les notifications du candidat
    const notifications = await prisma.notification.findMany({
      where: {
        candidatId: candidat?.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limiter à 50 notifications
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST - Marquer une notification comme lue
export async function POST(request: NextRequest) {
  try {
    // const token = request.cookies.get("candidat")?.value;

    // if (!token) {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    // }

    // const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
    //   userId: string;
    //   type: string;
    // };

    // if (decoded.type !== "CANDIDAT") {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    // }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const candidat = await prisma.candidat.findUnique({
      where: { userId: session?.user.id },
    });

    const { notificationId } = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: "notificationId est requis" },
        { status: 400 }
      );
    }

    // Récupérer le candidat
    // const candidat = await prisma.candidat.findUnique({
    //   where: { userId: decoded.userId },
    // });

    if (!candidat) {
      return NextResponse.json(
        { error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    // Marquer la notification comme lue
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        candidatId: candidat.id,
      },
      data: {
        lu: true,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la notification:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
