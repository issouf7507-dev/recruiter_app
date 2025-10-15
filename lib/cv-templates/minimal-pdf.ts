export function generateMinimalistCVHTML(cv: any): string {
  const {
    personalInfo,
    experiences,
    educations,
    skills,
    languages,
    interests,
  } = cv;

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const formatDateRange = (
    startDate: string,
    endDate?: string,
    isCurrent?: boolean
  ) => {
    const start = formatDate(startDate);
    if (isCurrent) return `${start} - Present`;
    if (endDate) return `${start} - ${formatDate(endDate)}`;
    return start;
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
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
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          display: flex;
          background: white;
        }
        
        .sidebar {
          width: 33.33%;
          background: #2d3748;
          color: white;
          padding: 30px 25px;
          display: flex;
          flex-direction: column;
        }
        
        .main-content {
          flex: 1;
          padding: 30px 25px;
          background: white;
        }
        
        .profile-image {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          margin: 0 auto 30px;
          overflow: hidden;
          background: #4a5568;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .profile-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .profile-initials {
          font-size: 36px;
          font-weight: bold;
          color: white;
        }
        
        .sidebar h3 {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 15px;
          color: white;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .contact-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
          font-size: 11px;
        }
        
        .contact-icon {
          width: 16px;
          height: 16px;
          margin-right: 12px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .education-item, .skill-item {
          margin-bottom: 20px;
        }
        
        .education-title {
          font-weight: bold;
          color: white;
          margin-bottom: 4px;
          font-size: 11px;
          text-transform: uppercase;
        }
        
        .education-subtitle {
          color: #cbd5e0;
          margin-bottom: 4px;
          font-size: 10px;
        }
        
        .education-date {
          color: #a0aec0;
          font-size: 9px;
        }
        
        .skill-name {
          color: white;
          font-weight: 500;
          margin-bottom: 6px;
          font-size: 11px;
        }
        
        .skill-bar {
          width: 100%;
          height: 4px;
          background: #4a5568;
          border-radius: 2px;
          overflow: hidden;
        }
        
        .skill-progress {
          height: 100%;
          background: white;
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        
        .main-header {
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 25px;
          margin-bottom: 30px;
        }
        
        .name {
          font-size: 36px;
          font-weight: bold;
          color: #2d3748;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .job-title {
          font-size: 18px;
          color: #718096;
          font-weight: 300;
          margin-bottom: 15px;
        }
        
        .summary {
          font-size: 11px;
          color: #4a5568;
          line-height: 1.6;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #2d3748;
          margin-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .experience-item {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        
        .experience-title {
          font-weight: bold;
          color: #2d3748;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        
        .experience-meta {
          font-size: 10px;
          color: #718096;
          margin-bottom: 12px;
        }
        
        .experience-description {
          font-size: 11px;
          color: #4a5568;
          line-height: 1.6;
          margin-bottom: 10px;
        }
        
        .experience-achievements {
          font-size: 11px;
          color: #4a5568;
          line-height: 1.6;
        }
        
        .experience-achievements ul {
          margin-left: 15px;
        }
        
        .experience-achievements li {
          margin-bottom: 4px;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .cv-container {
            margin: 0;
            box-shadow: none;
          }
          
          .experience-item {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="cv-container">
        <!-- Sidebar -->
        <div class="sidebar">
          <!-- Photo de profil -->
          <div class="profile-image">
            ${
              personalInfo?.profileImage
                ? `<img src="${personalInfo.profileImage}" alt="Profile" />`
                : `<div class="profile-initials">
                     ${personalInfo?.firstName?.[0] || "F"}${personalInfo?.lastName?.[0] || "L"}
                   </div>`
            }
          </div>

          <!-- Contact -->
          <div style="margin-bottom: 30px;">
            <h3>Contact</h3>
            ${
              personalInfo?.phone
                ? `
              <div class="contact-item">
                <div class="contact-icon">📞</div>
                <span>${personalInfo.phone}</span>
              </div>
            `
                : ""
            }
            ${
              personalInfo?.email
                ? `
              <div class="contact-item">
                <div class="contact-icon">✉️</div>
                <span>${personalInfo.email}</span>
              </div>
            `
                : ""
            }
            ${
              personalInfo?.linkedin
                ? `
              <div class="contact-item">
                <div class="contact-icon">💼</div>
                <span>LinkedIn.com/in/Username</span>
              </div>
            `
                : ""
            }
            ${
              personalInfo?.city || personalInfo?.address
                ? `
              <div class="contact-item">
                <div class="contact-icon">📍</div>
                <div>
                  ${personalInfo?.address ? `<div>${personalInfo.address}</div>` : ""}
                  <div>${[personalInfo?.city, personalInfo?.country].filter(Boolean).join(", ")}</div>
                </div>
              </div>
            `
                : ""
            }
          </div>

          <!-- Education -->
          ${
            educations && educations.length > 0
              ? `
            <div style="margin-bottom: 30px;">
              <h3>Education</h3>
              ${educations
                .map(
                  (edu: any) => `
                <div class="education-item">
                  <div class="education-title">${edu.institution?.toUpperCase() || ""}</div>
                  <div class="education-subtitle">${edu.field || edu.degree || ""}</div>
                  <div class="education-date">${formatDateRange(edu.startDate, edu.endDate, edu.isCurrent)}</div>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }

          <!-- Skills -->
          ${
            skills && skills.length > 0
              ? `
            <div>
              <h3>Skills</h3>
              ${skills
                .map(
                  (skill: any) => `
                <div class="skill-item">
                  <div class="skill-name">${skill.name}</div>
                  <div class="skill-bar">
                    <div class="skill-progress" style="width: ${(skill.level / 5) * 100}%"></div>
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

        <!-- Main Content -->
        <div class="main-content">
          <!-- Header -->
          <div class="main-header">
            <h1 class="name">
              ${personalInfo?.firstName?.toUpperCase() || "FIRST NAME"} ${personalInfo?.lastName?.toUpperCase() || "LAST NAME"}
            </h1>
            <h2 class="job-title">${personalInfo?.jobTitle || "Architect"}</h2>
            ${
              personalInfo?.summary
                ? `<p class="summary">${personalInfo.summary}</p>`
                : ""
            }
          </div>

          <!-- Experience -->
          ${
            experiences && experiences.length > 0
              ? `
            <div>
              <h3 class="section-title">Experience</h3>
              ${experiences
                .map(
                  (exp: any) => `
                <div class="experience-item">
                  <h4 class="experience-title">${exp.position}</h4>
                  <div class="experience-meta">
                    ${exp.company} | ${exp.location || ""} | ${formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                  </div>
                  ${
                    exp.description
                      ? `<p class="experience-description">${exp.description}</p>`
                      : ""
                  }
                  ${
                    exp.achievements
                      ? `
                    <div class="experience-achievements">
                      <ul>
                        ${exp.achievements
                          .split("\n")
                          .filter((item: string) => item.trim())
                          .map(
                            (achievement: string) =>
                              `<li>${achievement.trim()}</li>`
                          )
                          .join("")}
                      </ul>
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
        </div>
      </div>
    </body>
    </html>
  `;
}
