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
import {
  CalendarIcon,
  Camera,
  Loader2,
  Pencil,
  Save,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { FileUpload } from "@/components/ui/file-upload";
import { ImageUpload } from "@/components/ui/image-upload";
import { useSession } from "@/lib/auth-client";
import { useCandidatProfile } from "@/hooks/useCandidatProfile";

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
  const { data: session, isPending } = useSession();
  const {
    profile,
    isLoading: profileLoading,
    updateProfile,
    isUpdating,
  } = useCandidatProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState<Date>();
  const [customCompetence, setCustomCompetence] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    // resolver: zodResolver(formSchema),
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

  useEffect(() => {
    if (profile) {
      reset({
        nom: profile.nom || "",
        prenom: profile.prenom || "",
        telephone: profile.telephone || "",
        adresse: profile.adresse || "",
        ville: profile.ville || "",
        pays: profile.pays || "",
        dateNaissance: profile.dateNaissance
          ? new Date(profile.dateNaissance)
          : undefined,
        nationalite: profile.nationalite || "",
        situationFamiliale: profile.situationFamiliale || "",
        permisConduire: profile.permisConduire || "",
        bio: profile.bio || "",
        image: profile.image || "",
        competences: profile.competences || [],
        cv: profile.cv || "",
        letterm: profile.letterm || "",
      });
      if (profile.dateNaissance) {
        setDate(new Date(profile.dateNaissance));
      }
    }
  }, [profile, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await updateProfile(data);
      toast.success("Profil mis à jour avec succès");
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (isPending || profileLoading) {
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
            disabled={isUpdating}
          >
            {isEditing ? (
              <>
                {!isUpdating && <Save className="h-4 w-4 mr-2" />}
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement
                  </>
                ) : (
                  "Enregistrer"
                )}
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
                  <ImageUpload
                    onUpload={(url) => setValue("image", url)}
                    currentUrl={watch("image")}
                  />
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
                <div className="space-y-3">
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
                      <SelectItem value="agile">
                        Méthodologies Agiles
                      </SelectItem>
                      <SelectItem value="canva">Canva</SelectItem>
                      <SelectItem value="rédaction">Rédaction</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Ajout de compétence personnalisée */}
                  {isEditing && (
                    <div className="space-y-2">
                      {!showCustomInput ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCustomInput(true)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter une compétence personnalisée
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Entrez votre compétence"
                            value={customCompetence}
                            onChange={(e) =>
                              setCustomCompetence(e.target.value)
                            }
                            onKeyPress={(e) => {
                              if (
                                e.key === "Enter" &&
                                customCompetence.trim()
                              ) {
                                const currentCompetences =
                                  watch("competences") || [];
                                if (
                                  !currentCompetences.includes(
                                    customCompetence.trim().toLowerCase()
                                  )
                                ) {
                                  setValue("competences", [
                                    ...currentCompetences,
                                    customCompetence.trim().toLowerCase(),
                                  ]);
                                }
                                setCustomCompetence("");
                                setShowCustomInput(false);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              if (customCompetence.trim()) {
                                const currentCompetences =
                                  watch("competences") || [];
                                if (
                                  !currentCompetences.includes(
                                    customCompetence.trim().toLowerCase()
                                  )
                                ) {
                                  setValue("competences", [
                                    ...currentCompetences,
                                    customCompetence.trim().toLowerCase(),
                                  ]);
                                }
                                setCustomCompetence("");
                                setShowCustomInput(false);
                              }
                            }}
                          >
                            Ajouter
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCustomCompetence("");
                              setShowCustomInput(false);
                            }}
                          >
                            Annuler
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Affichage des compétences */}
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
                  {isEditing ? (
                    <FileUpload
                      onUpload={(fileData) => setValue("cv", fileData.fileUrl)}
                      buttonText="Changer le CV"
                      accept=".pdf,.doc,.docx"
                      multiple={false}
                      currentFileUrl={watch("cv")}
                    />
                  ) : (
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
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Lettre de motivation</Label>
                  {isEditing ? (
                    <FileUpload
                      onUpload={(fileData) =>
                        setValue("letterm", fileData.fileUrl)
                      }
                      buttonText="Changer la lettre"
                      accept=".pdf,.doc,.docx"
                      multiple={false}
                      currentFileUrl={watch("letterm")}
                    />
                  ) : (
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
                    </div>
                  )}
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
