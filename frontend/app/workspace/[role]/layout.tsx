"use client";

import { AuthProvider } from "@/context/auth-context";

// Sidebar imports
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { WorkspaceSidebar } from "@/components/workspace/sidebar"

export default function AuthorWorkspace({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
        <div className="min-h-screen">
            <SidebarProvider>
                <WorkspaceSidebar />
                <main>
                    <SidebarTrigger />
                        {children}
                </main>
            </SidebarProvider>
        </div>
        </AuthProvider>
    )
}