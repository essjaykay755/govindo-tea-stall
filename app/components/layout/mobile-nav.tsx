"use client"

import { Coffee, Menu, Home, Users, GamepadIcon, Group, Trophy } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/AuthContext"
import { LoginButton } from "@/components/auth/LoginButton"

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Adda",
    href: "/adda",
    icon: Users,
  },
  {
    name: "Carrom",
    href: "/carrom",
    icon: GamepadIcon,
  },
  {
    name: "Members",
    href: "/members",
    icon: Group,
  },
  {
    name: "Tournament",
    href: "/tournament",
    icon: Trophy,
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const { isAdmin } = useAuth()

  return (
    <div className="flex items-center md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="mr-4 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
            <Menu className="h-6 w-6 text-orange-800" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full max-w-xs border-r bg-white">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-7 pb-6 border-b border-orange-100">
              <div className="flex items-center gap-3 pt-4">
                <Coffee className="h-8 w-8 text-orange-600" />
                <SheetTitle className="text-xl font-heading font-semibold text-orange-800">
                  GOVINDO TEA STALL
                </SheetTitle>
              </div>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-7 py-8">
              <div className="flex flex-col space-y-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-lg bg-orange-100 px-3 py-2.5 text-base font-medium text-orange-800 transition-colors mb-4"
                  >
                    <Coffee className="h-5 w-5" />
                    Admin
                  </Link>
                )}
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                        pathname === item.href
                          ? "bg-orange-100 text-orange-800"
                          : "text-muted-foreground hover:bg-orange-50 hover:text-orange-600"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
                <div className="mt-6 pt-6 border-t border-orange-100">
                  <div className="flex justify-center">
                    <LoginButton className="w-full py-2.5 text-base" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <Link href="/" className="flex items-center space-x-2">
        <Coffee className="h-6 w-6 text-orange-600" />
        <span className="font-heading font-semibold text-lg text-orange-800">
          GOVINDO TEA STALL
        </span>
      </Link>
    </div>
  )
} 