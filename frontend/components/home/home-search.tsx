"use client"; // Forces this specific container to handle the client interactivity

import { SearchBar } from "@/components/searchbar";

export function HeroSearch() {
  const handleSearch = (val: string) => {
    console.log("Searching hero content for:", val);
    // You can handle client-side routing or search states here later!
  };

  return (
    <div className="w-full sm:max-w-xl mx-auto pt-2 px-4">
      <SearchBar placeholder={"Apa yang kamu pikirkan hari ini?"} onSearch={handleSearch} />
    </div>
  );
}