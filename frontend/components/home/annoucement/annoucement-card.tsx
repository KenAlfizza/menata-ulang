"use client";
import Image from "next/image";
import { Button } from "../../ui/button";

export function AnnouncementCard() {
    return (
        <Button 
            asChild
            className="w-lg h-auto p-6 bg-white/60 hover:bg-white/80 active:bg-white/90 backdrop-blur-sm text-zinc-800 shadow-sm rounded-xl text-left border-0 block cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
            <div>
                {/* Title */}
                <div className="text-2xl tracking-tight mb-4 text-zinc-800">
                New Story Posted!
                </div>

                {/* Content Layout */}
                <div className="flex flex-row gap-8 items-center">
                <Image
                    src="/globe.svg"
                    alt="Announcement Image"
                    width={96}
                    height={96}
                    className="shrink-0"
                />
                
                {/* Text Section */}
                <div className="flex flex-col text-center items-center justify-center flex-1 text-zinc-500 whitespace-normal">
                    <p className="text-lg font-medium text-zinc-800">Kaset yang Sudah Usang</p>
                    <p className="italic mt-1">
                    “Mungkin trauma itu adalah kaset memori usang yang harus diperbaiki karena tak lagi sejalan.”
                    </p>
                </div>
                </div>
            </div>
        </Button>
    )
}