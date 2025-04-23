import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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

    const jobOffer = await prisma.jobOffer.create({
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
        skills: "",
        requirements,
        responsibilities,
        benefits,
        templateId: template,
        recruteurId: recruteur.id,
        competences: skills,
      },
    });

    const defaultColumns = [
      { name: "Nouvelles", color: "#FACC15", order: 1, isDefault: true },
      { name: "En cours", color: "#60A5FA", order: 2, isDefault: true },
      { name: "Finalisées", color: "#34D399", order: 3, isDefault: true },
    ];

    await Promise.all(
      defaultColumns.map((col, id) =>
        prisma.kanbanColumn.create({
          data: {
            ...col,
            jobOfferId: jobOffer.id,
          },
        })
      )
    );

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

export async function GET(req: Request) {
  try {
    const jobOffer = await prisma.jobOffer.findMany({
      orderBy: {
        createdAt: "asc",
      },
      include: {
        applications: {
          include: {
            candidat: true,
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
