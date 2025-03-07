"use client"

import Link from "next/link"
import { MainNav } from "./main-nav"
import { MobileNav } from "./mobile-nav"
import { Coffee } from "lucide-react"
import { LoginButton } from "@/components/auth/LoginButton"
import { useAuth } from "@/components/auth/AuthContext"

export function SiteHeader() {
  const { isAdmin } = useAuth();
  
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-orange-50/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 md:gap-8">
          <MobileNav />
          <Link href="/" className="hidden md:flex items-center space-x-2">
            <Coffee className="h-6 w-6 text-orange-600" />
            <span className="font-heading font-semibold text-lg text-orange-800">
              Govindo Tea Stall
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <MainNav />
          {isAdmin && (
            <Link 
              href="/admin" 
              className="hidden sm:inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800"
            >
              Admin
            </Link>
          )}
          <LoginButton />
        </div>
      </div>
    </header>
  )
} 