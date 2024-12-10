import { LayoutDashboard, Users, GraduationCap, BookOpen, Settings, LogOut, Book } from 'lucide-react';

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Öğrenciler", icon: Users },
  { href: "/teachers", label: "Öğretmenler", icon: GraduationCap },
  { href: "/classes", label: "Sınıflar", icon: BookOpen },
  { href: "/courses", label: "Dersler", icon: Book },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

export default menuItems;

