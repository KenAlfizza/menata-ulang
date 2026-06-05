"use client";

import { AnnouncementCard } from "./annoucement-card";

export function AnnouncementCarousel() {
    return (
        <section className="annoucement mt-4">
            <ul className="cards w-full flex flex-row gap-5">
                <li><AnnouncementCard/></li>
                <li><AnnouncementCard/></li>
                <li><AnnouncementCard/></li>
            </ul>
        </section>
    )
    
}