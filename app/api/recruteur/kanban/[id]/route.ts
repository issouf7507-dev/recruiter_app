import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { kanbanEvents } from "@/lib/socket";
// import { CACHE_KEYS, cacheUtils } from "@/lib/redis";

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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const { name, color, jobOfferId } = await req.json();

    const kanbanColumn = await prisma.kanbanColumn.update({
      where: { id },
      data: { name, color, jobOfferId: jobOfferId as string },
    });

    return NextResponse.json(
      {
        sucess: true,
        message: "Column updated successfully",
        data: kanbanColumn,
      },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
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

    // Publier l'événement WebSocket
    await kanbanEvents.columnDeleted(
      offerTemplate.id,
      offerTemplate.jobOfferId.toString()
    );

    // await cacheUtils.del(
    //   CACHE_KEYS.KANBAN_BOARD(offerTemplate.jobOfferId.toString())
    // );

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
