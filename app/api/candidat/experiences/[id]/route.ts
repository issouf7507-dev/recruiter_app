import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";

// DELETE /api/candidat/experiences/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("candidat")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "CANDIDAT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const experience = await prisma.experience.findUnique({
      where: {
        id: id,
      },
    });

    if (!experience) {
      return NextResponse.json(
        { error: "Expérience non trouvée" },
        { status: 404 }
      );
    }

    // if (experience.candidatId !== session.user.id) {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    // }

    await prisma.experience.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'expérience:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'expérience" },
      { status: 500 }
    );
  }
}
