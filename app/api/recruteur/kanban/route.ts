import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// import { cacheUtils, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";
import { kanbanEvents } from "@/lib/socket";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, color, order, jobOfferId } = body;

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session?.user.id },
    });
    const collaborateur = await prisma.collaborateur.findUnique({
      where: { userId: session?.user.id },
      include: {
        recruteur: true,
      },
    });
    if (!recruteur && !collaborateur) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const kanbanColumn = await prisma.kanbanColumn.create({
      data: {
        name,
        color,
        order,
        jobOfferId: Number(jobOfferId),
      },
    });

    // Publier l'événement WebSocket
    await kanbanEvents.columnCreated(kanbanColumn, jobOfferId);

    // Invalider le cache
    // await cacheUtils.del(CACHE_KEYS.KANBAN_BOARD(jobOfferId));

    return NextResponse.json(
      { sucess: true, data: kanbanColumn },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'ajout de la colonne:", error);
    return NextResponse.json(
      { succes: false, message: "Erreur server" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const kanbanColumn = await prisma.kanbanColumn.findMany();

    return NextResponse.json(
      { sucess: true, data: kanbanColumn },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des colonnes:", error);
    return NextResponse.json(
      { succes: false, message: "Erreur server" },
      { status: 500 }
    );
  }
}
