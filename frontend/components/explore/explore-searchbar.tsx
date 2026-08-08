import { useState, KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input.tsx"; // Assuming you use a standard Input component

interface SearchBarProps {
    placeholder?: string;
    onSearch: (searchTerm: string) => void;
}

export function ExploreSearchBar({ placeholder = "Enter a search...", onSearch }: SearchBarProps) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSearch(inputValue);
        }
    };

    return (
        <div className="relative flex items-center w-full max-w-sm">
            <Input
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-9 pl-4 py-2 border-none bg-white/50 rounded-full"
            />
            <Search className="absolute right-3 h-4 w-4 text-slate-500" />
        </div>
    );
}