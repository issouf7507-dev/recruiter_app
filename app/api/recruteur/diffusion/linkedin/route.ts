import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface LinkedInShareRequest {
  offreId: number;
  customMessage?: string;
  includeSalary?: boolean;
  visibility?: "PUBLIC" | "CONNECTIONS";
}

interface JobOffer {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  responsibilities: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  experience: string;
  skills: string;
  etat: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session.user.id },
    });
    const collaborateur = await prisma.collaborateur.findUnique({
      where: { userId: session.user.id },
      include: {
        recruteur: true,
      },
    });
    if (!recruteur && !collaborateur) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body: LinkedInShareRequest = await request.json();
    const {
      offreId,
      customMessage,
      includeSalary = true,
      visibility = "PUBLIC",
    } = body;

    console.log("Diffusion LinkedIn - Données reçues:", {
      offreId,
      customMessage,
      includeSalary,
      visibility,
    });

    // Récupérer les détails de l'offre directement depuis la base de données
    const offre = await prisma.jobOffer.findFirst({
      where: {
        id: offreId,
        // recruteurId: decoded.userId,
      },
      include: {
        jobOfferCompetences: true,
      },
    });

    if (!offre) {
      console.error("Offre non trouvée:", {
        offreId,
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
      });
      return NextResponse.json(
        {
          error: "Offre non trouvée ou non autorisée",
          details:
            "L'offre n'existe pas ou vous n'avez pas les permissions pour y accéder",
        },
        { status: 404 }
      );
    }

    console.log("Offre trouvée:", offre);

    // Vérifier la configuration LinkedIn
    const linkedinAccessToken = process.env.LINKEDIN_ACCESS_TOKEN;

    if (!linkedinAccessToken) {
      console.error(
        "Token LinkedIn manquant dans les variables d'environnement"
      );
      return NextResponse.json(
        {
          error: "Configuration LinkedIn manquante",
          message:
            "Veuillez configurer vos credentials LinkedIn dans les paramètres",
          details: "LINKEDIN_ACCESS_TOKEN n'est pas configuré",
        },
        { status: 400 }
      );
    }

    // Construire le Person URN LinkedIn
    // Note: En production, vous devriez récupérer le LinkedIn Person URN depuis la base de données
    const linkedinPersonUrn =
      process.env.LINKEDIN_PERSON_URN || `urn:li:person:${session.user.id}`;

    console.log("Configuration LinkedIn:", {
      hasToken: !!linkedinAccessToken,
      personUrn: linkedinPersonUrn,
    });

    // Générer le contenu du post LinkedIn
    const shareCommentary = generateLinkedInContent(
      offre,
      customMessage,
      includeSalary
    );

    console.log("Contenu généré pour LinkedIn:", shareCommentary);

    // Préparer le payload pour l'API LinkedIn
    const linkedinPayload = {
      author: linkedinPersonUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: shareCommentary,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": visibility,
      },
    };

    console.log("Payload LinkedIn:", JSON.stringify(linkedinPayload, null, 2));

    // Appeler l'API LinkedIn
    const linkedinResponse = await fetch(
      "https://api.linkedin.com/v2/ugcPosts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${linkedinAccessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(linkedinPayload),
      }
    );

    console.log("Réponse LinkedIn - Status:", linkedinResponse.status);

    if (!linkedinResponse.ok) {
      const errorData = await linkedinResponse.text();
      console.error("Erreur LinkedIn API:", {
        status: linkedinResponse.status,
        statusText: linkedinResponse.statusText,
        errorData,
      });

      return NextResponse.json(
        {
          error: "Erreur lors de la publication sur LinkedIn",
          details: errorData,
          status: linkedinResponse.status,
        },
        { status: linkedinResponse.status }
      );
    }

    const linkedinData = await linkedinResponse.json();
    const postId = linkedinResponse.headers.get("X-RestLi-Id");

    console.log("Publication LinkedIn réussie:", {
      postId,
      linkedinData,
    });

    // Note: L'enregistrement de diffusion n'est pas implémenté dans le schéma actuel
    // Vous pouvez ajouter un modèle DiffusionRecord si nécessaire

    return NextResponse.json({
      success: true,
      message: "Offre publiée avec succès sur LinkedIn",
      data: {
        platform: "linkedin",
        postId: postId,
        url: postId ? `https://www.linkedin.com/feed/update/${postId}/` : null,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la diffusion LinkedIn:", error);

    // Retourner une erreur plus détaillée
    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

function generateLinkedInContent(
  offre: any,
  customMessage?: string,
  includeSalary?: boolean
): string {
  let content = `🚀 Nouvelle opportunité chez ${offre.company} !\n\n`;
  content += `📋 ${offre.title}\n`;
  content += `📍 ${offre.location}\n`;
  content += `💼 Type de contrat: ${offre.type}\n`;
  content += `🎯 Expérience: ${offre.experience}\n\n`;

  // Description courte (limite LinkedIn)
  const shortDescription =
    offre.description.length > 200
      ? offre.description.substring(0, 200) + "..."
      : offre.description;

  content += `${shortDescription}\n\n`;

  // Compétences principales
  if (offre.jobOfferCompetences && offre.jobOfferCompetences.length > 0) {
    const skills = offre.jobOfferCompetences
      .slice(0, 5)
      .map((comp: any) => comp.competence)
      .filter(Boolean);

    if (skills.length > 0) {
      content += `🔧 Compétences: ${skills.join(", ")}\n\n`;
    }
  } else if (offre.skills) {
    const skills = offre.skills
      .split(",")
      .slice(0, 5)
      .map((skill: string) => skill.trim())
      .filter(Boolean);

    if (skills.length > 0) {
      content += `🔧 Compétences: ${skills.join(", ")}\n\n`;
    }
  }

  // Salaire si demandé
  if (includeSalary && offre.salaryMin && offre.salaryMax) {
    content += `💰 Salaire: ${offre.salaryMin.toLocaleString()} - ${offre.salaryMax.toLocaleString()} ${
      offre.salaryCurrency || "EUR"
    }\n\n`;
  }

  // Message personnalisé
  if (customMessage) {
    content += `💬 ${customMessage}\n\n`;
  }

  content += `#emploi #recrutement #opportunité #${offre.company.replace(
    /\s+/g,
    ""
  )}`;

  return content;
}

// Fonction pour publier avec une URL (article)
// export async function POSTWithUrl(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
//     }

//     const body = await request.json();
//     const { offreId, articleUrl, customMessage, visibility = "PUBLIC" } = body;

//     // Récupérer les détails de l'offre
//     const offreResponse = await fetch(
//       `${process.env.NEXT_PUBLIC_APP_URL}/api/recruteur/offres/${offreId}`
//     );
//     if (!offreResponse.ok) {
//       return NextResponse.json({ error: "Offre non trouvée" }, { status: 404 });
//     }

//     const offreData = await offreResponse.json();
//     const offre: JobOffer = offreData.data;

//     const linkedinAccessToken = process.env.LINKEDIN_ACCESS_TOKEN;
//     const linkedinPersonUrn = process.env.LINKEDIN_PERSON_URN;

//     if (!linkedinAccessToken || !linkedinPersonUrn) {
//       return NextResponse.json(
//         { error: "Configuration LinkedIn manquante" },
//         { status: 400 }
//       );
//     }

//     // Préparer le payload avec URL
//     const linkedinPayload = {
//       author: linkedinPersonUrn,
//       lifecycleState: "PUBLISHED",
//       specificContent: {
//         "com.linkedin.ugc.ShareContent": {
//           shareCommentary: {
//             text:
//               customMessage ||
//               `Découvrez cette opportunité chez ${offre.company} !`,
//           },
//           shareMediaCategory: "ARTICLE",
//           media: [
//             {
//               status: "READY",
//               description: {
//                 text: offre.description.substring(0, 200),
//               },
//               originalUrl: articleUrl,
//               title: {
//                 text: offre.title,
//               },
//             },
//           ],
//         },
//       },
//       visibility: {
//         "com.linkedin.ugc.MemberNetworkVisibility": visibility,
//       },
//     };

//     const linkedinResponse = await fetch(
//       "https://api.linkedin.com/v2/ugcPosts",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${linkedinAccessToken}`,
//           "Content-Type": "application/json",
//           "X-Restli-Protocol-Version": "2.0.0",
//         },
//         body: JSON.stringify(linkedinPayload),
//       }
//     );

//     if (!linkedinResponse.ok) {
//       const errorData = await linkedinResponse.text();
//       return NextResponse.json(
//         {
//           error: "Erreur lors de la publication sur LinkedIn",
//           details: errorData,
//         },
//         { status: linkedinResponse.status }
//       );
//     }

//     const postId = linkedinResponse.headers.get("X-RestLi-Id");

//     return NextResponse.json({
//       success: true,
//       message: "Offre publiée avec succès sur LinkedIn avec URL",
//       data: {
//         platform: "linkedin",
//         postId: postId,
//         url: `https://www.linkedin.com/feed/update/${postId}/`,
//       },
//     });
//   } catch (error) {
//     console.error("Erreur lors de la diffusion LinkedIn avec URL:", error);
//     return NextResponse.json(
//       { error: "Erreur interne du serveur" },
//       { status: 500 }
//     );
//   }
// }
