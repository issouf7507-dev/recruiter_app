import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ applicationId: string; itemId: string }> }
) {
  try {
    const body = await request.json();
    const { isCompleted, title } = body;

    const { applicationId, itemId } = await params;

    const checklistItem = await prisma.checklistItem.update({
      where: {
        id: itemId,
        applicationId: applicationId,
      },
      data: {
        isCompleted,
        title,
      },
    });

    return NextResponse.json({ success: true, data: checklistItem });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de l'élément de la checklist:",
      error
    );
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour de l'élément" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ applicationId: string; itemId: string }> }
) {
  try {
    const { applicationId, itemId } = await params;

    await prisma.checklistItem.delete({
      where: {
        id: itemId,
        applicationId: applicationId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'élément de la checklist:",
      error
    );
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression de l'élément" },
      { status: 500 }
    );
  }
}
