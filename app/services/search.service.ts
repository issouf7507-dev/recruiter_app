import prisma from "@/lib/prisma";

interface SearchParams {
  title?: string;
  company?: string;
  location?: string;
  skills?: string[];
  experience?: string;
  salaryRange?: string;
  type?: string;
}

export class SearchService {
  static async search({
    title,

    location,

    // salaryRange,
    type,
  }: SearchParams) {
    try {
      const where: any = {};

      // Add filters only if they are provided and not empty
      if (title) where.title = { contains: title, mode: "insensitive" };
      //   if (company) where.company = { contains: company, mode: "insensitive" };
      if (location)
        where.location = { contains: location, mode: "insensitive" };
      if (type && type !== "all") where.type = type;

      // Handle experience filter
      //   if (experience && experience !== "all") {
      //     where.experience = experience;
      //   }

      // Handle salary range filter
      //   if (salaryRange && salaryRange !== "all") {
      //     if (salaryRange === "3+") {
      //       where.salaryMin = {
      //         gte: 3000000,
      //       };
      //     } else {
      //       const [min, max] = salaryRange.split("-").map(Number);
      //       where.salaryMin = {
      //         gte: min * 1000000,
      //       };
      //       where.salaryMax = {
      //         lte: max * 1000000,
      //       };
      //     }
      //   }

      const results = await prisma.jobOffer.findMany({
        where: {
          title: {
            contains: title,
            mode: "insensitive",
          },
          location: {
            contains: location,
            mode: "insensitive",
          },
          type: where.type,
          //   salaryMin: {
          //     gte: 1000000,
          //   }
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return results;
    } catch (error) {
      console.error("Error searching for jobs:", error);
      throw error;
    }
  }
}
