import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST - Dupliquer un CV
export async function POST(
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

    // Récupérer le CV original avec toutes ses sections
    const originalCv = await prisma.cV.findFirst({
      where: {
        id: (await params).id,
        candidatId: candidat.id,
      },
      include: {
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

    if (!originalCv) {
      return NextResponse.json({ error: "CV non trouvé" }, { status: 404 });
    }

    // Créer une copie du CV
    const duplicatedCv = await prisma.cV.create({
      data: {
        candidatId: candidat.id,
        templateId: originalCv.templateId,
        title: `${originalCv.title} (Copie)`,
        isPublic: false, // La copie n'est pas publique par défaut
        personalInfo: originalCv.personalInfo
          ? {
              create: {
                firstName: originalCv.personalInfo.firstName,
                lastName: originalCv.personalInfo.lastName,
                email: originalCv.personalInfo.email,
                phone: originalCv.personalInfo.phone,
                address: originalCv.personalInfo.address,
                city: originalCv.personalInfo.city,
                postalCode: originalCv.personalInfo.postalCode,
                country: originalCv.personalInfo.country,
                dateOfBirth: originalCv.personalInfo.dateOfBirth,
                nationality: originalCv.personalInfo.nationality,
                maritalStatus: originalCv.personalInfo.maritalStatus,
                drivingLicense: originalCv.personalInfo.drivingLicense,
                website: originalCv.personalInfo.website,
                linkedin: originalCv.personalInfo.linkedin,
                github: originalCv.personalInfo.github,
                portfolio: originalCv.personalInfo.portfolio,
                profileImage: originalCv.personalInfo.profileImage,
                summary: originalCv.personalInfo.summary,
              },
            }
          : undefined,
        experiences: {
          create: originalCv.experiences.map((exp) => ({
            position: exp.position,
            company: exp.company,
            location: exp.location,
            contractType: exp.contractType,
            startDate: exp.startDate,
            endDate: exp.endDate,
            isCurrent: exp.isCurrent,
            description: exp.description,
            achievements: exp.achievements,
            skills: exp.skills,
            order: exp.order,
          })),
        },
        educations: {
          create: originalCv.educations.map((edu) => ({
            degree: edu.degree,
            institution: edu.institution,
            field: edu.field,
            location: edu.location,
            startDate: edu.startDate,
            endDate: edu.endDate,
            isCurrent: edu.isCurrent,
            description: edu.description,
            grade: edu.grade,
            honors: edu.honors,
            order: edu.order,
          })),
        },
        skills: {
          create: originalCv.skills.map((skill) => ({
            name: skill.name,
            category: skill.category,
            level: skill.level,
            order: skill.order,
          })),
        },
        languages: {
          create: originalCv.languages.map((lang) => ({
            name: lang.name,
            level: lang.level,
            certification: lang.certification,
            order: lang.order,
          })),
        },
        interests: {
          create: originalCv.interests.map((interest) => ({
            name: interest.name,
            description: interest.description,
            order: interest.order,
          })),
        },
        customSections: {
          create: originalCv.customSections.map((section) => ({
            title: section.title,
            content: section.content,
            order: section.order,
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

    return NextResponse.json(duplicatedCv, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la duplication du CV:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
