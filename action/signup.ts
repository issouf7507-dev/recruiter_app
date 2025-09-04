// app/actions/signup.ts
"use server";

import prisma from "@/lib/prisma";

export async function completeSignupRecruteur(data: {
  description: string;
  email: string;
  entreprise: string;
  name: string;
  type: "ENTREPRISE" | "PARTICULIER" | "ENTITE";
  typeUser: "RECRUTEUR" | "COLLABORATEUR" | "CANDIDAT";
}) {
  return await prisma.user.update({
    where: { email: data.email },
    data: {
      email: data.email,

      name: data.name,
      type: data.typeUser || "RECRUTEUR",
      recruteur: {
        create: {
          type: data.type || "ENTREPRISE",
          entreprise: data.entreprise,
          description: data.description,
          name: data.name,
          email: data.email,
        },
      },
    },
  });
}
