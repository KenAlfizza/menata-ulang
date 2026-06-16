"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

import { 
    NavigationMenu, 
    NavigationMenuList, 
    NavigationMenuItem, 
    NavigationMenuTrigger, 
    NavigationMenuContent, 
    NavigationMenuLink,
    navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";

interface NavbarProps {
    show?: boolean;
    showLogo?: boolean;
    showNavigation?: boolean;
}

export function Navbar({show = true, showLogo = true, showNavigation = true}: NavbarProps) {
    const [logoAnimationDone, setLogoAnimationDone] = useState(false);

    return (show && (
        <header className="sticky top-0 z-50 w-full">
            <div className="w-full bg-gradient-to-b from-[#B2CC71] from-25% to-transparent mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                
                {/* Animated Logo & Navigation Target Area */}
                <div className="flex items-center gap-2 min-w-[128px]">
                    <AnimatePresence
                        onExitComplete={() => {
                            if (!showLogo) setLogoAnimationDone(false);
                        }}
                    >
                        {showLogo && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                /* SCROLL UP: We delay the opacity/y properties on exit */
                                exit={{ 
                                    opacity: 0, 
                                    y: -8, 
                                    scale: 0.96,
                                    transition: { delay: 0.2, duration: 0.2, ease: "easeIn" } 
                                }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                onAnimationComplete={() => setLogoAnimationDone(true)}
                            >
                                <Link href="/" className="flex items-center gap-2">
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
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {showNavigation && logoAnimationDone && showLogo && (
                            <motion.div
                                /* SCROLL DOWN: We apply the 0.15s delay inside the default transition object */
                                initial={{ opacity: 0, x: -20, scale: 0.96 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                /* SCROLL UP: We force 0s delay on exit so it closes out immediately */
                                exit={{ 
                                    opacity: 0, 
                                    x: -20, 
                                    scale: 0.96,
                                    transition: { delay: 0, duration: 0.2, ease: "easeIn" } 
                                }}
                                transition={{ delay: 0.15, duration: 0.2, ease: "easeOut" }}
                            >
                                <NavigationMenu>
                                    <NavigationMenuList className="flex flex-row gap-4">
                                        <NavigationMenuItem>
                                            <NavigationMenuTrigger>Jelajahi</NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <NavigationMenuLink>Short Story</NavigationMenuLink>
                                                <NavigationMenuLink>Podcast</NavigationMenuLink>
                                                <NavigationMenuLink>Infografik</NavigationMenuLink>
                                            </NavigationMenuContent>
                                        </NavigationMenuItem>

                                        <NavigationMenuItem>
                                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                                <Link href="/social">Sosial</Link>
                                            </NavigationMenuLink>
                                        </NavigationMenuItem>

                                        <NavigationMenuItem>
                                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                                <Link href="/social">Bantuan</Link>
                                            </NavigationMenuLink>
                                        </NavigationMenuItem>

                                        <NavigationMenuItem>
                                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                                <Link href="/social">Tentang Kami</Link>
                                            </NavigationMenuLink>
                                        </NavigationMenuItem>


                                    </NavigationMenuList>
                                </NavigationMenu>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                {/* Actions Section */}
                <nav className="ml-auto flex items-center gap-4">
                    <Button variant="ghost" className="text-zinc-800 hover:text-zinc-900 hover:bg-white/50" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button className="bg-zinc-900 text-amber-50 hover:bg-zinc-800 rounded-full" asChild>
                        <Link href="/register">Registrasi</Link>
                    </Button>
                </nav>
            </div>
        </header>
    ));
}