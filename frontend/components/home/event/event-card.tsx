"use client";
import Image from "next/image";
import { Button } from "../../ui/button";

export function EventCard() {
    return (
        <Button 
            asChild
            className="w-md h-auto p-6 bg-white/60 hover:bg-white/80 active:bg-white/90 backdrop-blur-sm text-zinc-800 shadow-sm rounded-xl text-left border-0 block cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400"
            dir="ltr"
            >
            <div>
                {/* Title */}
                <div className="text-2xl tracking-tight mb-4 text-zinc-800">
                    Sesi Berkumpul #1
                </div>

                {/* Content Layout */}
                <div className="flex flex-row gap-8 items-center">
                {/* <Image
                    src="/globe.svg"
                    alt="Announcement Image"
                    width={128}
                    height={128}
                    className="shrink-0"
                /> */}
                
                {/* Text Section */}
                <div className="flex flex-col text-center items-center justify-center flex-1 text-zinc-500 whitespace-normal">
                    <p className="text-lg font-medium text-zinc-800">Date: 11/04/2025, 3PM</p>
                    <p className="italic mt-1"> Self growth and how to overcome struggles </p>
                </div>
                </div>
            </div>
        </Button>
    )
}