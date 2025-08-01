import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Search as SearchIcon,
  Check,
  ChevronsUpDown,
  Redo2,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { JobOffer, AlerteNotificationType } from "@/types/types";
import { cn } from "@/lib/utils";

// import {
//   CompetenceAutocomplete,
//   type Competence,
// } from "@/app/components/ui/competence-autocomplete";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postData } from "@/utils/utilts";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSalary } from "@/utils/utilts";
import { toast } from "sonner";
import CompetenceAutocomplete from "../ui/competence-autocomplete";

interface AdvancedSearchProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (results: JobOffer[]) => void;
  allOffers: JobOffer[];
}

interface SearchQuery {
  title: string;
  company: string;
  location: string;
  skills: string;
  experience: string;
  salaryRange: string;
}

interface Competence {
  value: string;
  label: string;
}

const advancedSearchSchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  experience: z.string().optional(),
  salaryRange: z.string().optional(),
  type: z.string().optional(),
});

type AdvancedSearchForm = z.infer<typeof advancedSearchSchema>;

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  isOpen,
  onOpenChange,
  onSearch,
  allOffers,
}) => {
  const [searchResults, setSearchResults] = React.useState<JobOffer[]>([]);
  const [selectedCompetences, setSelectedCompetences] = React.useState<
    string[]
  >([]);
  const [hasSearched, setHasSearched] = React.useState(false);

  const form = useForm<AdvancedSearchForm>({
    resolver: zodResolver(advancedSearchSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      experience: "all",
      salaryRange: "all",
      type: "all",
    },
  });

  const competences: Competence[] = [
    { value: "JavaScript", label: "JavaScript" },
    { value: "TypeScript", label: "TypeScript" },
    { value: "React", label: "React" },
    { value: "Next.js", label: "Next.js" },
    { value: "Node.js", label: "Node.js" },
    { value: "Python", label: "Python" },
    { value: "Java", label: "Java" },
    { value: "PHP", label: "PHP" },
    { value: "SQL", label: "SQL" },
    { value: "MongoDB", label: "MongoDB" },
    { value: "Git", label: "Git" },
    { value: "Docker", label: "Docker" },
    { value: "AWS", label: "AWS" },
    { value: "UI/UX Design", label: "UI/UX Design" },
    { value: "Méthodologies Agiles", label: "Méthodologies Agiles" },
    { value: "Canva", label: "Canva" },
    { value: "Rédaction", label: "Rédaction" },
    { value: "PostgreSQL", label: "PostgreSQL" },
    { value: "Figma", label: "Figma" },
    { value: "Adobe XD", label: "Adobe XD" },
    { value: "Design Thinking", label: "Design Thinking" },
    { value: "Gestion de projet", label: "Gestion de projet" },
    { value: "Scrum", label: "Scrum" },
    { value: "JIRA", label: "JIRA" },
    { value: "Linux", label: "Linux" },
    { value: "Windows Server", label: "Windows Server" },
    { value: "Sécurité réseau", label: "Sécurité réseau" },
    { value: "Social media", label: "Social media" },
    { value: "Marketing", label: "Marketing" },
    { value: "Communication", label: "Communication" },
  ];

  const [open, setOpen] = React.useState(false);
  const [openTitle, setOpenTitle] = React.useState(false);

  // Extract unique companies
  const companies = React.useMemo(() => {
    const uniqueCompanies = new Set(allOffers.map((offer) => offer.company));
    return Array.from(uniqueCompanies).sort();
  }, [allOffers]);

  // Extract unique companies
  const titles = React.useMemo(() => {
    const uniqueTitles = new Set(allOffers.map((offer) => offer.title));
    return Array.from(uniqueTitles).sort();
  }, [allOffers]);

  const searchMutation = useMutation({
    mutationFn: (data: AdvancedSearchForm & { skills?: string[] }) =>
      postData(data, "/api/candidat/search"),
    onSuccess: (data) => {
      console.log("Search results:", data);
      setSearchResults(data);
      setHasSearched(true);
      onSearch(data);
      toast.success(`${data.length} offre(s) trouvée(s)`);
    },
    onError: (error) => {
      console.error("Search error:", error);
      toast.error("Erreur lors de la recherche");
    },
  });

  const handleSearch = (values: AdvancedSearchForm) => {
    const searchData = {
      ...values,
      skills: selectedCompetences.length > 0 ? selectedCompetences : undefined,
    };

    console.log("Searching with:", searchData);
    searchMutation.mutate(searchData);
  };

  const handleReset = () => {
    form.reset();
    setSelectedCompetences([]);
    setSearchResults([]);
    setHasSearched(false);
    onSearch(allOffers); // Reset to show all offers
    toast.success("Recherche réinitialisée");
  };

  const handleClose = () => {
    onOpenChange(false);
    // Don't reset results when closing, keep them visible
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Recherche avancée</DialogTitle>
          <DialogDescription>
            Utilisez les filtres ci-dessous pour affiner votre recherche
            d'offres d'emploi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSearch)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'offre</Label>
                <Input
                  id="title"
                  placeholder="Ex: Développeur Full Stack"
                  {...form.register("title")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  placeholder="Ex: Google, Microsoft"
                  {...form.register("company")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  placeholder="Ex: Abidjan, Télétravail"
                  {...form.register("location")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Compétences</Label>
              <CompetenceAutocomplete
                maxCompetences={5}
                selectedCompetences={selectedCompetences}
                onCompetencesChange={setSelectedCompetences}
                placeholder="Sélectionner des compétences..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Salaire</Label>
                <Select
                  value={form.watch("salaryRange")}
                  onValueChange={(value) => form.setValue("salaryRange", value)}
                >
                  <SelectTrigger id="salary" className="w-full">
                    <SelectValue placeholder="Fourchette de salaire" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les salaires</SelectItem>
                    <SelectItem value="0-1">0 - 1M FCFA</SelectItem>
                    <SelectItem value="1-2">1M - 2M FCFA</SelectItem>
                    <SelectItem value="2-3">2M - 3M FCFA</SelectItem>
                    <SelectItem value="3+">3M+ FCFA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type de contrat</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(value) => form.setValue("type", value)}
                >
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Type de contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="Stage">Stage</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Expérience</Label>
                <Select
                  value={form.watch("experience")}
                  onValueChange={(value) => form.setValue("experience", value)}
                >
                  <SelectTrigger id="experience" className="w-full">
                    <SelectValue placeholder="Niveau d'expérience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous niveaux</SelectItem>
                    <SelectItem value="débutant">Débutant</SelectItem>
                    <SelectItem value="intermédiaire">Intermédiaire</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleReset}>
              <Redo2 className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Fermer
            </Button>
            <Button type="submit" disabled={searchMutation.isPending}>
              {searchMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recherche...
                </>
              ) : (
                <>
                  <SearchIcon className="mr-2 h-4 w-4" />
                  Rechercher
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* Résultats de recherche affichés directement */}
        {hasSearched && (
          <div className="mt-6 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Résultats de la recherche ({searchResults.length} offre(s))
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Effacer les résultats
              </Button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {searchMutation.isPending ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="ml-2">Recherche en cours...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Aucun résultat trouvé
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Essayez de modifier vos critères de recherche
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {searchResults.map((offer) => (
                    <Card key={offer.id} className="w-full">
                      <CardHeader>
                        <CardTitle className="flex justify-between items-start">
                          <span>{offer.title}</span>
                          <Badge variant="secondary">{offer.type}</Badge>
                        </CardTitle>
                        <CardDescription>{offer.company}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Localisation:</span>
                            <span>{offer.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Salaire:</span>
                            <span>
                              {formatSalary(offer.salaryMin)} -{" "}
                              {formatSalary(offer.salaryMax)}
                            </span>
                          </div>
                          {offer.jobOfferCompetences &&
                            offer.jobOfferCompetences.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {offer.jobOfferCompetences.map(
                                  (comp, index) => (
                                    <Badge key={index} variant="outline">
                                      {comp.competence}
                                    </Badge>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">Voir les détails</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSearch;
