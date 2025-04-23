import { NextResponse, NextRequest } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const token = req.cookies.get("token")?.value;
    const id = (await params).id;
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
    });

    const candidatures = await prisma.application.findMany({
      where: {
        jobOfferId: Number(id),
      },
      include: {
        candidat: true,
        column: true,
      },
    });

    const candidaturesWithEmail = candidatures.map((candidature) => ({
      ...candidature,
      email: user?.email,
    }));

    return NextResponse.json(
      {
        success: true,
        data: candidaturesWithEmail,
      },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
  }
}
