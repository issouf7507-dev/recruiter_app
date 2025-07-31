"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save } from "lucide-react";

type CompanyProfile = {
  name: string;
  logo: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  social: {
    linkedin: string;
    twitter: string;
  };
};

const initialProfile: CompanyProfile = {
  name: "TechCorp",
  logo: "/logos/techcorp.png",
  description:
    "Une entreprise innovante spécialisée dans le développement de solutions technologiques de pointe.",
  industry: "Technologie",
  size: "50-200 employés",
  location: "Paris, France",
  website: "https://techcorp.com",
  email: "contact@techcorp.com",
  phone: "+33 1 23 45 67 89",
  social: {
    linkedin: "https://linkedin.com/company/techcorp",
    twitter: "https://twitter.com/techcorp",
  },
};

export default function ProfilPage() {
  const [profile, setProfile] = useState<CompanyProfile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Ici, vous implémenteriez la sauvegarde des données
    console.log("Sauvegarde du profil:", profile);
    setIsEditing(false);
  };

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto h-full ">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profil de l'entreprise</h1>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </>
          ) : (
            "Modifier"
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informations principales */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de l'entreprise</Label>
              <Input
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={profile.description}
                onChange={(e) =>
                  setProfile({ ...profile, description: e.target.value })
                }
                disabled={!isEditing}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Secteur d'activité</Label>
                <Input
                  value={profile.industry}
                  onChange={(e) =>
                    setProfile({ ...profile, industry: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label>Taille</Label>
                <Input
                  value={profile.size}
                  onChange={(e) =>
                    setProfile({ ...profile, size: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Localisation</Label>
              <Input
                value={profile.location}
                onChange={(e) =>
                  setProfile({ ...profile, location: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo et contacts */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile.logo} />
                  <AvatarFallback>
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Changer le logo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Site web</Label>
                <Input
                  value={profile.website}
                  onChange={(e) =>
                    setProfile({ ...profile, website: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Réseaux sociaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input
                  value={profile.social.linkedin}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      social: { ...profile.social, linkedin: e.target.value },
                    })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label>Twitter</Label>
                <Input
                  value={profile.social.twitter}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      social: { ...profile.social, twitter: e.target.value },
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
