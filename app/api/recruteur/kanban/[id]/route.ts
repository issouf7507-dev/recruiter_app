import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const kanbanColumn = await prisma.kanbanColumn.findMany({ where: {} });

    return NextResponse.json(
      { sucess: true, data: kanbanColumn },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { succes: false, message: "Erreur server" },
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

    const offerTemplate = await prisma.kanbanColumn.delete({
      where: { id: id },
    });

    if (!offerTemplate) {
      return NextResponse.json({
        success: false,
        message: "model non trouvé",
      });
    }

    return NextResponse.json({
      success: true,
      message: "model supprimée avec succès",
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue lors de la suppression du model",
      },
      { status: 500 }
    );
  }
}
