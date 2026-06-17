"use client"

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/common/navbar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import { HeroSearch } from "@/components/home/home-search.tsx";

import { AnnouncementCarousel } from "@/components/home/annoucement/annoucement-carousel.tsx";
import { Card } from "@/components/ui/card.tsx";
import { PageBackground } from "@/components/home/page-background.tsx";
import { FadeInSection } from "@/components/common/fade-section.tsx";
import { ScrollTrigger } from "@/components/common/scroll-trigger.tsx";
import { EventCarousel } from "../../components/home/event/event-carousel.tsx";

export default function HomePage() {
    const [navbarShowIcon, setNavbarShowIcon] = useState(false);
    const [navbarShowNavigation, setNavbarShowNavigation] = useState(false);

    return (
    <div className="relative w-full min-h-screen flex flex-col bg-[#D4E5A9]">
      {/* Navbar sits out here at the absolute root layout level */}
      <Navbar showLogo={navbarShowIcon} showNavigation={navbarShowNavigation} />
      {/* Background component acts as the canvas underneath the main body */}
      <PageBackground>
        <main className="relative space-y-72 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            {/** Hero Section */}
            <section className="hero mt-20 text-center space-y-6 max-w-4xl mx-auto">
                <div className="flex justify-center">
                    <Link href="/">
                        <Image
                        src="/logo.svg"
                        alt="Menata Ulang Logo"
                        width={64}
                        height={64}
                        priority
                        className="h-64 w-auto"
                        />
                    </Link>
                </div>

                <h1 className="mt-8 text-3xl sm:text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
                    Ruang untuk melihat dan memahami diri sendiri
                </h1>
                
                <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                    "Kamu berhak tumbuh, walau pernah jatuh"
                </p>
                
                <div className="flex justify-center">
                    <HeroSearch />   
                </div>
                
                <div className="flex flex-row items-center justify-center gap-3 max-w-xl mx-auto w-full">
                    <Button size="lg" variant="secondary" className="w-auto px-6 bg-white/60 hover:bg-white/80 backdrop-blur-sm text-zinc-800 shadow-sm rounded-full" asChild>
                        <Link href="/login">Jelajahi</Link>
                    </Button>
                    <Button size="lg" variant="secondary" className="w-auto px-6 bg-white/60 hover:bg-white/80 backdrop-blur-sm text-zinc-800 shadow-sm rounded-full" asChild>
                        <Link href="/login">Sosial</Link>
                    </Button>
                    <Button size="lg" variant="secondary" className="w-auto px-6 bg-white/60 hover:bg-white/80 backdrop-blur-sm text-zinc-800 shadow-sm rounded-full" asChild>
                        <Link href="/login">Bantuan</Link>
                    </Button>
                    <Button size="lg" variant="secondary" className="w-auto px-6 bg-white/60 hover:bg-white/80 backdrop-blur-sm text-zinc-800 shadow-sm rounded-full" asChild>
                        <Link href="/login">Tentang Kami</Link>
                    </Button>
                </div>
                <ScrollTrigger onViewportChange={(inView) => {
                    if (inView) {
                        setNavbarShowIcon(false);
                        setNavbarShowNavigation(false);
                    }
                }} />
            </section>

            {/** Welcome Message */}
            <section className="welcome text-center max-w-4xl min-w-full scroll-fade-in-up">
                <FadeInSection>
                <div className="flex flex-col items-center justify-center gap-8 xl:flex-row xl:gap-30">
                    <div className="max-w-xs flex-shrink-0">
                    <h2 className="text-center text-3xl md:text-4xl md:pr-8">Selamat Datang di Menata Ulang</h2>
                    </div>
                    <Card className="w-full md:max-w-2xl py-8 px-8 bg-white/50 hover:bg-white/80 backdrop-blur-sm text-zinc-800 shadow-sm rounded-xl">
                    <p className="text-lg">
                        Menata Ulang hadir sebagai teman, yang menemani kamu untuk melihat sisi dirimu. 
                        Yang paling terang, dan yang paling gelap. Untuk dirangkul dan diterima. 
                        Untuk dilihat dan disesuaikan, dengan siapa diri kamu, sebenarnya.
                    </p>
                    </Card>
                </div>
                </FadeInSection>
                <ScrollTrigger onViewportChange={(inView) => {
                    if (inView) {
                        navbarShowIcon === false ? setNavbarShowIcon(true) : null
                        navbarShowNavigation === false ? setNavbarShowNavigation(true) : null
                    }
                }} />
            </section>


            {/* Announcement Grid */}
            <section className="annoucements">
                <FadeInSection className="flex flex-col items-center justify-center gap-4">
                    <h2 className="text-center text-3xl">Kabar Komunitas</h2>
                    <AnnouncementCarousel/>
                </FadeInSection>
                <ScrollTrigger onViewportChange={(inView) => {
                    if (inView) {
                        navbarShowIcon === false ? setNavbarShowIcon(true) : null
                        navbarShowNavigation === false ? setNavbarShowNavigation(true) : null
                    }
                }} />
            </section>

            {/* Upcoming Events */}
            <section className="events">
                <FadeInSection className="flex flex-col items-center justify-center gap-4">
                    <h2 className="text-center text-3xl">Acara Mendatang</h2>
                    <div className="flex flex-row gap-8">
                        <EventCarousel/>
                        <Calendar
                            mode="single"
                            className="rounded-lg border bg-white/60"
                            captionLayout="dropdown"
                        />
                    </div>
                </FadeInSection>
                <ScrollTrigger onViewportChange={(inView) => {
                    if (inView) {
                        navbarShowIcon === false ? setNavbarShowIcon(true) : null
                        navbarShowNavigation === false ? setNavbarShowNavigation(true) : null
                    }
                }} />
            </section>    
        </main>

        {/** 📝 Mini Footer */}
        <footer className="border-t border-zinc-200/60 dark:border-zinc-800 mt-20 bg-white/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between text-xs text-zinc-500">
            <p>&copy; {new Date().getFullYear()} Menata Ulang. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Service</a>
            </div>
          </div>
        </footer>
      </PageBackground>
    </div>
  );
}