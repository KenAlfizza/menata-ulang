import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { HeroSearch } from "@/components/hero-search";
import { PageBackground } from "@/components/page-background";
import { AnnouncementCarousel } from "@/components/home/annoucement/annoucement-carousel";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="relative w-full min-h-screen flex flex-col bg-[#D4E5A9]">
      {/* Navbar sits out here at the absolute root layout level */}
      <Navbar showLogo={false} />
      {/* Background component acts as the canvas underneath the main body */}
      <PageBackground>
        {/** Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-center mb-16">
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

            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
              Ruang untuk melihat dan memahami diri sendiri
            </h1>
            
            <p className="text-lg sm:text-2xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              "Kamu berhak tumbuh, walau pernah jatuh"
            </p>
            
            <div className="flex justify-center">
                <HeroSearch />   
            </div>
            
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto w-full">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto px-6 bg-white/60 hover:bg-white/80 backdrop-blur-sm text-zinc-800 shadow-sm rounded-full" asChild>
                <Link href="/login">Jelajahi</Link>
              </Button>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto px-6 bg-white/60 hover:bg-white/80 backdrop-blur-sm text-zinc-800 shadow-sm rounded-full" asChild>
                <Link href="/login">Sosial</Link>
              </Button>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto px-6 bg-white/60 hover:bg-white/80 backdrop-blur-sm text-zinc-800 shadow-sm rounded-full" asChild>
                <Link href="/login">Bantuan</Link>
              </Button>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto px-6 bg-white/60 hover:bg-white/80 backdrop-blur-sm text-zinc-800 shadow-sm rounded-full" asChild>
                <Link href="/login">Tentang Kami</Link>
              </Button>
            </div>
          </div>

        {/** Welcome Message */}
        <section className="welcome mt-52 gap-24 flex flex-col sm:flex-row justify-center items-center px-4">
            <div className="w-full sm:max-w-xs flex-shrink-0">
                <h2 className="text-center text-3xl sm:text-4xl">Selamat Datang di Menata Ulang</h2>
            </div>
            <Card className="w-full sm:max-w-3xl p-7 bg-white/60 hover:bg-white/80 backdrop-blur-sm text-zinc-800 shadow-sm rounded-xl">
                <p className="text-lg">
                Menata Ulang hadir sebagai teman, yang menemani kamu untuk melihat sisi dirimu. 
                Yang paling terang, dan yang paling gelap. Untuk dirangkul dan diterima. 
                Untuk dilihat dan disesuaikan, dengan siapa diri kamu, sebenarnya.
                </p>
            </Card>
        </section>


        {/* Announcement Grid */}
        <section className="annoucement mt-48">
            <h2 className="text-3xl">Kabar Komunitas</h2>
            <AnnouncementCarousel/>
        </section>  


          <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm space-y-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Unified Monorepos</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Keep your frontend frameworks and backend systems organized inside clean conceptual boundaries.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm space-y-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Optimized Routing</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Leverage invisible route groupings and nested designs without cluttering your browser URLs.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm space-y-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Type-Safe Schemas</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Validate incoming payloads instantly on the client side before they reach your databases.
              </p>
            </div>
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