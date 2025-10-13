"use client";

import React from "react";
import { Mail, Phone, MapPin, Linkedin } from "lucide-react";

interface CVData {
  personalInfo?: any;
  experiences?: any[];
  educations?: any[];
  skills?: any[];
  languages?: any[];
  interests?: any[];
}

interface MinimalistTemplateProps {
  cvData: CVData;
}

export default function MinimalistTemplate({
  cvData,
}: MinimalistTemplateProps) {
  const { personalInfo, experiences, educations, skills } = cvData;

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

  return (
    <div
      className="w-full max-w-[600px] mx-auto bg-white shadow-2xl  rounded-xl overflow-hidden"
      style={{
        minHeight: "800px",
        transform: "scale(1.3)",
        transformOrigin: "top center",
      }}
    >
      <div className="flex h-full">
        {/* Sidebar gauche - Gris foncé */}
        <div className="w-1/3 bg-gray-800 text-white p-6 flex flex-col">
          {/* Photo de profil */}
          <div className="mb-8 flex justify-center">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
              {personalInfo?.profileImage ? (
                <img
                  src={personalInfo.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {personalInfo?.firstName?.[0]}
                    {personalInfo?.lastName?.[0]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 text-white">CONTACT</h3>
            <div className="space-y-3 text-sm">
              {personalInfo?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span className="break-all">{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="break-all">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo?.linkedin && (
                <div className="flex items-center gap-3">
                  <Linkedin className="h-4 w-4 flex-shrink-0" />
                  <span className="break-all">LinkedIn.com/in/Username</span>
                </div>
              )}
              {(personalInfo?.city || personalInfo?.address) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    {personalInfo?.address && <div>{personalInfo.address}</div>}
                    <div>
                      {[personalInfo?.city, personalInfo?.country]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          {educations && educations.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 text-white">EDUCATION</h3>
              <div className="space-y-4">
                {educations.map((edu, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-semibold text-white mb-1">
                      {edu.institution?.toUpperCase()}
                    </div>
                    <div className="text-gray-300 mb-1">
                      {edu.field || edu.degree}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {formatDateRange(
                        edu.startDate,
                        edu.endDate,
                        edu.isCurrent
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">SKILLS</h3>
              <div className="space-y-3">
                {skills.map((skill, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-medium">
                        {skill.name}
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-1">
                      <div
                        className="bg-white h-1 rounded-full transition-all duration-300"
                        style={{ width: `${(skill.level / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contenu principal - Blanc */}
        <div className="flex-1 p-6">
          {/* Header avec nom et titre */}
          <div className="mb-8 border-b border-gray-300 pb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              {personalInfo?.firstName?.toUpperCase() || "FIRST NAME"}{" "}
              {personalInfo?.lastName?.toUpperCase() || "LAST NAME"}
            </h1>
            <h2 className="text-xl text-gray-600 font-light">
              {personalInfo?.jobTitle || "Architect"}
            </h2>
            {personalInfo?.summary && (
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                {personalInfo.summary}
              </p>
            )}
          </div>

          {/* Experience */}
          {experiences && experiences.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-300 pb-2">
                EXPERIENCE
              </h3>
              <div className="space-y-6">
                {experiences.map((exp, index) => (
                  <div key={index}>
                    <div className="mb-2">
                      <h4 className="font-bold text-gray-800 text-sm uppercase">
                        {exp.position}
                      </h4>
                      <div className="text-sm text-gray-600 mb-1">
                        {exp.company} | {exp.location} |{" "}
                        {formatDateRange(
                          exp.startDate,
                          exp.endDate,
                          exp.isCurrent
                        )}
                      </div>
                    </div>

                    {exp.description && (
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                        {exp.description}
                      </p>
                    )}

                    {exp.achievements && (
                      <div className="text-sm text-gray-700">
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          {exp.achievements
                            .split("\n")
                            .filter((item: string) => item.trim())
                            .map((achievement: string, i: number) => (
                              <li key={i} className="leading-relaxed">
                                {achievement.trim()}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message si CV vide */}
          {!personalInfo?.firstName &&
            !experiences?.length &&
            !educations?.length && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-3">✨</div>
                <p className="text-sm font-medium mb-2 text-gray-600">
                  Aperçu de votre CV Minimaliste
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Remplissez les sections à gauche pour voir votre CV prendre
                  forme en temps réel
                </p>
                <div className="mt-4 flex justify-center">
                  <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                    Commencez par vos informations personnelles →
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
