"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Clock, TrendingUp, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchSuggestion {
  id: string;
  text: string;
  type: "poste" | "competence" | "localisation" | "entreprise";
  count?: number;
  icon?: React.ReactNode;
}

interface SearchSuggestionsProps {
  onSuggestionSelect: (suggestion: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  suggestions?: SearchSuggestion[];
  loading?: boolean;
}

// Suggestions populaires pour la recherche de candidats
const popularSuggestions: SearchSuggestion[] = [
  // Postes populaires
  {
    id: "1",
    text: "Développeur Full Stack",
    type: "poste",
    count: 156,
    icon: "💻",
  },
  { id: "2", text: "Data Scientist", type: "poste", count: 89, icon: "📊" },
  { id: "3", text: "DevOps Engineer", type: "poste", count: 67, icon: "⚙️" },
  { id: "4", text: "Product Manager", type: "poste", count: 45, icon: "📋" },
  { id: "5", text: "UX/UI Designer", type: "poste", count: 78, icon: "🎨" },
  { id: "6", text: "Mobile Developer", type: "poste", count: 92, icon: "📱" },
  { id: "7", text: "Backend Developer", type: "poste", count: 134, icon: "🔧" },
  {
    id: "8",
    text: "Frontend Developer",
    type: "poste",
    count: 112,
    icon: "🎯",
  },

  // Compétences populaires
  { id: "9", text: "React", type: "competence", count: 234, icon: "⚛️" },
  { id: "10", text: "Python", type: "competence", count: 198, icon: "🐍" },
  { id: "11", text: "JavaScript", type: "competence", count: 287, icon: "📜" },
  { id: "12", text: "AWS", type: "competence", count: 145, icon: "☁️" },
  { id: "13", text: "Docker", type: "competence", count: 123, icon: "🐳" },
  { id: "14", text: "Node.js", type: "competence", count: 167, icon: "🟢" },
  { id: "15", text: "SQL", type: "competence", count: 189, icon: "🗄️" },
  { id: "16", text: "Git", type: "competence", count: 256, icon: "📚" },

  // Localisations populaires
  { id: "17", text: "Paris", type: "localisation", count: 456, icon: "🗼" },
  { id: "18", text: "Lyon", type: "localisation", count: 234, icon: "🏛️" },
  { id: "19", text: "Marseille", type: "localisation", count: 189, icon: "⚓" },
  { id: "20", text: "Toulouse", type: "localisation", count: 145, icon: "✈️" },
  { id: "21", text: "Nantes", type: "localisation", count: 123, icon: "🌊" },
  { id: "22", text: "Bordeaux", type: "localisation", count: 98, icon: "🍷" },
  { id: "23", text: "Strasbourg", type: "localisation", count: 87, icon: "🏰" },
  {
    id: "24",
    text: "Montpellier",
    type: "localisation",
    count: 76,
    icon: "🌞",
  },

  // Entreprises populaires
  { id: "25", text: "Google", type: "entreprise", count: 23, icon: "🔍" },
  { id: "26", text: "Microsoft", type: "entreprise", count: 34, icon: "🪟" },
  { id: "27", text: "Amazon", type: "entreprise", count: 28, icon: "📦" },
  { id: "28", text: "Apple", type: "entreprise", count: 19, icon: "🍎" },
  { id: "29", text: "Meta", type: "entreprise", count: 31, icon: "📘" },
  { id: "30", text: "Netflix", type: "entreprise", count: 15, icon: "🎬" },
  { id: "31", text: "Uber", type: "entreprise", count: 22, icon: "🚗" },
  { id: "32", text: "Airbnb", type: "entreprise", count: 18, icon: "🏠" },
];

export default function SearchSuggestions({
  onSuggestionSelect,
  onSearch,
  placeholder = "Rechercher des candidats...",
  className = "",
  suggestions = [],
  loading = false,
}: SearchSuggestionsProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    SearchSuggestion[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger les recherches récentes depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error(
          "Erreur lors du chargement des recherches récentes:",
          error
        );
      }
    }
  }, []);

  // Filtrer les suggestions basées sur la requête
  useEffect(() => {
    if (query.length < 2) {
      setFilteredSuggestions([]);
      return;
    }

    const filtered = [
      ...popularSuggestions.filter((suggestion) =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      ),
      ...suggestions.filter((suggestion) =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      ),
    ];

    setFilteredSuggestions(filtered.slice(0, 10));
  }, [query, suggestions]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    onSuggestionSelect(suggestion.text);
    addToRecentSearches(suggestion.text);
  };

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
      addToRecentSearches(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const addToRecentSearches = (search: string) => {
    const updated = [
      search,
      ...recentSearches.filter((s) => s !== search),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "poste":
        return "💼";
      case "competence":
        return "⚡";
      case "localisation":
        return "📍";
      case "entreprise":
        return "🏢";
      default:
        return "🔍";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "poste":
        return "bg-blue-100 text-blue-800";
      case "competence":
        return "bg-green-100 text-green-800";
      case "localisation":
        return "bg-purple-100 text-purple-800";
      case "entreprise":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(query.length >= 2)}
          className="pl-10 pr-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {query && !loading && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 p-0"
            onClick={() => setQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandList>
                {/* Recherches récentes */}
                {recentSearches.length > 0 && (
                  <CommandGroup heading="Recherches récentes">
                    {recentSearches.map((search, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => {
                          setQuery(search);
                          onSuggestionSelect(search);
                          setShowSuggestions(false);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{search}</span>
                      </CommandItem>
                    ))}
                    <CommandItem
                      onSelect={clearRecentSearches}
                      className="text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                      <span>Effacer l'historique</span>
                    </CommandItem>
                  </CommandGroup>
                )}

                {/* Suggestions populaires */}
                {filteredSuggestions.length > 0 && (
                  <CommandGroup heading="Suggestions populaires">
                    {filteredSuggestions.map((suggestion) => (
                      <CommandItem
                        key={suggestion.id}
                        onSelect={() => handleSuggestionClick(suggestion)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span>
                            {suggestion.icon || getTypeIcon(suggestion.type)}
                          </span>
                          <span>{suggestion.text}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              getTypeColor(suggestion.type)
                            )}
                          >
                            {suggestion.type}
                          </Badge>
                          {suggestion.count && (
                            <span className="text-xs text-muted-foreground">
                              {suggestion.count}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Tendances */}
                <CommandGroup heading="Tendances du moment">
                  <div className="p-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Compétences en forte croissance</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[
                        "AI/ML",
                        "Cloud Native",
                        "Cybersécurité",
                        "Blockchain",
                        "IoT",
                      ].map((trend) => (
                        <Badge
                          key={trend}
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => {
                            setQuery(trend);
                            onSuggestionSelect(trend);
                            setShowSuggestions(false);
                          }}
                        >
                          {trend}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CommandGroup>

                <CommandEmpty>
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Aucune suggestion trouvée pour "{query}"
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        onSuggestionSelect(query);
                        setShowSuggestions(false);
                      }}
                    >
                      Rechercher "{query}"
                    </Button>
                  </div>
                </CommandEmpty>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
