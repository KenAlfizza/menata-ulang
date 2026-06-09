"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useState, useEffect } from "react";
import { AnnouncementCard } from "./annoucement-card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

export function AnnouncementCarousel() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,        // ← wrap around
        align: "center",   // ← center active card
        dragFree: false,
        containScroll: false, // ← must be false for loop + center to work correctly
        slidesToScroll: 1,
    });

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        const onInit = () => {
            setScrollSnaps(emblaApi.scrollSnapList());
            setSelectedIndex(emblaApi.selectedScrollSnap());
        };

        const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());

        onInit();
        emblaApi.on("reInit", onInit);
        emblaApi.on("select", onSelect);

        return () => {
            emblaApi.off("reInit", onInit);
            emblaApi.off("select", onSelect);
        };
    }, [emblaApi]);

    return (
        <section className="mt-4 w-2xl">
            <div className="relative">
                {/* Fades */}
                <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-[#D4E5A9] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#D4E5A9] to-transparent z-10 pointer-events-none" />

                <div className="overflow-hidden" ref={emblaRef}>
                    <ul className="flex gap-5">
                        <li className="shrink-0"><AnnouncementCard /></li>
                        <li className="shrink-0"><AnnouncementCard /></li>
                        <li className="shrink-0"><AnnouncementCard /></li>
                        <li className="shrink-0"><AnnouncementCard /></li>
                        <li className="shrink-0"><AnnouncementCard /></li>
                    </ul>
                </div>
            </div>

            <div className="flex items-center justify-between mt-4 px-22">
                <div className="flex gap-2">
                    <Button
                        onClick={scrollPrev}
                        className="w-8 h-8 rounded-full border flex items-center justify-center bg-white/60 hover:bg-white/80 transition"
                    >
                        <ArrowLeftIcon className="text-zinc-800" />
                    </Button>
                    <Button
                        onClick={scrollNext}
                        className="w-8 h-8 rounded-full border flex items-center justify-center bg-white/60 hover:bg-white/80 transition"
                    >
                        <ArrowRightIcon className="text-zinc-800" />
                    </Button>
                </div>

                <div className="flex gap-2">
                    {scrollSnaps.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollTo(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                index === selectedIndex
                                    ? "bg-white w-4"
                                    : "bg-white/60 hover:bg-white/80 w-2"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}