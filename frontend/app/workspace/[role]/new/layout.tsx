import { AuthProvider } from "@/context/auth-context.tsx";

export default function NewPageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            <main>
                <AuthProvider>{children}</AuthProvider>
            </main>
        </div>
    )
}