import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Récupérer un CV spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Récupérer le CV avec toutes ses sections
    const cv = await prisma.cV.findFirst({
      where: {
        id: (await params).id,
        candidatId: candidat.id,
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

    if (!cv) {
      return NextResponse.json({ error: "CV non trouvé" }, { status: 404 });
    }

    // Parser les compétences des expériences
    const cvWithParsedSkills = {
      ...cv,
      experiences: cv.experiences.map((exp) => ({
        ...exp,
        skills: exp.skills ? JSON.parse(exp.skills) : [],
      })),
    };

    return NextResponse.json(cvWithParsedSkills);
  } catch (error) {
    console.error("Erreur lors de la récupération du CV:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un CV
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const id = (await params).id;
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

    // Vérifier que le CV appartient au candidat
    const existingCv = await prisma.cV.findFirst({
      where: {
        id: id,
        candidatId: candidat.id,
      },
    });

    if (!existingCv) {
      return NextResponse.json({ error: "CV non trouvé" }, { status: 404 });
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

    // Nettoyer les données avant mise à jour
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

    // Supprimer toutes les sections existantes et les recréer
    await prisma.$transaction(async (tx) => {
      // Supprimer les sections existantes
      await tx.cVExperience.deleteMany({ where: { cvId: id } });
      await tx.cVEducation.deleteMany({ where: { cvId: id } });
      await tx.cVSkill.deleteMany({ where: { cvId: id } });
      await tx.cVLanguage.deleteMany({ where: { cvId: id } });
      await tx.cVInterest.deleteMany({ where: { cvId: id } });
      await tx.cVCustomSection.deleteMany({ where: { cvId: id } });

      // Supprimer les informations personnelles si elles existent
      await tx.cVPersonalInfo.deleteMany({ where: { cvId: id } });

      // Mettre à jour le CV principal
      await tx.cV.update({
        where: { id: id },
        data: {
          title: title || existingCv.title,
          templateId: templateId || existingCv.templateId,
          updatedAt: new Date(),
        },
      });

      // Recréer les informations personnelles
      if (cleanPersonalInfo) {
        await tx.cVPersonalInfo.create({
          data: {
            cvId: id,
            ...cleanPersonalInfo,
          },
        });
      }

      // Recréer les expériences
      if (cleanExperiences.length > 0) {
        await tx.cVExperience.createMany({
          data: cleanExperiences,
        });
      }

      // Recréer les formations
      if (cleanEducations.length > 0) {
        await tx.cVEducation.createMany({
          data: cleanEducations,
        });
      }

      // Recréer les compétences
      if (skills.length > 0) {
        await tx.cVSkill.createMany({
          data: skills.map((skill: any, index: number) => ({
            cvId: id,
            ...skill,
            order: index,
          })),
        });
      }

      // Recréer les langues
      if (languages.length > 0) {
        await tx.cVLanguage.createMany({
          data: languages.map((lang: any, index: number) => ({
            cvId: id,
            ...lang,
            order: index,
          })),
        });
      }

      // Recréer les centres d'intérêt
      if (interests.length > 0) {
        await tx.cVInterest.createMany({
          data: interests.map((interest: any, index: number) => ({
            cvId: id,
            ...interest,
            order: index,
          })),
        });
      }

      // Recréer les sections personnalisées
      if (customSections.length > 0) {
        await tx.cVCustomSection.createMany({
          data: customSections.map((section: any, index: number) => ({
            cvId: id,
            ...section,
            order: index,
          })),
        });
      }
    });

    // Récupérer le CV mis à jour
    const updatedCv = await prisma.cV.findUnique({
      where: { id: id },
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

    return NextResponse.json(updatedCv);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du CV:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un CV
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
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

    // Vérifier que le CV appartient au candidat
    const cv = await prisma.cV.findFirst({
      where: {
        id: id,
        candidatId: candidat.id,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV non trouvé" }, { status: 404 });
    }

    // Supprimer le CV (cascade supprimera toutes les sections)
    await prisma.cV.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "CV supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du CV:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
