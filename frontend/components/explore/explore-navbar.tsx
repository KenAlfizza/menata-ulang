"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { 
    NavigationMenu, 
    NavigationMenuList, 
    NavigationMenuItem, 
    NavigationMenuLink,
} from "@/components/ui/navigation-menu.tsx";
import { useExplore } from "@/hooks/explore/use-explore.ts";



interface ExploreNavbarProps {
    show?: boolean;
    route?: 'explore' | 'resources';
    bgColor?: string;
}

const navbarBackgroundMap = {
    story: "bg-gradient-to-b from-red-400 via-red-400/50 to-transparent",
    podcast: "bg-gradient-to-b from-yellow-500 via-yellow-500/50 to-transparent",
    research: "bg-gradient-to-b from-blue-500 via-blue-500/50 to-transparent",
};

export function ExploreNavbar({
    show = true, 
    route = 'explore',
}: ExploreNavbarProps) {
    const [logoAnimationDone, setLogoAnimationDone] = useState(false);
    const page = useExplore();
    const bgColor = navbarBackgroundMap[page];

    return (show && (
        <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-white/100 via-white/75 to-transparent">
            {/* Dynamically apply the background string and transition colors smoothly */}
            <div className={`w-full mx-auto py-2 px-4 h-16 flex items-start justify-start transition-colors duration-300 ${bgColor}`}>
                {/* Animated Logo & Navigation Target Area */}
                <div className="flex items-center gap-6 min-w-[128px]">
                    <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ 
                                    opacity: 0, 
                                    y: -8, 
                                    scale: 0.96,
                                    transition: { delay: 0.2, duration: 0.2, ease: "easeIn" } 
                                }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                onAnimationComplete={() => setLogoAnimationDone(true)}
                            >
                                <Link href="/home" className="flex items-center gap-2">
                                    <Image
                                        src="/logo-text.svg"
                                        alt="Menata Ulang Logo"
                                        width={128}
                                        height={128}
                                        priority
                                        className="w-auto h-8 brightness-0"
                                    />
                                </Link>
                            </motion.div>
                    </AnimatePresence>

                    <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, x: -20, scale: 0.96 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ 
                                    opacity: 0, 
                                    x: -20, 
                                    scale: 0.96,
                                    transition: { delay: 0, duration: 0.2, ease: "easeIn" } 
                                }}
                                transition={{ delay: 0.15, duration: 0.2, ease: "easeOut" }}
                            >
                                <NavigationMenu>
                                    <NavigationMenuList className="grid grid-cols-3">
                                        <NavigationMenuItem className="w-full">
                                            <NavigationMenuLink asChild 
                                            className="p-2 gap-0 hover:bg-white/50 w-full h-full justify-center text-center font-medium"
                                            >
                                                <Link className="flex flex-col" href="/explore">
                                                    Explore
                                                    {(route === "explore") 
                                                        ? <span className={`w-14 h-0.75 -mb-1 bg-white/50`}></span>
                                                        : <span className={`w-14 h-0.75 -mb-1 bg-none`}></span>
                                                    }
                                                </Link>

                                            </NavigationMenuLink>
                                        </NavigationMenuItem>

                                        <NavigationMenuItem className="w-full">
                                            <NavigationMenuLink asChild 
                                            className="p-2 gap-0 hover:bg-white/50 w-full h-full justify-center text-center font-medium"
                                            >
                                                <Link className="flex flex-col" href="/resources">
                                                    Resources
                                                    {(route === "resources") 
                                                        ? <span className={`w-full h-0.75 -mb-1 bg-white/50`}></span>
                                                        : <span className={`w-full h-0.75 -mb-1 bg-none`}></span>
                                                    }
                                                </Link>

                                            </NavigationMenuLink>
                                        </NavigationMenuItem>
                                    </NavigationMenuList>
                                </NavigationMenu>
                            </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </header>
    ));
}