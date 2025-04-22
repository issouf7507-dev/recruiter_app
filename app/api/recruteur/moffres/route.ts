import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, content, recruteurId } = body;

    // First find the Recruteur record associated with the user
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

    const mynewdata = await prisma.offerTemplate.create({
      data: {
        name,
        description,
        content,
        recruteurId: recruteur.id, // Use the recruteur's id instead of the user's id
      },
    });

    if (!mynewdata) {
      return NextResponse.json(
        {
          success: false,
          message: "Une erreur c'est produite lors de la création",
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

export async function GET(req: Request) {
  try {
    const mydata = await prisma.offerTemplate.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ message: true, data: mydata }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
