import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const id = (await params).id;
    // const
    const jobOffer = await prisma.jobOffer.findMany({
      where: {
        recruteurId: id.toString(),
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        applications: {
          include: {
            candidat: true,
          },
        },
        kanbanColumns: true,
      },
    });

    return NextResponse.json(
      { message: true, data: jobOffer },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    NextResponse.json(
      { success: false, message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    // Supprimer d'abord les colonnes du kanban associées
    await prisma.kanbanColumn.deleteMany({
      where: {
        jobOfferId: Number(id),
      },
    });

    // Supprimer l'offre
    const jobOffer = await prisma.jobOffer.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json(
      { success: true, data: jobOffer },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue lors de la suppression",
      },
      { status: 500 }
    );
  }
}
