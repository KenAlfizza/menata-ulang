import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarSeparator,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"

import { FileText, Pen, Podcast, UserCircle2 } from "lucide-react";


export function WorkspaceSidebar() {
    const workspaceNavigation = [
        { href: "/workspace/author", label: "Story", icon: Pen },
        { href: "/workspace/host", label: "Podcast", icon: Podcast },
        { href: "/workspace/researcher", label: "Research", icon: FileText },
    ]

    const pathname = usePathname();

    const { state } = useSidebar();
    const isCollapsed = state == "collapsed";

    return (
    <Sidebar collapsible="icon">
        <SidebarHeader className="flex items-center justify-center">
            <Link
                href="/home"
                className={`flex items-center justify-center transition-all duration-100 ${
                    isCollapsed ? "p-0" : "p-4"
                }`}
            >
                <Image
                    src="/logo-icon.svg"
                    alt="Menata Ulang Logo"
                    width={128}
                    height={128}
                    priority
                    className={`w-auto shrink-0 transition-all duration-300 ${isCollapsed ? "h-8" : "h-12"}`}
                />
                <div
                    className={`overflow-hidden transition-all duration-300 delay-200 ${
                        isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
                    }`}
                >
                    <Image
                        src="/logo-text.svg"
                        alt="Menata Ulang Logo"
                        width={128}
                        height={128}
                        priority
                        className="w-auto"
                    />
                </div>
            </Link>
        </SidebarHeader>
        <SidebarSeparator className="p-0 m-0"/>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel className="text-sm m-auto">Workspaces</SidebarGroupLabel>
                <SidebarMenu className="gap-1">
                    {workspaceNavigation.map(({ href, label, icon: Icon}) => {
                        const isActive = pathname == href || pathname.startsWith(`${href}/`);
                        return (
                            <SidebarMenuItem key={href}>
                                <SidebarMenuButton asChild isActive={isActive}>
                                    <Link href={href}>
                                        <Icon/>
                                        <span>{label}</span>
                                    </Link>
                                </SidebarMenuButton>
                                {href === "author" && <SidebarMenuAction /> }
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroup>

            <SidebarSeparator className="p-0 m-0 mt-auto"/>
            <SidebarGroup>
                <SidebarMenu className="gap-1">
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="h-auto">
                            <Link href='/profile'>
                                <UserCircle2/>
                                <span>Profile</span>
                            </Link>
                        </SidebarMenuButton>
                        <SidebarMenuAction />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
    </Sidebar>
  )
}