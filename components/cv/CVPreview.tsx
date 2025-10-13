"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Calendar,
  Award,
  User,
} from "lucide-react";
import MinimalistTemplate from "./templates/MinimalistTemplate";

interface CVData {
  id?: string;
  title: string;
  templateId: string;
  personalInfo?: any;
  experiences?: any[];
  educations?: any[];
  skills?: any[];
  languages?: any[];
  interests?: any[];
  customSections?: any[];
}

interface CVTemplate {
  id: string;
  name: string;
  description?: string;
  layout: string;
  colors?: any;
  fonts?: any;
}

interface CVPreviewProps {
  cvData: CVData;
  template?: CVTemplate;
}

export default function CVPreview({ cvData, template }: CVPreviewProps) {
  // Si c'est le template minimaliste, utiliser le composant dédié
  if (
    template?.layout === "minimal" ||
    cvData.templateId === "template_minimal"
  ) {
    return <MinimalistTemplate cvData={cvData} />;
  }

  const {
    personalInfo,
    experiences,
    educations,
    skills,
    languages,
    interests,
  } = cvData;

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

  return (
    <div className="w-full max-w-[600px] mx-auto bg-white shadow-2xl rounded-xl overflow-hidden">
      <div
        className="p-8 space-y-8"
        style={{
          fontSize: "16px",
          lineHeight: "1.5",
          transform: "scale(1.3)",
          transformOrigin: "top center",
        }}
      >
        {/* En-tête avec informations personnelles */}
        <div
          className="text-center border-b pb-6"
          style={{ borderColor: colors.accent }}
        >
          {personalInfo?.profileImage && (
            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
              <img
                src={personalInfo.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: colors.primary }}
          >
            {personalInfo?.firstName || "Prénom"}{" "}
            {personalInfo?.lastName || "Nom"}
          </h1>

          {personalInfo?.summary && (
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              {personalInfo.summary}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
            {personalInfo?.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {personalInfo.email}
              </div>
            )}
            {personalInfo?.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {personalInfo.phone}
              </div>
            )}
            {(personalInfo?.city || personalInfo?.country) && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[personalInfo?.city, personalInfo?.country]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            )}
            {personalInfo?.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {personalInfo.website}
              </div>
            )}
            {personalInfo?.linkedin && (
              <div className="flex items-center gap-1">
                <Linkedin className="h-3 w-3" />
                LinkedIn
              </div>
            )}
            {personalInfo?.github && (
              <div className="flex items-center gap-1">
                <Github className="h-3 w-3" />
                GitHub
              </div>
            )}
          </div>
        </div>

        {/* Expériences professionnelles */}
        {experiences && experiences.length > 0 && (
          <div>
            <h2
              className="text-lg font-bold mb-3 pb-1 border-b"
              style={{ color: colors.primary, borderColor: colors.accent }}
            >
              EXPÉRIENCE PROFESSIONNELLE
            </h2>
            <div className="space-y-4">
              {experiences.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-sm">{exp.position}</h3>
                      <p
                        className="text-sm"
                        style={{ color: colors.secondary }}
                      >
                        {exp.company}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(exp.startDate)}
                        {exp.isCurrent
                          ? " - Aujourd'hui"
                          : exp.endDate
                            ? ` - ${formatDate(exp.endDate)}`
                            : ""}
                      </div>
                      {exp.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {exp.location}
                        </div>
                      )}
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-xs text-gray-700 mb-2">
                      {exp.description}
                    </p>
                  )}
                  {exp.achievements && (
                    <p className="text-xs text-gray-700 mb-2">
                      <strong>Réalisations :</strong> {exp.achievements}
                    </p>
                  )}
                  {exp.skills && exp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {exp.skills.map((skill: string, skillIndex: number) => (
                        <Badge
                          key={skillIndex}
                          variant="secondary"
                          className="text-xs px-2 py-0"
                          style={{ backgroundColor: colors.accent }}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formation */}
        {educations && educations.length > 0 && (
          <div>
            <h2
              className="text-lg font-bold mb-3 pb-1 border-b"
              style={{ color: colors.primary, borderColor: colors.accent }}
            >
              FORMATION
            </h2>
            <div className="space-y-3">
              {educations.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-sm">{edu.degree}</h3>
                      <p
                        className="text-sm"
                        style={{ color: colors.secondary }}
                      >
                        {edu.institution}
                      </p>
                      {edu.field && (
                        <p className="text-xs text-gray-600">{edu.field}</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(edu.startDate)}
                        {edu.isCurrent
                          ? " - En cours"
                          : edu.endDate
                            ? ` - ${formatDate(edu.endDate)}`
                            : ""}
                      </div>
                      {edu.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {edu.location}
                        </div>
                      )}
                    </div>
                  </div>
                  {(edu.grade || edu.honors) && (
                    <div className="flex gap-2 mt-1">
                      {edu.grade && (
                        <Badge variant="outline" className="text-xs">
                          {edu.grade}
                        </Badge>
                      )}
                      {edu.honors && (
                        <Badge variant="outline" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {edu.honors}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Compétences */}
          {skills && skills.length > 0 && (
            <div>
              <h2
                className="text-lg font-bold mb-3 pb-1 border-b"
                style={{ color: colors.primary, borderColor: colors.accent }}
              >
                COMPÉTENCES
              </h2>
              <div className="space-y-2">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(skill.level / 5) * 100}%`,
                            backgroundColor: colors.primary,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {getLevelStars(skill.level)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Langues */}
          {languages && languages.length > 0 && (
            <div>
              <h2
                className="text-lg font-bold mb-3 pb-1 border-b"
                style={{ color: colors.primary, borderColor: colors.accent }}
              >
                LANGUES
              </h2>
              <div className="space-y-2">
                {languages.map((language, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm font-medium">{language.name}</span>
                    <div className="text-right">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{ backgroundColor: colors.accent }}
                      >
                        {language.level}
                      </Badge>
                      {language.certification && (
                        <p className="text-xs text-gray-500 mt-1">
                          {language.certification}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Centres d'intérêt */}
        {interests && interests.length > 0 && (
          <div>
            <h2
              className="text-lg font-bold mb-3 pb-1 border-b"
              style={{ color: colors.primary, borderColor: colors.accent }}
            >
              CENTRES D'INTÉRÊT
            </h2>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{interest.name}</span>
                  {interest.description && (
                    <span className="text-gray-600">
                      {" "}
                      - {interest.description}
                    </span>
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
              <div className="text-3xl mb-3">📋</div>
              <p className="text-sm font-medium mb-2 text-gray-600">
                Aperçu de votre CV
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Remplissez les sections à gauche pour voir votre CV prendre
                forme en temps réel
              </p>
              <div className="mt-3 flex justify-center">
                <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                  Commencez par choisir un modèle →
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
