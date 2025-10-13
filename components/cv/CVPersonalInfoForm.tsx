"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, User } from "lucide-react";

interface PersonalInfo {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  dateOfBirth?: string;
  nationality?: string;
  maritalStatus?: string;
  drivingLicense?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  profileImage?: string;
  summary?: string;
}

interface CVPersonalInfoFormProps {
  data?: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export default function CVPersonalInfoForm({
  data = {},
  onChange,
}: CVPersonalInfoFormProps) {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleChange("profileImage", result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Informations personnelles
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Renseignez vos informations de base qui apparaîtront sur votre CV
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo de profil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Photo de profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                {data.profileImage ? (
                  <img
                    src={data.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-image"
                />
                <Label htmlFor="profile-image">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Choisir une photo
                    </span>
                  </Button>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations de base */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations de base</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={data.firstName || ""}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={data.lastName || ""}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Votre nom"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="jobTitle">Titre professionnel</Label>
                <Input
                  id="jobTitle"
                  value={data.jobTitle || ""}
                  onChange={(e) => handleChange("jobTitle", e.target.value)}
                  placeholder="Architecte, Développeur, Designer..."
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="votre.email@exemple.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={data.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date de naissance</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={
                    data.dateOfBirth
                      ? new Date(data.dateOfBirth).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    handleChange(
                      "dateOfBirth",
                      e.target.value
                        ? new Date(e.target.value).toISOString()
                        : ""
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="nationality">Nationalité</Label>
                <Input
                  id="nationality"
                  value={data.nationality || ""}
                  onChange={(e) => handleChange("nationality", e.target.value)}
                  placeholder="Française"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adresse */}
      <Card>
        <CardHeader>
          <CardTitle>Adresse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={data.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="123 Rue de la Paix"
              />
            </div>
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={data.city || ""}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Paris"
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Code postal</Label>
              <Input
                id="postalCode"
                value={data.postalCode || ""}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                placeholder="75001"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                value={data.country || ""}
                onChange={(e) => handleChange("country", e.target.value)}
                placeholder="France"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations complémentaires */}
      <Card>
        <CardHeader>
          <CardTitle>Informations complémentaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maritalStatus">Situation familiale</Label>
              <Input
                id="maritalStatus"
                value={data.maritalStatus || ""}
                onChange={(e) => handleChange("maritalStatus", e.target.value)}
                placeholder="Célibataire, Marié(e), etc."
              />
            </div>
            <div>
              <Label htmlFor="drivingLicense">Permis de conduire</Label>
              <Input
                id="drivingLicense"
                value={data.drivingLicense || ""}
                onChange={(e) => handleChange("drivingLicense", e.target.value)}
                placeholder="Permis B"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liens professionnels */}
      <Card>
        <CardHeader>
          <CardTitle>Liens professionnels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                value={data.website || ""}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://monsite.com"
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={data.linkedin || ""}
                onChange={(e) => handleChange("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/monprofil"
              />
            </div>
            <div>
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                value={data.github || ""}
                onChange={(e) => handleChange("github", e.target.value)}
                placeholder="https://github.com/monprofil"
              />
            </div>
            <div>
              <Label htmlFor="portfolio">Portfolio</Label>
              <Input
                id="portfolio"
                value={data.portfolio || ""}
                onChange={(e) => handleChange("portfolio", e.target.value)}
                placeholder="https://monportfolio.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé professionnel */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé professionnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="summary">
              Décrivez brièvement votre profil professionnel
            </Label>
            <Textarea
              id="summary"
              value={data.summary || ""}
              onChange={(e) => handleChange("summary", e.target.value)}
              placeholder="Développeur full-stack passionné avec 5 ans d'expérience dans la création d'applications web modernes..."
              rows={4}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-2">
              Ce résumé apparaîtra en haut de votre CV pour présenter votre
              profil
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
