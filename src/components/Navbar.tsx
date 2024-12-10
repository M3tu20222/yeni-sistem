"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/students", label: "Öğrenciler" },
  { href: "/teachers", label: "Öğretmenler" },
  { href: "/classes", label: "Sınıflar" },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-slate-800 p-4">
      <ul className="flex space-x-4">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-neon-blue",
                pathname === item.href
                  ? "text-neon-pink"
                  : "text-slate-400"
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

