import prisma from "@/lib/prisma";

import { NextRequest, NextResponse } from "next/server";

import { withAuthRecruteurOrCollaborateurNoId } from "@/lib/withAuthRecruteurOrCollaborateur";

const DISABLE_CACHE_LOCAL = true; // Force la désactivation

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
      etat,
      duedate,
      education,
      // template,
      recruteurId,
    } = body;

    const recruteur = await prisma.recruteur.findFirst({
      where: {
        userId: recruteurId,
      },
    });

    const collaborateur = await prisma.collaborateur.findFirst({
      where: {
        userId: recruteurId,
      },
      include: {
        recruteur: true,
      },
    });

    if (!recruteur && !collaborateur) {
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
        etat,
        duedate: new Date(duedate),
        // education,
        // templateId: template,
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
        jobOfferCompetences: {
          create: skills.map((skill: any) => ({
            competence: skill,
          })),
        },
      },
    });

    const defaultColumns = [
      { name: "Nouvelles", color: "bg-blue-300/30", order: 1, isDefault: true },
      {
        name: "En cours",
        color: "bg-yellow-300/30",
        order: 2,
        isDefault: true,
      },
      {
        name: "Finalisées",
        color: "bg-green-300/30",
        order: 3,
        isDefault: true,
      },
      {
        name: "Refusées",
        color: "bg-red-300/30",
        order: 4,
        isDefault: true,
      },
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
    console.error("Erreur lors de la création de l'offre:", err);
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    return withAuthRecruteurOrCollaborateurNoId(
      req,
      // resolvedParams,
      async ({ session, recruteur, isCollaborateur, collaborateur }) => {
        const offres = await prisma.jobOffer.findMany({
          where: {
            etat: "active",
          },
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            description: true,
            type: true,
            experience: true,
            salaryMin: true,
            salaryMax: true,
            salaryCurrency: true,
            salaryPeriod: true,
            skills: true,
            requirements: true,
            responsibilities: true,
            benefits: true,
            duedate: true,
            jobOfferCompetences: {
              select: {
                competence: true,
              },
            },
            createdAt: true,
            updatedAt: true,
            etat: true,
            _count: {
              select: {
                applications: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return NextResponse.json(
          {
            success: true,
            data: offres,
          },
          { status: 200 }
        );
      }
    );
  } catch (err) {
    console.error("Erreur lors de la récupération des offres:", err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des offres" },
      { status: 500 }
    );
  }
}
