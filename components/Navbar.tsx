import Link from "next/link"
import { Coffee } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-orange-50/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-orange-600" />
            <span className="font-heading text-lg font-semibold text-orange-800">
              Govindo Tea Stall
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-6">
          <Link 
            href="/adda" 
            className="text-sm font-medium text-orange-800 hover:text-orange-600 transition-colors"
          >
            Adda Section
          </Link>
          <Link 
            href="/carrom" 
            className="text-sm font-medium text-orange-800 hover:text-orange-600 transition-colors"
          >
            Carrom Section
          </Link>
          <Link 
            href="/history" 
            className="text-sm font-medium text-orange-800 hover:text-orange-600 transition-colors"
          >
            History
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-orange-800">
                <span className="sr-only">Open menu</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] bg-orange-50/95">
              <div className="mt-6 flex flex-col gap-4">
                <Link 
                  href="/adda" 
                  className="text-lg font-medium text-orange-800 hover:text-orange-600 transition-colors"
                >
                  Adda Section
                </Link>
                <Link 
                  href="/carrom" 
                  className="text-lg font-medium text-orange-800 hover:text-orange-600 transition-colors"
                >
                  Carrom Section
                </Link>
                <Link 
                  href="/history" 
                  className="text-lg font-medium text-orange-800 hover:text-orange-600 transition-colors"
                >
                  History
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
} 