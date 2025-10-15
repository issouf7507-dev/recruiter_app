import { NextResponse, NextRequest } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // const token = req.cookies.get("candidat")?.value;
    // if (!token) {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    // }

    // const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
    //   userId: string;
    //   type: string;
    // };

    // if (decoded.type !== "CANDIDAT") {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    // }

    // // Récupérer le candidat
    // const candidat = await prisma.candidat.findFirst({
    //   where: {
    //     userId: decoded.userId,
    //   },
    // });

    // if (!candidat) {
    //   return NextResponse.json(
    //     { error: "Candidat non trouvé" },
    //     { status: 404 }
    //   );
    // }

    const session = await auth.api.getSession({ headers: req.headers });
    const candidat = await prisma.candidat.findUnique({
      where: { userId: session?.user.id },
    });

    if (!candidat) {
      return NextResponse.json(
        { error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les candidatures acceptées (colonnes avec noms indiquant l'acceptation)
    const candidaturesAcceptees = await prisma.application.findMany({
      where: {
        candidatId: candidat.id,
        column: {
          OR: [
            { name: { contains: "accepté" } },
            { name: { contains: "acceptée" } },
            { name: { contains: "embauché" } },
            { name: { contains: "embauchée" } },
            { name: { contains: "recruté" } },
            { name: { contains: "recrutée" } },
            { name: { contains: "validé" } },
            { name: { contains: "validée" } },
            { name: { contains: "retenu" } },
            { name: { contains: "retenue" } },
            { name: { contains: "finalisé" } },
            { name: { contains: "finalisée" } },
          ],
        },
      },
      include: {
        jobOffer: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            type: true,
            salaryMin: true,
            salaryMax: true,
            salaryCurrency: true,
            salaryPeriod: true,
            description: true,
            createdAt: true,
            recruteur: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                entreprise: true,
              },
            },
            kanbanColumns: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
        column: {
          select: {
            id: true,
            name: true,
            order: true,
            color: true,
          },
        },
        files: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            fileType: true,
            fileSize: true,
            uploadedByType: true,
            createdAt: true,
          },
        },
        checklist: {
          select: {
            id: true,
            title: true,
            description: true,
            isCompleted: true,
            createdByType: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        notes: {
          select: {
            id: true,
            content: true,
            authorName: true,
            authorType: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc", // Les plus récemment mises à jour en premier
      },
    });

    // Transformer les données pour la présentation
    const candidaturesAvecDetails = candidaturesAcceptees.map((candidature) => {
      const recruteur = candidature.jobOffer.recruteur;

      return {
        id: candidature.id,
        titre: candidature.jobOffer.title,
        entreprise: candidature.jobOffer.company,
        localisation: candidature.jobOffer.location,
        type: candidature.jobOffer.type,
        salaire:
          candidature.jobOffer.salaryMin && candidature.jobOffer.salaryMax
            ? `${candidature.jobOffer.salaryMin.toLocaleString()} - ${candidature.jobOffer.salaryMax.toLocaleString()} ${
                candidature.jobOffer.salaryCurrency
              }/${candidature.jobOffer.salaryPeriod}`
            : null,
        description: candidature.jobOffer.description,
        dateCandidature: candidature.createdAt.toLocaleDateString("fr-FR"),
        dateAcceptation: candidature.updatedAt.toLocaleDateString("fr-FR"),
        statut: candidature.column.name,
        message: candidature.message,

        // Informations du contact RH
        contact: {
          nom: recruteur?.name || "Non disponible",
          email: recruteur?.email || "",
          telephone: recruteur?.phone || "",
          poste: recruteur?.entreprise || "Responsable RH",
          entreprise: recruteur?.entreprise || candidature.jobOffer.company,
        },

        // Documents et fichiers
        documents: candidature.files.map((file) => ({
          id: file.id,
          nom: file.fileName,
          url: file.fileUrl,
          type: file.fileType,
          taille: file.fileSize,
          uploadePar: file.uploadedByType,
          statut:
            file.uploadedByType === "RECRUTEUR" ? "à consulter" : "envoyé",
          dateUpload: file.createdAt.toLocaleDateString("fr-FR"),
        })),

        // Checklist et prochaines étapes
        prochainessEtapes: candidature.checklist.map((item) => ({
          id: item.id,
          titre: item.title,
          description: item.description,
          termine: item.isCompleted,
          creePar: item.createdByType,
          dateCreation: item.createdAt.toLocaleDateString("fr-FR"),
        })),

        // Notes du recruteur
        notes: candidature.notes
          .filter((note) => note.authorType === "RECRUTEUR")
          .map((note) => ({
            id: note.id,
            contenu: note.content,
            auteur: note.authorName,
            date: note.createdAt.toLocaleDateString("fr-FR"),
          })),

        jobOfferId: candidature.jobOffer.id,
      };
    });

    return NextResponse.json({
      success: true,
      data: candidaturesAvecDetails,
    });
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des candidatures acceptées:",
      err
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des candidatures acceptées" },
      { status: 500 }
    );
  }
}
