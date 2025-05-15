import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verify } from "jsonwebtoken";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    // }

    // // Récupérer l'utilisateur et vérifier s'il est un collaborateur
    // const user = await prisma.user.findUnique({
    //   where: { email: session.user.email! },
    //   include: {
    //     collaborateur: true,
    //     recruteur: true,
    //   },
    // });

    // if (!user) {
    //   return NextResponse.json(
    //     { error: "Utilisateur non trouvé" },
    //     { status: 404 }
    //   );
    // }

    const tokenv = req.cookies.get("token")?.value;

    if (!tokenv) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const decoded = verify(tokenv, process.env.JWT_SECRET!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
      },
      include: {
        recruteur: true,
        collaborateur: true,
      },
    });

    // Déterminer le recruteurId à utiliser
    let recruteurId: string;
    if (user?.type === "RECRUTEUR" && user?.recruteur) {
      // Si c'est le recruteur principal
      recruteurId = user.recruteur.id;
    } else if (user?.collaborateur) {
      // Si c'est un collaborateur
      recruteurId = user.collaborateur.recruteurId;
    } else {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const jobOffer = await prisma.jobOffer.findMany({
      where: {
        recruteurId: recruteurId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        applications: {
          include: {
            candidat: true,
          },
        },
        kanbanColumns: true,
      },
    });

    return NextResponse.json(
      { message: true, data: jobOffer },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier les permissions
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        collaborateur: true,
        recruteur: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const id = (await params).id;

    // Vérifier si l'offre appartient au recruteur ou au collaborateur
    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id: Number(id) },
    });

    if (!jobOffer) {
      return NextResponse.json({ error: "Offre non trouvée" }, { status: 404 });
    }

    let canDelete = false;
    if (user.type === "RECRUTEUR" && user.recruteur) {
      canDelete = jobOffer.recruteurId === user.recruteur.id;
    } else if (user.collaborateur) {
      canDelete =
        jobOffer.recruteurId === user.collaborateur.recruteurId &&
        user.collaborateur.role === "ADMIN";
    }

    if (!canDelete) {
      return NextResponse.json(
        { error: "Non autorisé à supprimer cette offre" },
        { status: 403 }
      );
    }

    // Supprimer d'abord les colonnes du kanban associées
    await prisma.kanbanColumn.deleteMany({
      where: {
        jobOfferId: Number(id),
      },
    });

    // Supprimer l'offre
    const deletedJobOffer = await prisma.jobOffer.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json(
      { success: true, data: deletedJobOffer },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue lors de la suppression",
      },
      { status: 500 }
    );
  }
}
