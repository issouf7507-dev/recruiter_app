import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const body = await req.json();
    const id = (await params).applicationId;
    const { title, description } = body;

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

    const checklistItem = await prisma.checklistItem.create({
      data: {
        title,
        description,
        isCompleted: false,
        applicationId: id,
        createdById: user.id,
        createdByType: user.type,
      },
    });

    return NextResponse.json({ success: true, data: checklistItem });
  } catch (error) {
    console.error(
      "Erreur lors de la création de l'élément de la checklist:",
      error
    );
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de l'élément" },
      { status: 500 }
    );
  }
}
