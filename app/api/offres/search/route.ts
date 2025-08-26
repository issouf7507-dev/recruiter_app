import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const location = searchParams.get("location") || "";
    const company = searchParams.get("company") || "";
    const exclude = searchParams.get("exclude") || "";
    const type = searchParams.get("type") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build the where clause for filtering
    const whereClause: any = {
      etat: "active", // Only show active offers
    };

    // Exclude specific offer if provided
    if (exclude) {
      whereClause.NOT = {
        id: parseInt(exclude),
      };
    }

    // Add search filters
    if (query) {
      whereClause.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { skills: { contains: query } },
        { jobOfferCompetences: { some: { competence: { contains: query } } } },
      ];
    }

    if (location) {
      whereClause.location = { contains: location };
    }

    if (company) {
      whereClause.company = { contains: company };
    }

    if (type) {
      whereClause.type = { contains: type };
    }

    // Get total count for pagination
    const totalCount = await prisma.jobOffer.count({
      where: whereClause,
    });

    // Get job offers with pagination
    const jobOffers = await prisma.jobOffer.findMany({
      where: whereClause,
      include: {
        recruteur: {
          select: {
            name: true,
            logo: true,
            industry: true,
          },
        },
        applications: {
          select: {
            id: true,
          },
        },
        jobOfferCompetences: {
          select: {
            competence: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    // Format the response
    const formattedOffers = jobOffers.map((offer) => ({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      company: offer.company,
      location: offer.location,
      type: offer.type,
      experience: offer.experience,
      salaryMin: offer.salaryMin,
      salaryMax: offer.salaryMax,
      salaryCurrency: offer.salaryCurrency,
      salaryPeriod: offer.salaryPeriod,
      benefits: offer.benefits,
      requirements: offer.requirements,
      responsibilities: offer.responsibilities,
      skills: offer.skills,
      jobOfferCompetences: offer.jobOfferCompetences,
      views: offer.views,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      recruteur: offer.recruteur,
      duedate: offer.duedate,
      applicationsCount: offer.applications.length,
    }));

    return NextResponse.json({
      success: true,
      data: formattedOffers,
      offers: formattedOffers, // Also include offers for compatibility
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la recherche d'offres:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la recherche d'offres" },
      { status: 500 }
    );
  }
}
