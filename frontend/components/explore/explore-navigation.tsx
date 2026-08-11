import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useExplore } from "@/hooks/explore/use-explore.ts";

type PageType = 'story' | 'podcast' | 'research';

interface ExploreNavigationProps {
    onNavigate: (newPage: PageType) => void;
}

const pageOrder: PageType[] = ['story', 'podcast', 'research'];

const variants = {
    enter: (direction: number) => ({
        opacity: 0,
        x: direction * 100,
    }),
    center: {
        opacity: 1,
        x: 0,
    },
    exit: (direction: number) => ({
        opacity: 0,
        x: direction * -100,
    }),
};

export function ExploreNavigation({ onNavigate }: ExploreNavigationProps) {
    const page = useExplore();

    const [prevPage, setPrevPage] = useState(page);
    const [direction, setDirection] = useState(1);

    if (page !== prevPage) {
        const prevIndex = pageOrder.indexOf(prevPage);
        const currentIndex = pageOrder.indexOf(page);
        setDirection(currentIndex > prevIndex ? 1 : -1);
        setPrevPage(page);
    }

    const currentIndex = pageOrder.indexOf(page);

    const handleNext = () => {
        if (currentIndex < pageOrder.length - 1) {
            onNavigate(pageOrder[currentIndex + 1]);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            onNavigate(pageOrder[currentIndex - 1]);
        }
    };

    const getContent = () => {
        switch (page) {
            case 'story':
                return (
                    <div className="navigation flex flex-row items-center gap-2">
                        <span className="text-2xl font-medium">Short Stories</span>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={handleNext}
                            aria-label="Next page"
                            className="hover:bg-white/50"
                        >
                            <ChevronsRight className="!w-6 !h-6" />
                        </Button>
                    </div>
                );
            case 'podcast':
                return (
                    <div className="navigation flex flex-row items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handlePrev}
                            aria-label="Previous page"
                            className="hover:bg-white/50"
                        >
                            <ChevronsLeft className="!w-6 !h-6" />
                        </Button>
                        <span className="text-2xl font-medium">Midnight Convos</span>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={handleNext}
                            aria-label="Next page"
                            className="hover:bg-white/50"
                        >
                            <ChevronsRight className="!w-6 !h-6" />
                        </Button>
                    </div>
                );
            case 'research':
                return (
                    <div className="navigation flex flex-row items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handlePrev}
                            aria-label="Previous page"
                            className="hover:bg-white/50"
                        >
                            <ChevronsLeft className="!w-6 !h-6" />
                        </Button>
                        <span className="text-2xl font-medium">Research Articles</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="overflow-hidden py-2 relative">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                    key={page}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                    {getContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}