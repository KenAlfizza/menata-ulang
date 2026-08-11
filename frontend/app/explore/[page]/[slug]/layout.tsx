"use client"
import { useParams } from "next/navigation";
import { ExploreNavbar } from "@/components/explore/explore-navbar.tsx";

type PageType = 'story' | 'podcast' | 'research';


const isValidPageType = (value: string | undefined): value is PageType =>
    value === 'story' || value === 'podcast' || value === 'research';

export default function ExploreSlugLayout({ children }: { children: React.ReactNode }) {

    const params = useParams<{ page?: string }>();
    const currentPage: PageType = isValidPageType(params.page) ? params.page : 'story';
    
    return (
        <div className="w-full">
            <div className="pt-20 space-y-8">
                <ExploreNavbar page={currentPage} route="explore"/>
                {children}
            </div>
        </div>
    );
}