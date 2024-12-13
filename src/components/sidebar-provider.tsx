"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider as ShadcnSidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  LogOut,
  Book,
  UserCircle,
  ClipboardList,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";

const menuItems = {
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/students", label: "Öğrenciler", icon: Users },
    { href: "/teachers", label: "Öğretmenler", icon: GraduationCap },
    { href: "/classes", label: "Sınıflar", icon: BookOpen },
    { href: "/courses", label: "Dersler", icon: Book },
  ],
  teacher: [
    { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/teacher/classes", label: "Sınıflarım", icon: BookOpen },
    { href: "/teacher/homework", label: "Ödevler", icon: ClipboardList },
    { href: "/teacher/grades/add", label: "Not Girişi", icon: Book },
  ],
  student: [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/homework", label: "Ödevlerim", icon: ClipboardList },
    { href: "/student/profile", label: "Rozetlerim", icon: Book },
  ],
};

export function AppSidebar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Hata",
        description: "Çıkış yapılırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  if (status === "loading") {
    return null; // Yükleme durumunda hiçbir şey gösterme
  }

  if (!session) {
    return null; // Oturum yoksa sidebar'ı gösterme
  }

  const role = session.user.role as keyof typeof menuItems;
  const currentMenuItems = menuItems[role] || [];

  return (
    <Sidebar className="border-r border-slate-800">
      <SidebarHeader className="border-b border-slate-800 px-6 py-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-transparent bg-clip-text">
          Okul Yönetimi
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <SidebarMenu>
            {currentMenuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      pathname === item.href
                        ? "bg-neon-purple text-white"
                        : "text-slate-400 hover:text-neon-blue hover:bg-slate-800"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <div className="mt-auto p-4 border-t border-slate-800">
        {session?.user && (
          <>
            <div className="flex items-center gap-2 mb-4 text-neon-blue">
              <UserCircle className="w-6 h-6" />
              <span>{session.user.name || session.user.email}</span>
            </div>
            <Button
              variant="outline"
              className="w-full text-neon-pink hover:text-white hover:bg-neon-pink"
              onClick={() => {
                console.log("Logout button clicked");
                handleLogout();
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </>
        )}
      </div>
    </Sidebar>
  );
}

export { ShadcnSidebarProvider as SidebarProvider, SidebarInset };
