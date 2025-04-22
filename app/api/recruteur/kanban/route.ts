import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, color, order, jobOfferId } = body;

    const kanbanColumn = await prisma.kanbanColumn.create({
      data: {
        name,
        color,
        order,
        jobOfferId: Number(jobOfferId),
      },
    });

    return NextResponse.json(
      { sucess: true, data: kanbanColumn },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { succes: false, message: "Erreur server" },
      { status: 500 }
    );
  }
}
export async function GET(req: Request) {
  try {
    const kanbanColumn = await prisma.kanbanColumn.findMany();

    return NextResponse.json(
      { sucess: true, data: kanbanColumn },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { succes: false, message: "Erreur server" },
      { status: 500 }
    );
  }
}
