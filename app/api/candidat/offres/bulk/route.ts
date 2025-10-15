import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        {
          success: false,
          message: "Le corps de la requête doit être un tableau d'offres.",
        },
        { status: 400 }
      );
    }

    const jobOffers = [];

    for (const offer of body) {
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
      } = offer;

      const recruteur = await prisma.recruteur.findFirst({
        where: { id: recruteurId },
      });

      if (!recruteur) {
        return NextResponse.json(
          {
            success: false,
            message: `Recruteur avec l'ID ${recruteurId} introuvable.`,
          },
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
          jobOfferCompetences: {
            create: skills.map((skill: any) => ({
              competence: skill,
            })),
          },
        },
      });

      const defaultColumns = [
        { name: "Nouvelles", color: "#FACC15", order: 1, isDefault: true },
        { name: "En cours", color: "#60A5FA", order: 2, isDefault: true },
        { name: "Finalisées", color: "#34D399", order: 3, isDefault: true },
      ];

      await Promise.all(
        defaultColumns.map((col) =>
          prisma.kanbanColumn.create({
            data: {
              ...col,
              jobOfferId: jobOffer.id,
            },
          })
        )
      );

      jobOffers.push(jobOffer);
    }

    return NextResponse.json(
      { success: true, data: jobOffers },
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
