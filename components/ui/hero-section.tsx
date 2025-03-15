import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HeroSectionProps {
  subtitle?: string
  title: string
  highlightedTitle?: string
  description: string
  primaryButtonText?: string
  primaryButtonHref?: string
  secondaryButtonText?: string
  secondaryButtonHref?: string
}

export function HeroSection({
  subtitle = "Since 1995",
  title = "Govindo",
  highlightedTitle = "Tea Stall",
  description,
  primaryButtonText = "Join Today",
  primaryButtonHref = "#",
  secondaryButtonText = "Learn More",
  secondaryButtonHref = "#"
}: HeroSectionProps) {
  return (
    <section className="relative py-20 sm:py-28 md:py-32">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {subtitle && (
            <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 mb-6 animate-fade-in">
              <span className="text-xs font-medium text-amber-600">{subtitle}</span>
            </div>
          )}
          
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-slate-800 tracking-tight uppercase animate-scale-in">
            <span className="block">{title}</span>
            {highlightedTitle && (
              <span className="block mt-2 gradient-text">{highlightedTitle}</span>
            )}
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl mt-6 leading-relaxed animate-fade-in stagger-1">
            {description}
          </p>
          
          <div className="mt-10 flex flex-wrap gap-4 justify-center animate-fade-in stagger-2">
            {primaryButtonText && (
              <Button asChild className="btn-primary">
                <Link href={primaryButtonHref}>{primaryButtonText}</Link>
              </Button>
            )}
            
            {secondaryButtonText && (
              <Button asChild variant="outline" className="border-slate-200 hover:bg-slate-50">
                <Link href={secondaryButtonHref}>{secondaryButtonText}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
} 