import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
// import { cacheUtils, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session.user.id },
    });
    const collaborateur = await prisma.collaborateur.findUnique({
      where: { userId: session.user.id },
      include: {
        recruteur: true,
      },
    });
    if (!recruteur && !collaborateur) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // const cacheKey = CACHE_KEYS.COLLABORATEURS(authenticatedUser.recruteurId);

    // Essayer de récupérer depuis le cache
    // const cachedData = await cacheUtils.get(cacheKey);
    // if (cachedData) {
    //   return NextResponse.json({
    //     success: true,
    //     data: cachedData,
    //     fromCache: true,
    //   });
    // }

    // Récupérer les collaborateurs avec mise en cache
    const collaborateurs = await prisma.collaborateur.findMany({
      where: {
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Mettre en cache
    // await cacheUtils.set(cacheKey, collaborateurs, CACHE_TTL.COLLABORATEURS);

    return NextResponse.json({
      success: true,
      collaborateurs: collaborateurs,
      fromCache: false,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des collaborateurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des collaborateurs" },
      { status: 500 }
    );
  }
}
