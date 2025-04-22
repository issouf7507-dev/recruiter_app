import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { name, description, content, recruteurId } = body;
    const id = (await params).id;

    const recruteur = await prisma.recruteur.findFirst({
      where: {
        userId: recruteurId,
      },
    });

    if (!recruteur) {
      return NextResponse.json(
        { success: false, message: "Ce recruteur n'existe pas" },
        { status: 400 }
      );
    }

    const mynewdata = await prisma.offerTemplate.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        description,
        content,
        recruteurId: recruteur.id,
      },
    });

    if (!mynewdata) {
      return NextResponse.json(
        {
          success: false,
          message: "Une erreur c'est produite lors de le Request",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: mynewdata },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
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

    const offerTemplate = await prisma.offerTemplate.delete({
      where: { id: Number(id) },
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
