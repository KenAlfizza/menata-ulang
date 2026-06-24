"use client";

import Link from "next/link"
import Image from "next/image"

import { Navbar } from "@/components/common/navbar.tsx";
import { PageBackground } from "@/components/story/page-background.tsx"
import { FadeInSection } from "../../components/common/fade-section.tsx";
import { Card, CardContent } from "../../components/ui/card.tsx";


export default function StoryPage() {
    return (
    <div className="relative w-full min-h-screen flex flex-col">
      {/* Navbar sits out here at the absolute root layout level */}
      <Navbar showLogo showNavigation color="#D56F80" />
      {/* Background component acts as the canvas underneath the main body */}
      <PageBackground>
        <main className="relative pt-16 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            {/** Story Section */}
            <section className="story mt-20 text-center space-y-4 mx-auto">
                <div className="story-title">
                    <div className="flex flex-col justify-center">
                        <Image
                        src="/window.svg"
                        alt="Menata Ulang Logo"
                        width={64}
                        height={64}
                        priority
                        className="h-64 w-auto"
                        />
                    </div>

                    <h1 className="mt-8 text-3xl sm:text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
                        Judul Cerita
                    </h1>
                    <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        "Deskripsi cerita yang di tulis"
                    </p>
                </div>
            
                {/** Short Story */}
                <Card className="story-text bg-white/50 p-8 w-full">
                    <div className="space-y-4 text-zinc-800 text-md"> {/* Added a gap wrapper */}
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis fringilla, elit at tristique vulputate, nibh felis malesuada risus, in faucibus eros metus sit amet purus. Vestibulum id tortor efficitur, malesuada justo et, eleifend ipsum. Phasellus congue at erat et porta. Nulla vitae velit nec ante rutrum finibus lobortis et ante. Ut eget nunc vel nibh commodo vestibulum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aliquam odio odio, ultricies sit amet elit at, tempor tristique sem. Nam vel dolor quis tellus vestibulum cursus. Nunc ut magna a justo pharetra eleifend. Etiam est neque, volutpat eget fermentum in, auctor sit amet mauris. Sed in lacus ac diam convallis vestibulum. Donec placerat leo erat, eu blandit enim ullamcorper eget. Donec ut tincidunt metus, at vestibulum neque.
                        </p>
                        
                        <p>
                            Donec a facilisis tellus, eu fermentum dui. Quisque id tortor quis sapien maximus volutpat. Pellentesque porta ex vitae maximus venenatis. Pellentesque consequat dictum lorem, sed cursus enim suscipit nec. Donec nec consectetur purus. Sed sed diam accumsan, suscipit tellus in, gravida risus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
                        </p>
                        
                        <p>
                            Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In sem ante, commodo nec dolor at, elementum sodales diam. Integer facilisis dictum ultrices. Mauris dapibus lectus at lorem tincidunt, faucibus vulputate magna mollis. Sed aliquet sagittis justo non lacinia. Nulla a lacinia justo, ac placerat justo. Fusce interdum scelerisque arcu et aliquam.
                        </p>
                        
                        <p>
                            Nullam malesuada erat non dolor tincidunt, a viverra nibh dignissim. Aenean et libero eleifend, consequat enim non, molestie lacus. Ut eget imperdiet mi, sit amet molestie erat. Morbi ut risus et est tempus ornare. Nunc rhoncus orci vitae justo tempus, vitae interdum orci condimentum. Morbi vitae leo purus. Proin a mollis lectus. Aliquam vestibulum lacus sit amet nibh tincidunt venenatis. In sodales dapibus nisi. Aliquam posuere ex dolor, non ornare lectus aliquet commodo. Morbi non molestie est. Suspendisse eu cursus libero.
                        </p>
                    </div>
                </Card>
            </section>


            {/* Research */}
            <section className="research text-center space-y-4">
                <div>
                <h2 className="text-3xl sm:text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
                    What Research Says?
                </h2>
                </div>
                {/**<Card className="bg-white/50 p-8 w-full"> */}
                    <div className="space-y-4 text-zinc-800 text-sm px-8"> {/* Added a gap wrapper */}
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis fringilla, elit at tristique vulputate, nibh felis malesuada risus, in faucibus eros metus sit amet purus. Vestibulum id tortor efficitur, malesuada justo et, eleifend ipsum. Phasellus congue at erat et porta. Nulla vitae velit nec ante rutrum finibus lobortis et ante. Ut eget nunc vel nibh commodo vestibulum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aliquam odio odio, ultricies sit amet elit at, tempor tristique sem. Nam vel dolor quis tellus vestibulum cursus. Nunc ut magna a justo pharetra eleifend. Etiam est neque, volutpat eget fermentum in, auctor sit amet mauris. Sed in lacus ac diam convallis vestibulum. Donec placerat leo erat, eu blandit enim ullamcorper eget. Donec ut tincidunt metus, at vestibulum neque.
                        </p>
                        
                        <p>
                            Donec a facilisis tellus, eu fermentum dui. Quisque id tortor quis sapien maximus volutpat. Pellentesque porta ex vitae maximus venenatis. Pellentesque consequat dictum lorem, sed cursus enim suscipit nec. Donec nec consectetur purus. Sed sed diam accumsan, suscipit tellus in, gravida risus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
                        </p>
                        
                        <p>
                            Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In sem ante, commodo nec dolor at, elementum sodales diam. Integer facilisis dictum ultrices. Mauris dapibus lectus at lorem tincidunt, faucibus vulputate magna mollis. Sed aliquet sagittis justo non lacinia. Nulla a lacinia justo, ac placerat justo. Fusce interdum scelerisque arcu et aliquam.
                        </p>
                        
                        <p>
                            Nullam malesuada erat non dolor tincidunt, a viverra nibh dignissim. Aenean et libero eleifend, consequat enim non, molestie lacus. Ut eget imperdiet mi, sit amet molestie erat. Morbi ut risus et est tempus ornare. Nunc rhoncus orci vitae justo tempus, vitae interdum orci condimentum. Morbi vitae leo purus. Proin a mollis lectus. Aliquam vestibulum lacus sit amet nibh tincidunt venenatis. In sodales dapibus nisi. Aliquam posuere ex dolor, non ornare lectus aliquet commodo. Morbi non molestie est. Suspendisse eu cursus libero.
                        </p>
                    </div>
                {/**</Card>*/}
            </section>

            {/* Reflection Section */}
            <section className="research text-center space-y-4">
                <div>
                <h2 className="text-3xl sm:text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
                    Reflection
                </h2>
                </div>
                <Card className="bg-white/50 p-8 w-full">
                    {/** Reflection chat */}
                </Card>
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
    )
}