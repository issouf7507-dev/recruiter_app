import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Déconnexion réussie" });

  // Supprimer le cookie
  response.cookies.set({
    name: "token",
    value: "",
    maxAge: 0,
    path: "/",
  });

  return response;
}
