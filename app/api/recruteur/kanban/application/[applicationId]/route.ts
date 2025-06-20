import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const body = await req.json();
    const { note } = body;
    const idapp = (await params).applicationId;

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      type: string;
    };

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        recruteur: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const application = await prisma.application.update({
      where: {
        id: idapp,
      },

      data: {
        notes: {
          create: {
            content: note,
            authorId: user.id,
            authorType: user.type,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Note ajoutée avec succès",
        application,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des informations" },
      { status: 500 }
    );
  }
}
