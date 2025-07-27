'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ComboBoxOption {
    value: string;
    label: string;
    search?: string;
}

interface ComboBoxProps {
    options: ComboBoxOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    [key: string]: any;
}

export function ComboboxDemo({ options, value, onChange, placeholder = 'Select...', ...props }: ComboBoxProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    // Filter options by search (case-insensitive, matches label or search field)
    const filteredOptions = options.filter((option) => {
        const searchText = search.toLowerCase();
        return option.label.toLowerCase().includes(searchText) || (option.search && option.search.includes(searchText));
    });

    const selectedLabel = options.find((option) => option.value === value)?.label;

    // Clear search when popover closes
    React.useEffect(() => {
        if (!open) setSearch('');
    }, [open]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between" {...props}>
                    {selectedLabel || placeholder}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full min-w-[200px] p-0">
                <Command>
                    <CommandInput placeholder={placeholder} className="h-9" value={search} onValueChange={setSearch} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {filteredOptions.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    {option.label}
                                    <Check className={cn('ml-auto', value === option.value ? 'opacity-100' : 'opacity-0')} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
