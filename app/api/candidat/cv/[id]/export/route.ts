import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import puppeteer from "puppeteer";
import { generateMinimalistCVHTML } from "@/lib/cv-templates/minimal-pdf";

// POST - Exporter un CV en PDF
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer le candidat
    const candidat = await prisma.candidat.findUnique({
      where: { userId: session.user.id },
    });

    if (!candidat) {
      return NextResponse.json(
        { error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer le CV avec toutes ses sections
    const cv = await prisma.cV.findFirst({
      where: {
        id: params.id,
        candidatId: candidat.id,
      },
      include: {
        template: true,
        personalInfo: true,
        experiences: {
          orderBy: { order: "asc" },
        },
        educations: {
          orderBy: { order: "asc" },
        },
        skills: {
          orderBy: { order: "asc" },
        },
        languages: {
          orderBy: { order: "asc" },
        },
        interests: {
          orderBy: { order: "asc" },
        },
        customSections: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV non trouvé" }, { status: 404 });
    }

    // Générer le HTML du CV selon le template
    const htmlContent =
      cv.template?.layout === "minimal"
        ? generateMinimalistCVHTML(cv)
        : generateCVHTML(cv);

    // Créer le PDF avec Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
    });

    await browser.close();

    // Mettre à jour la date d'export
    await prisma.cV.update({
      where: { id: params.id },
      data: { lastExportedAt: new Date() },
    });

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cv.title || "CV"}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'export PDF:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

function generateCVHTML(cv: any): string {
  const {
    personalInfo,
    experiences,
    educations,
    skills,
    languages,
    interests,
    template,
  } = cv;

  // Couleurs par défaut selon le template
  const getTemplateColors = () => {
    switch (template?.layout) {
      case "modern":
        return {
          primary: "#3B82F6",
          secondary: "#64748B",
          accent: "#F1F5F9",
        };
      case "classic":
        return {
          primary: "#1F2937",
          secondary: "#6B7280",
          accent: "#F9FAFB",
        };
      case "creative":
        return {
          primary: "#7C3AED",
          secondary: "#A78BFA",
          accent: "#F3F4F6",
        };
      case "minimal":
        return {
          primary: "#059669",
          secondary: "#10B981",
          accent: "#ECFDF5",
        };
      default:
        return {
          primary: "#3B82F6",
          secondary: "#64748B",
          accent: "#F1F5F9",
        };
    }
  };

  const colors = template?.colors || getTemplateColors();

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  };

  const getLevelStars = (level: number) => {
    return "★".repeat(level) + "☆".repeat(5 - level);
  };

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${cv.title || "CV"}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          background: white;
        }
        
        .cv-container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px solid ${colors.accent};
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .profile-image {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 15px;
          overflow: hidden;
        }
        
        .profile-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .name {
          font-size: 24px;
          font-weight: bold;
          color: ${colors.primary};
          margin-bottom: 10px;
        }
        
        .summary {
          color: #666;
          margin-bottom: 15px;
          font-style: italic;
        }
        
        .contact-info {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 15px;
          font-size: 11px;
          color: #666;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: ${colors.primary};
          border-bottom: 1px solid ${colors.accent};
          padding-bottom: 5px;
          margin-bottom: 15px;
          text-transform: uppercase;
        }
        
        .experience-item, .education-item {
          margin-bottom: 15px;
          page-break-inside: avoid;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 5px;
        }
        
        .item-title {
          font-weight: bold;
          font-size: 13px;
        }
        
        .item-company {
          color: ${colors.secondary};
          font-size: 12px;
        }
        
        .item-date {
          font-size: 11px;
          color: #666;
          text-align: right;
        }
        
        .item-description {
          font-size: 11px;
          color: #555;
          margin-top: 5px;
        }
        
        .skills-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .skill-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .skill-name {
          font-weight: 500;
        }
        
        .skill-level {
          font-size: 10px;
          color: #666;
        }
        
        .language-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .badge {
          background: ${colors.accent};
          color: ${colors.primary};
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
        }
        
        .interests {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .interest-item {
          font-size: 11px;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .cv-container {
            padding: 0;
          }
          
          .section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="cv-container">
        <!-- En-tête -->
        <div class="header">
          ${
            personalInfo?.profileImage
              ? `
            <div class="profile-image">
              <img src="${personalInfo.profileImage}" alt="Photo de profil" />
            </div>
          `
              : ""
          }
          
          <div class="name">
            ${personalInfo?.firstName || "Prénom"} ${personalInfo?.lastName || "Nom"}
          </div>
          
          ${
            personalInfo?.summary
              ? `
            <div class="summary">${personalInfo.summary}</div>
          `
              : ""
          }
          
          <div class="contact-info">
            ${personalInfo?.email ? `<span>📧 ${personalInfo.email}</span>` : ""}
            ${personalInfo?.phone ? `<span>📞 ${personalInfo.phone}</span>` : ""}
            ${
              personalInfo?.city || personalInfo?.country
                ? `
              <span>📍 ${[personalInfo?.city, personalInfo?.country].filter(Boolean).join(", ")}</span>
            `
                : ""
            }
            ${personalInfo?.website ? `<span>🌐 ${personalInfo.website}</span>` : ""}
            ${personalInfo?.linkedin ? `<span>💼 LinkedIn</span>` : ""}
          </div>
        </div>

        <!-- Expériences -->
        ${
          experiences && experiences.length > 0
            ? `
          <div class="section">
            <div class="section-title">Expérience Professionnelle</div>
            ${experiences
              .map(
                (exp: any) => `
              <div class="experience-item">
                <div class="item-header">
                  <div>
                    <div class="item-title">${exp.position}</div>
                    <div class="item-company">${exp.company}</div>
                  </div>
                  <div class="item-date">
                    ${formatDate(exp.startDate)}${exp.isCurrent ? " - Aujourd'hui" : exp.endDate ? ` - ${formatDate(exp.endDate)}` : ""}
                    ${exp.location ? `<br/>${exp.location}` : ""}
                  </div>
                </div>
                ${exp.description ? `<div class="item-description">${exp.description}</div>` : ""}
                ${exp.achievements ? `<div class="item-description"><strong>Réalisations :</strong> ${exp.achievements}</div>` : ""}
              </div>
            `
              )
              .join("")}
          </div>
        `
            : ""
        }

        <!-- Formation -->
        ${
          educations && educations.length > 0
            ? `
          <div class="section">
            <div class="section-title">Formation</div>
            ${educations
              .map(
                (edu: any) => `
              <div class="education-item">
                <div class="item-header">
                  <div>
                    <div class="item-title">${edu.degree}</div>
                    <div class="item-company">${edu.institution}</div>
                    ${edu.field ? `<div style="font-size: 11px; color: #666;">${edu.field}</div>` : ""}
                  </div>
                  <div class="item-date">
                    ${formatDate(edu.startDate)}${edu.isCurrent ? " - En cours" : edu.endDate ? ` - ${formatDate(edu.endDate)}` : ""}
                    ${edu.location ? `<br/>${edu.location}` : ""}
                  </div>
                </div>
                ${
                  edu.grade || edu.honors
                    ? `
                  <div style="margin-top: 5px;">
                    ${edu.grade ? `<span class="badge">${edu.grade}</span>` : ""}
                    ${edu.honors ? `<span class="badge">🏆 ${edu.honors}</span>` : ""}
                  </div>
                `
                    : ""
                }
              </div>
            `
              )
              .join("")}
          </div>
        `
            : ""
        }

        <div class="skills-grid">
          <!-- Compétences -->
          ${
            skills && skills.length > 0
              ? `
            <div class="section">
              <div class="section-title">Compétences</div>
              ${skills
                .map(
                  (skill: any) => `
                <div class="skill-item">
                  <span class="skill-name">${skill.name}</span>
                  <span class="skill-level">${getLevelStars(skill.level)}</span>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }

          <!-- Langues -->
          ${
            languages && languages.length > 0
              ? `
            <div class="section">
              <div class="section-title">Langues</div>
              ${languages
                .map(
                  (lang: any) => `
                <div class="language-item">
                  <span class="skill-name">${lang.name}</span>
                  <div>
                    <span class="badge">${lang.level}</span>
                    ${lang.certification ? `<div style="font-size: 10px; color: #666; margin-top: 2px;">${lang.certification}</div>` : ""}
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }
        </div>

        <!-- Centres d'intérêt -->
        ${
          interests && interests.length > 0
            ? `
          <div class="section">
            <div class="section-title">Centres d'Intérêt</div>
            <div class="interests">
              ${interests
                .map(
                  (interest: any) => `
                <div class="interest-item">
                  <strong>${interest.name}</strong>${interest.description ? ` - ${interest.description}` : ""}
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }
      </div>
    </body>
    </html>
  `;
}
