import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export function SearchBar({ placeholder = "Search...", onSearch }: SearchBarProps) {
  const [query, setQuery] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (onSearch) onSearch(val);
  };

  return (
    <div className="relative w-full flex items-center">
        <Search className="absolute left-4 z-10 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full h-10 pl-11 pr-4 rounded-full bg-white/60 backdrop-blur-sm border-transparent shadow-sm focus-visible:ring-1 focus-visible:ring-zinc-300"
        />
    </div>
  );
}