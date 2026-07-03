"use client";

import { AuthProvider } from "@/context/auth-context";

// Sidebar imports
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { WorkspaceSidebar } from "@/components/workspace/sidebar"

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
        <div className="bg-zinc-100 min-h-screen">
            <SidebarProvider>
                <WorkspaceSidebar />
                <main className="w-full">
                    <SidebarTrigger />
                        {children}
                </main>
            </SidebarProvider>
        </div>
        </AuthProvider>
    )
}