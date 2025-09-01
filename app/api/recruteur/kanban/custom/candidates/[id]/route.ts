import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = await getAuthenticatedUser(req);
    const { id } = await params;
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const candidates = await prisma.candidatCustom.findMany({
      where: {
        userId: authenticatedUser.userId,
        applicationId: id,
      },
    });

    return NextResponse.json({
      success: true,
      candidates: candidates,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la récupération des candidats",
        error: error,
      },
      { status: 500 }
    );
  }
}
