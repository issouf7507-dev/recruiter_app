"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";

import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Camera, Loader2, Pencil, Save } from "lucide-react";
import { cn } from "@/lib/utils";

import { useUserStore } from "@/store/userStore";

const formSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  telephone: z
    .string()
    .min(8, "Le numéro de téléphone doit contenir au moins 8 caractères"),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  dateNaissance: z.date().optional(),
  nationalite: z.string().optional(),
  situationFamiliale: z.string().optional(),
  permisConduire: z.string().optional(),
  bio: z.string().optional(),
  competences: z.array(z.string()).optional(),
  image: z.string().optional(),
  cv: z.string().optional(),
  letterm: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const InformationsPersonnellesPage = () => {
  const { candidat, loading: authLoading } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState<Date>();
  const [formLoading, setFormLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      telephone: "",
      adresse: "",
      ville: "",
      pays: "",
      nationalite: "",
      situationFamiliale: "",
      permisConduire: "",
      bio: "",
      competences: [],
      image: "",
      cv: "",
      letterm: "",
    },
  });

  // const { user } = useAuth();

  // console.log(user);

  useEffect(() => {
    if (candidat?.candidat) {
      const ucandidat = candidat?.candidat;
      reset({
        nom: ucandidat.nom || "",
        prenom: ucandidat.prenom || "",
        telephone: ucandidat.telephone || "",
        adresse: ucandidat.adresse || "",
        ville: ucandidat.ville || "",
        pays: ucandidat.pays || "",
        dateNaissance: ucandidat.dateNaissance
          ? new Date(ucandidat.dateNaissance)
          : undefined,
        nationalite: ucandidat.nationalite || "",
        situationFamiliale: ucandidat.situationFamiliale || "",
        permisConduire: ucandidat.permisConduire || "",
        bio: ucandidat.bio || "",
        image: ucandidat.image || "",
        competences: ucandidat.competences || [],
        cv: ucandidat.cv || "",
        letterm: ucandidat.letterm || "",
      });
      if (ucandidat.dateNaissance) {
        setDate(new Date(ucandidat.dateNaissance));
      }
      setFormLoading(false);
    }
  }, [candidat, reset]);

  const onSubmit = async (data: FormData) => {
    console.log(data);

    try {
      const response = await fetch("/api/candidat/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          dateNaissance: data.dateNaissance?.toISOString(),
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Profil mis à jour avec succès");
        setIsEditing(false);
        // Mettre à jour le store avec les nouvelles données
        if (candidat?.candidat) {
          useUserStore.setState({
            user: {
              ...candidat,
              candidat: {
                ...candidat.candidat,
                ...data,
                dateNaissance:
                  data.dateNaissance?.toISOString() ||
                  candidat.candidat.dateNaissance,
              },
            },
          });
        }
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleFileUpload = async (file: File, type: "cv" | "letterm") => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.url) {
        setValue(type, result.url);
        toast.success(
          `${type === "cv" ? "CV" : "Lettre de motivation"} uploadé avec succès`
        );
      } else {
        toast.error("Erreur lors de l'upload");
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || formLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Informations personnelles</h1>

        <div className="flex items-center gap-1">
          {isEditing && (
            <Button onClick={() => setIsEditing(false)}>Annuler</Button>
          )}

          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={() => {
              if (isEditing) {
                handleSubmit(onSubmit)();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={isSubmitting}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
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

      <Card>
        <CardContent className="p-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col md:flex-row gap-6"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage
                    src={watch("image") || "/placeholder-avatar.jpg"}
                  />
                  <AvatarFallback>
                    {watch("prenom")?.[0]}
                    {watch("nom")?.[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full"
                    type="button"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            const response = await fetch("/api/upload", {
                              method: "POST",
                              body: formData,
                            });
                            const data = await response.json();
                            if (data.url) {
                              setValue("image", data.url);
                            }
                          } catch (error) {
                            console.error("Erreur lors de l'upload:", error);
                          }
                        }
                      };
                      input.click();
                    }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {isEditing && (
                <Button variant="outline" size="sm" type="button">
                  Changer la photo
                </Button>
              )}
            </div>

            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    {...register("nom")}
                    disabled={!isEditing}
                    className={cn(errors.nom && "border-red-500")}
                  />
                  {errors.nom && (
                    <p className="text-sm text-red-500">{errors.nom.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    {...register("prenom")}
                    disabled={!isEditing}
                    className={cn(errors.prenom && "border-red-500")}
                  />
                  {errors.prenom && (
                    <p className="text-sm text-red-500">
                      {errors.prenom.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    {...register("telephone")}
                    disabled={!isEditing}
                    className={cn(errors.telephone && "border-red-500")}
                  />
                  {errors.telephone && (
                    <p className="text-sm text-red-500">
                      {errors.telephone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  {...register("adresse")}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ville">Ville</Label>
                  <Input
                    id="ville"
                    {...register("ville")}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pays">Pays</Label>
                  <Select
                    disabled={!isEditing}
                    onValueChange={(value) => setValue("pays", value)}
                    value={watch("pays")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionnez un pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CI">Côte d'Ivoire</SelectItem>
                      <SelectItem value="BF">Burkina Faso</SelectItem>
                      <SelectItem value="ML">Mali</SelectItem>
                      <SelectItem value="SN">Sénégal</SelectItem>
                      <SelectItem value="GN">Guinée</SelectItem>
                      <SelectItem value="TG">Togo</SelectItem>
                      <SelectItem value="BJ">Bénin</SelectItem>
                      <SelectItem value="NE">Niger</SelectItem>
                      <SelectItem value="CM">Cameroun</SelectItem>
                      <SelectItem value="FR">FR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date de naissance</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                        disabled={!isEditing}
                        type="button"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? (
                          format(date, "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => {
                          setDate(newDate);
                          setValue("dateNaissance", newDate || undefined);
                        }}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nationalite">Nationalité</Label>
                  <Input
                    id="nationalite"
                    {...register("nationalite")}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="situationFamiliale">
                    Situation familiale
                  </Label>
                  <Select
                    disabled={!isEditing}
                    value={watch("situationFamiliale")}
                    onValueChange={(value) =>
                      setValue("situationFamiliale", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celibataire">Célibataire</SelectItem>
                      <SelectItem value="marie">Marié(e)</SelectItem>
                      <SelectItem value="divorce">Divorcé(e)</SelectItem>
                      <SelectItem value="veuf">Veuf(ve)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permisConduire">Permis de conduire</Label>
                  <Select
                    disabled={!isEditing}
                    value={watch("permisConduire")}
                    onValueChange={(value) => setValue("permisConduire", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oui">Oui</SelectItem>
                      <SelectItem value="non">Non</SelectItem>
                      {/* <SelectItem value="Aucun">Aucun</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Compétences</Label>
                <Select
                  disabled={!isEditing}
                  onValueChange={(value) => {
                    const currentCompetences = watch("competences") || [];
                    if (!currentCompetences.includes(value)) {
                      setValue("competences", [...currentCompetences, value]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez vos compétences" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="nextjs">Next.js</SelectItem>
                    <SelectItem value="nodejs">Node.js</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                    <SelectItem value="sql">SQL</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                    <SelectItem value="git">Git</SelectItem>
                    <SelectItem value="docker">Docker</SelectItem>
                    <SelectItem value="aws">AWS</SelectItem>
                    <SelectItem value="uiux">UI/UX Design</SelectItem>
                    <SelectItem value="agile">Méthodologies Agiles</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {watch("competences")?.map((competence) => (
                    <div
                      key={competence}
                      className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md"
                    >
                      <span className="text-sm">
                        {competence.charAt(0).toUpperCase() +
                          competence.slice(1)}
                      </span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            const currentCompetences =
                              watch("competences") || [];
                            setValue(
                              "competences",
                              currentCompetences.filter((c) => c !== competence)
                            );
                          }}
                          className="text-primary hover:text-primary/80"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">À propos de moi</Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  disabled={!isEditing}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CV</Label>
                  <div className="flex items-center gap-2">
                    {watch("cv") ? (
                      <a
                        href={watch("cv")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Voir le CV
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Aucun CV</span>
                    )}
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        disabled={uploading}
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = ".pdf,.doc,.docx";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement)
                              .files?.[0];
                            if (file) {
                              handleFileUpload(file, "cv");
                            }
                          };
                          input.click();
                        }}
                      >
                        {uploading ? "Upload en cours..." : "Changer le CV"}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Lettre de motivation</Label>
                  <div className="flex items-center gap-2">
                    {watch("letterm") ? (
                      <a
                        href={watch("letterm")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Voir la lettre
                      </a>
                    ) : (
                      <span className="text-muted-foreground">
                        Aucune lettre
                      </span>
                    )}
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        disabled={uploading}
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = ".pdf,.doc,.docx";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement)
                              .files?.[0];
                            if (file) {
                              handleFileUpload(file, "letterm");
                            }
                          };
                          input.click();
                        }}
                      >
                        {uploading ? "Upload en cours..." : "Changer la lettre"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InformationsPersonnellesPage;
