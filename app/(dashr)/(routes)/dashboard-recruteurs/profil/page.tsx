"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { useSession } from "@/lib/auth-client";

type CompanyProfile = {
  name: string;
  entreprise: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  logo: string;
  social: {
    linkedin: string;
    twitter: string;
  };
};

const initialProfile: CompanyProfile = {
  name: "",
  entreprise: "",
  description: "",
  industry: "",
  size: "",
  location: "",
  website: "",
  email: "",
  phone: "",
  logo: "",
  social: {
    linkedin: "",
    twitter: "",
  },
};

export default function ProfilPage() {
  const [profile, setProfile] = useState<CompanyProfile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { data: session } = useSession();

  // Charger les données du profil
  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/recruteur/profil");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfile(data.data);
          // window.location.reload();
        }
      } else {
        toast.error("Erreur lors du chargement du profil");
      }
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
      toast.error("Erreur lors du chargement du profil");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/recruteur/profil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          entreprise: profile.entreprise,
          description: profile.description,
          industry: profile.industry,
          size: profile.size,
          location: profile.location,
          website: profile.website,
          email: profile.email,
          phone: profile.phone,
          logo: profile.logo,
          linkedin: profile.social.linkedin,
          twitter: profile.social.twitter,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success("Profil mis à jour avec succès");
          setIsEditing(false);
        } else {
          toast.error("Erreur lors de la mise à jour");
        }
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profil de l'entreprise</h1>
        <div className="flex items-center gap-2">
          {isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
          )}
          <Button
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informations principales */}
        <Card className="md:col-span-2 shadow-none">
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
                placeholder="Nom de votre entreprise"
              />
            </div>

            <div className="space-y-2">
              <Label>Nom commercial (optionnel)</Label>
              <Input
                value={profile.entreprise}
                onChange={(e) =>
                  setProfile({ ...profile, entreprise: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Nom commercial si différent"
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
                placeholder="Décrivez votre entreprise, ses valeurs, sa mission..."
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
                  placeholder="Ex: Technologie, Santé, Finance..."
                />
              </div>

              <div className="space-y-2">
                <Label>Taille de l'entreprise</Label>
                <Input
                  value={profile.size}
                  onChange={(e) =>
                    setProfile({ ...profile, size: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="Ex: 50-200 employés"
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
                placeholder="Ville, Pays"
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo et contacts */}
        <div className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage
                      src={profile.logo || "/placeholder-avatar.jpg"}
                      alt="Logo de l'entreprise"
                    />
                    <AvatarFallback className="text-2xl">
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "LOGO"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <ImageUpload
                      onUpload={(url) => setProfile({ ...profile, logo: url })}
                      currentUrl={profile.logo}
                      disabled={isSaving}
                      successMessage="Logo mis à jour avec succès"
                    />
                  )}
                </div>
                {isEditing && (
                  <div className="w-full">
                    <ImageUpload
                      variant="button"
                      onUpload={(url) => setProfile({ ...profile, logo: url })}
                      currentUrl={profile.logo}
                      disabled={isSaving}
                      uploadText="Changer le logo"
                      successMessage="Logo mis à jour avec succès"
                    />
                  </div>
                )}
                {!isEditing && profile.logo && (
                  <p className="text-sm text-muted-foreground text-center">
                    Logo de l'entreprise
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
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
                  placeholder="https://votre-site.com"
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
                  placeholder="contact@ylsix-rh.com"
                  type="email"
                  readOnly={true}
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
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
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
                  placeholder="https://linkedin.com/company/votre-entreprise"
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
                  placeholder="https://twitter.com/votre-entreprise"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
