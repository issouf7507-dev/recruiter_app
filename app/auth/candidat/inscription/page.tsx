"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { postData } from "@/utils/utilts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  Globe,
  Users,
  Car,
  MapPin,
  Loader2,
  Check,
  ChevronsUpDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signUp } from "@/lib/auth-client";
import { completeSignupCandidat } from "@/action/signup";

// Interface pour les pays
interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  cca3: string;
  flag: string;
}

const formSchema = z
  .object({
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string(),
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    telephone: z.string().min(8, "Numéro de téléphone invalide"),
    pays: z.string().min(1, "Veuillez sélectionner un pays"),
    dateNaissance: z.string().min(1, "Veuillez entrer votre date de naissance"),
    nationalite: z.string().min(1, "Veuillez entrer votre nationalité"),
    situationFamiliale: z
      .string()
      .min(1, "Veuillez sélectionner votre situation familiale"),
    permisConduire: z
      .string()
      .min(1, "Veuillez indiquer si vous avez le permis de conduire"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export default function Inscription() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    // resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      nom: "",
      prenom: "",
      telephone: "",
      pays: "",
      dateNaissance: "",
      nationalite: "",
      situationFamiliale: "",
      permisConduire: "",
    },
  });

  // Fonction pour charger les pays depuis l'API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoadingCountries(true);
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,flag"
        );

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des pays");
        }

        const data: Country[] = await response.json();

        // Trier les pays par nom commun
        const sortedCountries = data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common, "fr")
        );

        setCountries(sortedCountries);
      } catch (error) {
        console.error("Erreur lors du chargement des pays:", error);
        toast.error("Erreur lors du chargement de la liste des pays");

        // Fallback: pays par défaut en cas d'erreur
        const fallbackCountries: Country[] = [
          {
            name: {
              common: "Côte d'Ivoire",
              official: "République de Côte d'Ivoire",
            },
            cca2: "CI",
            cca3: "CIV",
            flag: "🇨🇮",
          },
          {
            name: { common: "France", official: "République française" },
            cca2: "FR",
            cca3: "FRA",
            flag: "🇫🇷",
          },
          {
            name: { common: "Sénégal", official: "République du Sénégal" },
            cca2: "SN",
            cca3: "SEN",
            flag: "🇸🇳",
          },
          {
            name: { common: "Mali", official: "République du Mali" },
            cca2: "ML",
            cca3: "MLI",
            flag: "🇲🇱",
          },
          {
            name: { common: "Burkina Faso", official: "Burkina Faso" },
            cca2: "BF",
            cca3: "BFA",
            flag: "🇧🇫",
          },
          {
            name: { common: "Canada", official: "Canada" },
            cca2: "CA",
            cca3: "CAN",
            flag: "🇨🇦",
          },
          {
            name: { common: "États-Unis", official: "États-Unis d'Amérique" },
            cca2: "US",
            cca3: "USA",
            flag: "🇺🇸",
          },
          {
            name: {
              common: "Allemagne",
              official: "République fédérale d'Allemagne",
            },
            cca2: "DE",
            cca3: "DEU",
            flag: "🇩🇪",
          },
          {
            name: { common: "Belgique", official: "Royaume de Belgique" },
            cca2: "BE",
            cca3: "BEL",
            flag: "🇧🇪",
          },
          {
            name: { common: "Suisse", official: "Confédération suisse" },
            cca2: "CH",
            cca3: "CHE",
            flag: "🇨🇭",
          },
        ];
        setCountries(fallbackCountries);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Fonction pour gérer la sélection d'un pays
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    form.setValue("pays", country.cca2);
    setOpen(false);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // setIsLoading(true);
      // const response = await postData(
      //   {
      //     ...values,
      //     type: "CANDIDAT",
      //   },
      //   "/api/auth/register/candidat"
      // );
      // if (response.success) {
      //   toast.success("Inscription réussie");
      //   router.push("/candidat/connexion");
      // } else {
      //   toast.error(response.message || "Erreur lors de l'inscription");
      // }

      const res = await signUp.email({
        email: values.email,
        password: values.password,
        name: values.nom + " " + values.prenom || "",
      });
      if (res.data) {
        await completeSignupCandidat({
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
          nom: values.nom,
          prenom: values.prenom,
          telephone: values.telephone,
          pays: values.pays,
          dateNaissance: values.dateNaissance,
          nationalite: values.nationalite,
          situationFamiliale: values.situationFamiliale,
          permisConduire: values.permisConduire,
          type: "CANDIDAT" as "CANDIDAT",
        });

        router.push("/auth/candidat/connexion");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Mobile: Full width, Desktop: Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-screen">
        {/* Form Section */}
        <div className="col-span-1 lg:col-span-2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <Card className="w-full max-w-4xl shadow-none border-0 lg:border">
            <CardHeader className="space-y-1 px-4 sm:px-6 lg:px-8 pt-6">
              <CardTitle className="text-xl sm:text-2xl font-bold text-center">
                Inscription
              </CardTitle>
              <CardDescription className="text-center text-sm sm:text-base">
                Créez votre compte candidat
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 lg:px-8 pb-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Nom, Prénom, Email - Responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="nom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4" />
                            Nom
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="prenom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4" />
                            Prénom
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Votre prénom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2 lg:col-span-1">
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="votre@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Téléphone - Full width */}
                  <FormField
                    control={form.control}
                    name="telephone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4" />
                          Téléphone
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Votre numéro de téléphone"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Mots de passe - Responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <Lock className="h-4 w-4" />
                            Mot de passe
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                                <span className="sr-only">
                                  {showPassword ? "Masquer" : "Afficher"} le mot
                                  de passe
                                </span>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <Lock className="h-4 w-4" />
                            Confirmer le mot de passe
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                                <span className="sr-only">
                                  {showConfirmPassword ? "Masquer" : "Afficher"}{" "}
                                  la confirmation du mot de passe
                                </span>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Date de naissance et Nationalité - Responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="dateNaissance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            Date de naissance
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nationalite"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <Globe className="h-4 w-4" />
                            Nationalité
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nationalité" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Pays, Situation familiale, Permis - Responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="pays"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4" />
                            Pays
                          </FormLabel>
                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={open}
                                  className="w-full justify-between"
                                  disabled={isLoadingCountries}
                                >
                                  {isLoadingCountries ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      Chargement des pays...
                                    </>
                                  ) : selectedCountry ? (
                                    <>
                                      <span className="mr-2">
                                        {selectedCountry.flag}
                                      </span>
                                      {selectedCountry.name.common}
                                    </>
                                  ) : (
                                    "Sélectionnez votre pays"
                                  )}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-full p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput placeholder="Rechercher un pays..." />
                                <CommandList className="max-h-60">
                                  <CommandEmpty>
                                    Aucun pays trouvé.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {countries.map((country) => (
                                      <CommandItem
                                        key={country.cca2}
                                        value={`${country.name.common} ${country.name.official}`}
                                        onSelect={() =>
                                          handleCountrySelect(country)
                                        }
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedCountry?.cca2 ===
                                              country.cca2
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        <span className="mr-2">
                                          {country.flag}
                                        </span>
                                        {country.name.common}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="situationFamiliale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4" />
                            Situation familiale
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez votre situation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="celibataire">
                                Célibataire
                              </SelectItem>
                              <SelectItem value="marie">Marié(e)</SelectItem>
                              <SelectItem value="divorce">
                                Divorcé(e)
                              </SelectItem>
                              <SelectItem value="veuf">Veuf(ve)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="permisConduire"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2 lg:col-span-1">
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <Car className="h-4 w-4" />
                            Permis de conduire
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue placeholder="Avez-vous le permis ?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="oui">Oui</SelectItem>
                              <SelectItem value="non">Non</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Inscription..." : "S'inscrire"}
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm">
                <span className="text-gray-600">Déjà un compte ? </span>
                <Link
                  href="/candidat/connexion"
                  className="text-primary hover:underline"
                >
                  Se connecter
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Background Section - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block col-span-1 bg-primary"></div>
      </div>
    </div>
  );
}
