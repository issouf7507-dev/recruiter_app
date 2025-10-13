import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    // Incrémenter le compteur de vues
    const updatedOffer = await prisma.jobOffer.update({
      where: {
        id: id as string,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(
      { success: true, data: updatedOffer },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
