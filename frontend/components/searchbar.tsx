import { useState, KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input.tsx"; // Assuming you use a standard Input component

interface SearchBarProps {
    placeholder?: string;
    onSearch: (searchTerm: string) => void;
}

export function SearchBar({ placeholder = "Search...", onSearch }: SearchBarProps) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSearch(inputValue);
        }
    };

    return (
        <div className="relative flex items-center w-full max-w-sm">
            <Search className="absolute left-3 h-4 w-4 text-slate-500" />
            <Input
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 pr-4 py-2 border rounded-md"
            />
        </div>
    );
}