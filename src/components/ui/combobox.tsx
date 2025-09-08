
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
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

type ComboboxProps = {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onDelete?: (value: string) => void;
}

export function Combobox({ options, value, onChange, placeholder, className, onDelete }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  const handleDelete = (e: React.MouseEvent, value: string) => {
    e.stopPropagation(); // Prevent the item from being selected when deleting
    onDelete?.(value);
  }
  
  const handleSelectNew = () => {
    if (searchTerm) {
      onChange(searchTerm);
      setOpen(false);
      setSearchTerm("");
    }
  }

  const filteredOptions = searchTerm
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const showCreateNew = searchTerm && !filteredOptions.some(opt => opt.label.toLowerCase() === searchTerm.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          {value
            ? options.find((option) => option.value === value)?.label ?? value
            : placeholder || "Selecione uma opção..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" side="bottom" align="start">
        <Command>
          <CommandInput 
            placeholder="Pesquisar ou criar novo..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {filteredOptions.length === 0 && !showCreateNew && (
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            )}
             <CommandGroup>
                {showCreateNew && (
                    <CommandItem
                        value={searchTerm}
                        onSelect={handleSelectNew}
                    >
                       Criar novo: <span className="font-bold ml-1">{searchTerm}</span>
                    </CommandItem>
                )}
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    const newValue = currentValue === value ? "" : currentValue
                    onChange(newValue)
                    setOpen(false)
                    setSearchTerm("");
                  }}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </div>
                  {onDelete && (
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDelete(e, option.value)}
                      >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
