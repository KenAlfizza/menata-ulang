import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { PageBackground } from "@/components/(auth)/page-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageBackground>
        <div className="flex flex-col min-h-screen">
            {/** Main Auth */}
            <main className="auth p-16 flex flex-1 flex-col items-center justify-center">
                <div className="flex justify-center">
                    <Link href="/">
                        <Image
                        src="/logo.svg"
                        alt="Menata Ulang Logo"
                        width={384}
                        height={384}
                        priority
                        />
                    </Link>
                </div>
                <Card className="w-full max-w-md shadow-lg border-none bg-white/60 backdrop-blur-sm text-zinc-800 shadow-sm rounded-xl">
                    {children}
                </Card>
            </main>
            {/** 📝 Mini Footer */}
            <footer className="mt-auto border-t border-zinc-200/60 dark:border-zinc-800 mt-20 bg-white/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between text-xs text-zinc-500">
                    <p>&copy; {new Date().getFullYear()} Menata Ulang. All rights reserved.</p>
                    <div className="flex gap-4">
                    <a href="#" className="hover:underline">Privacy Policy</a>
                    <a href="#" className="hover:underline">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    </PageBackground>    
  );
}