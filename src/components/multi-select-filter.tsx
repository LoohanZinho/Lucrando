
"use client";

import * as React from "react"
import { Check, X, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface MultiSelectFilterProps {
  title: string;
  options: {
    label: string
    value: string
  }[];
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
  className?: string;
}

export function MultiSelectFilter({
  title,
  options,
  selected,
  onSelectedChange,
  className
}: MultiSelectFilterProps) {
  const selectedValues = new Set(selected);

  const handleUnselect = (value: string) => {
    const newSelected = selected.filter((s) => s !== value);
    onSelectedChange(newSelected);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("w-[200px] justify-between", className, selected.length > 0 && "h-auto")}
        >
          <div className="flex gap-1 flex-wrap">
            {selected.length > 0 ? (
                 options
                    .filter(option => selected.includes(option.value))
                    .map(option => (
                        <Badge
                            variant="secondary"
                            key={option.value}
                            className="mr-1 mb-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleUnselect(option.value);
                            }}
                        >
                            {option.label}
                            <X className="ml-1 h-3 w-3" />
                        </Badge>
                    ))
            ) : (
              <span>{title}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Buscar ${title.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        onSelectedChange(selected.filter((s) => s !== option.value));
                      } else {
                        onSelectedChange([...selected, option.value]);
                      }
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
