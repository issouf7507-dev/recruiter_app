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
} from "lucide-react";
import { JobOffer, AlerteNotificationType } from "@/types/types";
import { cn } from "@/lib/utils";

import {
  CompetenceAutocomplete,
  type Competence,
} from "@/app/components/ui/competence-autocomplete";
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

const advancedSearchSchema = z.object({
  title: z.string().optional(),

  location: z.string().optional(),

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
  const [showResults, setShowResults] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<JobOffer[]>([]);

  const form = useForm<AdvancedSearchForm>({
    resolver: zodResolver(advancedSearchSchema),
    defaultValues: {
      title: "",
      location: "",

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
    mutationFn: (data: AdvancedSearchForm) =>
      postData(data, "/api/candidat/search"),
    onSuccess: (data) => {
      setSearchResults(data);
      setShowResults(true);
      // onSearch(data);
    },
  });

  const handleSearch = (values: AdvancedSearchForm) => {
    searchMutation.mutate(values);
  };

  const ResultsModal = () => (
    <Dialog open={showResults} onOpenChange={setShowResults}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Résultats de la recherche</DialogTitle>
          <DialogDescription>
            {searchResults.length} offre(s) trouvée(s)
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4">
          <div className="grid gap-4">
            {searchMutation.isPending ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              searchResults.map((offer) => (
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
                      {offer.competences && offer.competences.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {offer.competences.map((competence) => (
                            <Badge key={competence} variant="outline">
                              {competence}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Voir les détails</Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
        <div className="sticky bottom-0 pt-4 border-t bg-background">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowResults(false)}
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Recherche avancée</DialogTitle>
            <DialogDescription>
              Utilisez les filtres ci-dessous pour affiner votre recherche
              d'offres d'emploi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleSearch)}>
            <div className="grid gap-4 py-4">
              <div className="grid  gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'offre</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Développeur Full Stack"
                    value={form.watch("title")}
                    onChange={(e) => form.setValue("title", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    placeholder="Ex: Abidjan, Télétravail"
                    value={form.watch("location")}
                    onChange={(e) => form.setValue("location", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salaire</Label>
                  <Select
                    value={form.watch("salaryRange")}
                    onValueChange={(value) =>
                      form.setValue("salaryRange", value)
                    }
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
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  form.reset();
                }}
              >
                <Redo2 />
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">Rechercher</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ResultsModal />
    </>
  );
};

export default AdvancedSearch;
