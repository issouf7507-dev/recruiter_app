"use server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getRedirectPath } from "@/lib/auth-redirect";
import { UserType } from "@/app/generated/prisma";

export async function redirectRecruteur(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return null;
  }

  return redirect(getRedirectPath(user.type as UserType));
}
