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

export async function completeSignupCandidat(data: {
  email: string;
  password: string;
  confirmPassword: string;
  nom: string;
  prenom: string;
  telephone: string;
  pays: string;
  dateNaissance: string;
  nationalite: string;
  situationFamiliale: string;
  permisConduire: string;
  type: "CANDIDAT";
}) {
  return await prisma.user.update({
    where: { email: data.email },
    data: {
      email: data.email,
      name: data.nom + " " + data.prenom,
      type: data.type,
      candidat: {
        create: {
          nom: data.nom,
          prenom: data.prenom,
          telephone: data.telephone,
          pays: data.pays,
          dateNaissance: new Date(data.dateNaissance),
          nationalite: data.nationalite,
          situationFamiliale: data.situationFamiliale,
          permisConduire: data.permisConduire,
          email: data.email,
        },
      },
    },
  });
}
