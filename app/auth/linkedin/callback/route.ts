import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${
          process.env.NEXT_PUBLIC_APP_URL
        }/dashboard-recruteurs/diffusion-offres?error=linkedin_auth_failed&message=${encodeURIComponent(
          error
        )}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard-recruteurs/diffusion-offres?error=missing_params`
      );
    }

    // Rediriger vers la page de diffusion avec le code
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard-recruteurs/diffusion-offres?linkedin_code=${code}&state=${state}`
    );
  } catch (error) {
    console.error("Erreur dans le callback LinkedIn:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard-recruteurs/diffusion-offres?error=callback_error`
    );
  }
}
