import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe dans BackupUser
    const backupUser = await prisma.backupUser.findUnique({
      where: { email },
      
    });

    if (!backupUser) {
      return NextResponse.json(
        { exists: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        exists: true,
        backupUser
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la vérification:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

