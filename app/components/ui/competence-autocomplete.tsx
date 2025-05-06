import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

export interface Competence {
  value: string;
  label: string;
}

interface CompetenceAutocompleteProps {
  competences: Competence[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function CompetenceAutocomplete({
  competences,
  selectedValues,
  onChange,
  placeholder = "Rechercher une compétence...",
  emptyMessage = "Aucune compétence trouvée.",
  className,
}: CompetenceAutocompleteProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {competences.map((competence) => {
                const isSelected = selectedValues.includes(competence.value);
                return (
                  <CommandItem
                    key={competence.value}
                    value={competence.value}
                    onSelect={() => {
                      if (isSelected) {
                        onChange(
                          selectedValues.filter((v) => v !== competence.value)
                        );
                      } else {
                        onChange([...selectedValues, competence.value]);
                      }
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {competence.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedValues.map((value) => {
          const competenceInfo = competences.find((c) => c.value === value);
          return (
            <div
              key={value}
              className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md"
            >
              <span className="text-sm">{competenceInfo?.label || value}</span>
              <button
                type="button"
                onClick={() => {
                  onChange(selectedValues.filter((v) => v !== value));
                }}
                className="text-primary hover:text-primary/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
