"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Adda",
    href: "/adda",
  },
  {
    name: "Carrom",
    href: "/carrom",
  },
  {
    name: "Members",
    href: "/members",
  },
  {
    name: "Tournament",
    href: "/tournament",
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex items-center">
      <div className="flex items-center space-x-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-orange-600",
              pathname === item.href
                ? "text-orange-800 font-semibold"
                : "text-muted-foreground"
            )}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  )
} 