import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findFirst({
      where: {
        token,
        accepted: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation invalide ou expirée" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      role: invitation.role,
      email: invitation.email,
    });
  } catch (error) {
    console.error("Erreur lors de la validation du token:", error);
    return NextResponse.json(
      { error: "Erreur lors de la validation du token" },
      { status: 500 }
    );
  }
}
