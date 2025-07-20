import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAuthenticatedUser } from "@/lib/auth-utils";

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = `http://localhost:3000/api/auth/linkedin/callback`;

export async function GET(req: NextRequest) {
  try {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Générer l'URL d'autorisation LinkedIn
    const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", LINKEDIN_CLIENT_ID!);
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.append("scope", "w_member_social");
    authUrl.searchParams.append("state", authenticatedUser.userId); // Pour sécuriser la requête

    return NextResponse.json({
      success: true,
      authUrl: authUrl.toString(),
    });
  } catch (error) {
    console.error(
      "Erreur lors de la génération de l'URL d'autorisation:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Code d'autorisation manquant" },
        { status: 400 }
      );
    }

    // Échanger le code contre un access token
    console.log("=== ÉCHANGE TOKEN LINKEDIN ===");
    console.log("Code reçu:", code.substring(0, 20) + "...");
    console.log("Client ID:", LINKEDIN_CLIENT_ID?.substring(0, 10) + "...");
    console.log("Redirect URI:", REDIRECT_URI);

    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      client_id: LINKEDIN_CLIENT_ID!,
      client_secret: LINKEDIN_CLIENT_SECRET!,
      redirect_uri: REDIRECT_URI,
    });

    console.log("Paramètres envoyés:", {
      grant_type: "authorization_code",
      code: code.substring(0, 20) + "...",
      client_id: LINKEDIN_CLIENT_ID?.substring(0, 10) + "...",
      redirect_uri: REDIRECT_URI,
    });

    const tokenResponse = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tokenParams,
      }
    );

    console.log("Status LinkedIn API:", tokenResponse.status);
    console.log(
      "Headers LinkedIn API:",
      Object.fromEntries(tokenResponse.headers.entries())
    );

    const responseText = await tokenResponse.text();
    console.log("Réponse LinkedIn API:", responseText);

    if (!tokenResponse.ok) {
      console.error("=== ERREUR LINKEDIN API ===");
      console.error("Status:", tokenResponse.status);
      console.error("Réponse:", responseText);
      return NextResponse.json(
        {
          error: "Erreur lors de l'authentification LinkedIn",
          details: responseText,
          status: tokenResponse.status,
        },
        { status: 400 }
      );
    }

    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
      console.log("Token data:", {
        ...tokenData,
        access_token: tokenData.access_token ? "✅ Présent" : "❌ Manquant",
      });
    } catch (error) {
      console.error("Erreur parsing JSON:", error);
      return NextResponse.json(
        {
          error: "Réponse LinkedIn invalide",
          details: responseText,
        },
        { status: 400 }
      );
    }

    const { access_token } = tokenData;
    console.log("Access token extrait:", access_token.substring(0, 20) + "...");

    // Utilisons l'ID utilisateur de notre application pour le Person URN
    // En production, vous devriez récupérer le vrai Person URN via l'API LinkedIn
    const personUrn = `urn:li:person:${authenticatedUser.userId}`;
    console.log("Person URN généré:", personUrn);

    // Ici, vous devriez sauvegarder l'access_token et le personUrn dans votre base de données
    // associés à l'utilisateur connecté
    // await saveLinkedInCredentials(authenticatedUser.userId, access_token, personUrn);

    return NextResponse.json({
      success: true,
      message: "Authentification LinkedIn réussie",
      data: {
        accessToken: access_token,
        personUrn: personUrn,
        userId: authenticatedUser.userId,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'authentification LinkedIn:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
