import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Récupérer tous les CVs du candidat
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer le candidat
    const candidat = await prisma.candidat.findUnique({
      where: { userId: session.user.id },
    });

    if (!candidat) {
      return NextResponse.json(
        { error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer tous les CVs du candidat
    const cvs = await prisma.cV.findMany({
      where: { candidatId: candidat.id },
      include: {
        template: true,
        personalInfo: true,
        experiences: {
          orderBy: { order: "asc" },
        },
        educations: {
          orderBy: { order: "asc" },
        },
        skills: {
          orderBy: { order: "asc" },
        },
        languages: {
          orderBy: { order: "asc" },
        },
        interests: {
          orderBy: { order: "asc" },
        },
        customSections: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(cvs);
  } catch (error) {
    console.error("Erreur lors de la récupération des CVs:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau CV
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer le candidat
    const candidat = await prisma.candidat.findUnique({
      where: { userId: session.user.id },
    });

    if (!candidat) {
      return NextResponse.json(
        { error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      title,
      templateId,
      personalInfo,
      experiences = [],
      educations = [],
      skills = [],
      languages = [],
      interests = [],
      customSections = [],
    } = body;

    // Vérifier que le template existe
    const template = await prisma.cVTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template non trouvé" },
        { status: 404 }
      );
    }

    // Nettoyer les données avant création
    const cleanPersonalInfo = personalInfo
      ? {
          ...personalInfo,
          dateOfBirth:
            personalInfo.dateOfBirth && personalInfo.dateOfBirth !== ""
              ? new Date(personalInfo.dateOfBirth)
              : null,
        }
      : null;

    const cleanExperiences = experiences
      .filter((exp: any) => exp.position && exp.company) // Filtrer les expériences vides
      .map((exp: any, index: number) => ({
        ...exp,
        startDate:
          exp.startDate && exp.startDate !== ""
            ? new Date(exp.startDate)
            : new Date(),
        endDate:
          exp.endDate && exp.endDate !== "" && !exp.isCurrent
            ? new Date(exp.endDate)
            : null,
        order: index,
        skills: exp.skills ? JSON.stringify(exp.skills) : null,
        description: exp.description || null,
        achievements: exp.achievements || null,
        location: exp.location || null,
        contractType: exp.contractType || "CDI",
      }));

    const cleanEducations = educations
      .filter((edu: any) => edu.degree && edu.institution) // Filtrer les formations vides
      .map((edu: any, index: number) => ({
        ...edu,
        startDate:
          edu.startDate && edu.startDate !== ""
            ? new Date(edu.startDate)
            : new Date(),
        endDate:
          edu.endDate && edu.endDate !== "" && !edu.isCurrent
            ? new Date(edu.endDate)
            : null,
        order: index,
        description: edu.description || null,
        field: edu.field || null,
        location: edu.location || null,
        grade: edu.grade || null,
        honors: edu.honors || null,
      }));

    // Créer le CV avec toutes ses sections
    const cv = await prisma.cV.create({
      data: {
        candidatId: candidat.id,
        templateId,
        title: title || "Mon CV",
        personalInfo: cleanPersonalInfo
          ? {
              create: cleanPersonalInfo,
            }
          : undefined,
        experiences: {
          create: cleanExperiences,
        },
        educations: {
          create: cleanEducations,
        },
        skills: {
          create: skills.map((skill: any, index: number) => ({
            ...skill,
            order: index,
          })),
        },
        languages: {
          create: languages.map((lang: any, index: number) => ({
            ...lang,
            order: index,
          })),
        },
        interests: {
          create: interests.map((interest: any, index: number) => ({
            ...interest,
            order: index,
          })),
        },
        customSections: {
          create: customSections.map((section: any, index: number) => ({
            ...section,
            order: index,
          })),
        },
      },
      include: {
        template: true,
        personalInfo: true,
        experiences: {
          orderBy: { order: "asc" },
        },
        educations: {
          orderBy: { order: "asc" },
        },
        skills: {
          orderBy: { order: "asc" },
        },
        languages: {
          orderBy: { order: "asc" },
        },
        interests: {
          orderBy: { order: "asc" },
        },
        customSections: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(cv, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du CV:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
