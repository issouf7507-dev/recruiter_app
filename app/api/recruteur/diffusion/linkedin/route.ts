import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body: LinkedInShareRequest = await request.json();
    const {
      offreId,
      customMessage,
      includeSalary = true,
      visibility = "PUBLIC",
    } = body;

    // Récupérer les détails de l'offre depuis la base de données
    const offreResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/recruteur/offres/${offreId}`
    );
    if (!offreResponse.ok) {
      return NextResponse.json({ error: "Offre non trouvée" }, { status: 404 });
    }

    const offreData = await offreResponse.json();
    const offre: JobOffer = offreData.data;

    // Pour l'instant, utilisons un Person URN basé sur l'ID utilisateur
    // En production, vous devriez récupérer les credentials depuis la base de données
    const linkedinAccessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    const linkedinPersonUrn = `urn:li:person:${session.user.id}`;

    if (!linkedinAccessToken) {
      return NextResponse.json(
        {
          error: "Configuration LinkedIn manquante",
          message:
            "Veuillez configurer vos credentials LinkedIn dans les paramètres",
        },
        { status: 400 }
      );
    }

    // Générer le contenu du post LinkedIn
    const shareCommentary = generateLinkedInContent(
      offre,
      customMessage,
      includeSalary
    );

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

    if (!linkedinResponse.ok) {
      const errorData = await linkedinResponse.text();
      console.error("Erreur LinkedIn API:", errorData);

      return NextResponse.json(
        {
          error: "Erreur lors de la publication sur LinkedIn",
          details: errorData,
        },
        { status: linkedinResponse.status }
      );
    }

    const linkedinData = await linkedinResponse.json();
    const postId = linkedinResponse.headers.get("X-RestLi-Id");

    // Enregistrer la diffusion dans la base de données (optionnel)
    // await saveDiffusionRecord(offreId, "linkedin", postId);

    return NextResponse.json({
      success: true,
      message: "Offre publiée avec succès sur LinkedIn",
      data: {
        platform: "linkedin",
        postId: postId,
        url: `https://www.linkedin.com/feed/update/${postId}/`,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la diffusion LinkedIn:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

function generateLinkedInContent(
  offre: JobOffer,
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
  if (offre.skills) {
    const skills = offre.skills
      .split(",")
      .slice(0, 5)
      .map((skill) => skill.trim());
    content += `🔧 Compétences: ${skills.join(", ")}\n\n`;
  }

  // Salaire si demandé
  if (includeSalary && offre.salaryMin && offre.salaryMax) {
    content += `💰 Salaire: ${offre.salaryMin.toLocaleString()} - ${offre.salaryMax.toLocaleString()} ${
      offre.salaryCurrency
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
export async function POSTWithUrl(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { offreId, articleUrl, customMessage, visibility = "PUBLIC" } = body;

    // Récupérer les détails de l'offre
    const offreResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/recruteur/offres/${offreId}`
    );
    if (!offreResponse.ok) {
      return NextResponse.json({ error: "Offre non trouvée" }, { status: 404 });
    }

    const offreData = await offreResponse.json();
    const offre: JobOffer = offreData.data;

    const linkedinAccessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    const linkedinPersonUrn = process.env.LINKEDIN_PERSON_URN;

    if (!linkedinAccessToken || !linkedinPersonUrn) {
      return NextResponse.json(
        { error: "Configuration LinkedIn manquante" },
        { status: 400 }
      );
    }

    // Préparer le payload avec URL
    const linkedinPayload = {
      author: linkedinPersonUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text:
              customMessage ||
              `Découvrez cette opportunité chez ${offre.company} !`,
          },
          shareMediaCategory: "ARTICLE",
          media: [
            {
              status: "READY",
              description: {
                text: offre.description.substring(0, 200),
              },
              originalUrl: articleUrl,
              title: {
                text: offre.title,
              },
            },
          ],
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": visibility,
      },
    };

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

    if (!linkedinResponse.ok) {
      const errorData = await linkedinResponse.text();
      return NextResponse.json(
        {
          error: "Erreur lors de la publication sur LinkedIn",
          details: errorData,
        },
        { status: linkedinResponse.status }
      );
    }

    const postId = linkedinResponse.headers.get("X-RestLi-Id");

    return NextResponse.json({
      success: true,
      message: "Offre publiée avec succès sur LinkedIn avec URL",
      data: {
        platform: "linkedin",
        postId: postId,
        url: `https://www.linkedin.com/feed/update/${postId}/`,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la diffusion LinkedIn avec URL:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
