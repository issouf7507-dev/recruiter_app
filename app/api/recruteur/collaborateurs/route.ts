import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { cacheUtils, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const cacheKey = CACHE_KEYS.COLLABORATEURS(authenticatedUser.recruteurId);

    // Essayer de récupérer depuis le cache
    const cachedData = await cacheUtils.get(cacheKey);
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        fromCache: true,
      });
    }

    // Récupérer les collaborateurs avec mise en cache
    const collaborateurs = await prisma.collaborateur.findMany({
      where: {
        recruteurId: authenticatedUser.recruteurId,
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
    await cacheUtils.set(cacheKey, collaborateurs, CACHE_TTL.COLLABORATEURS);

    return NextResponse.json({
      success: true,
      data: collaborateurs,
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
