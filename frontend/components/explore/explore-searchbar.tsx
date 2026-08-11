import { useState, KeyboardEvent } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";

interface SearchBarProps {
    placeholder?: string;
    onSearch: (searchTerm: string) => void;
    onCloseSearch: () => void;
}

export function ExploreSearchBar({ placeholder = "Enter a search...", onSearch, onCloseSearch }: SearchBarProps) {
    const [inputValue, setInputValue] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSearch(inputValue);
            setIsSearching(true);
        }
    };

    const handleSearch = () => {
        onSearch(inputValue);
        setIsSearching(true);
    };

    const handleCloseSearch = () => {
        setInputValue("");
        setIsSearching(false);
        onCloseSearch();
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
            {isSearching ? (
                <X 
                    onClick={handleCloseSearch}
                    className="absolute right-3 h-4 w-4 text-slate-500 cursor-pointer hover:text-slate-800 transition-colors" 
                />
            ) : (
                <Search 
                    onClick={handleSearch}
                    className="absolute right-3 h-4 w-4 text-slate-500 cursor-pointer hover:text-slate-800 transition-colors" 
                />
            )}
        </div>
    );
}