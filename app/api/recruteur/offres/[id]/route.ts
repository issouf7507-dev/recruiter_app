import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      company,
      location,
      type,
      experience,

      salaryMin,
      salaryMax,
      salaryCurrency,
      salaryPeriod,
      skills,
      requirements,
      responsibilities,
      benefits,
      template,
      recruteurId,
    } = body;
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

    const jobOffer = await prisma.jobOffer.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        description,
        company,
        location,
        type,
        experience,
        salaryMin: parseFloat(salaryMin),
        salaryMax: parseFloat(salaryMax),
        salaryCurrency,
        salaryPeriod,
        skills,
        requirements,
        responsibilities,
        benefits,

        recruteurId: recruteur.id,
      },
    });

    return NextResponse.json(
      { success: true, data: jobOffer },
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const id = (await params).id;
    // const
    const jobOffer = await prisma.jobOffer.findMany({
      where: {
        id: Number(id),
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        kanbanColumns: true,
        applications: {
          include: {
            candidat: true,
            notes: true,
            checklist: true,
            files: true,
            collaborateurs: {
              include: {
                collaborateur: true,
              },
            },
          },
        },
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
