import { Coffee } from "lucide-react"

interface TestimonialProps {
  quote: string
  name: string
  title: string
  icon?: React.ReactNode
}

export function Testimonial({
  quote,
  name,
  title,
  icon = <Coffee className="h-12 w-12 text-orange-600" />
}: TestimonialProps) {
  return (
    <section className="py-16 relative">
      <div className="absolute top-1/4 right-0 h-72 w-72 rounded-full bg-orange-100 opacity-20 blur-3xl" />
      <div className="container px-4 mx-auto relative z-10">
        <div className="bg-gradient-to-r from-slate-50 to-orange-50 rounded-2xl p-8 sm:p-12 shadow-sm border animate-fade-in">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6">
              {icon}
            </div>
            <blockquote className="mb-8">
              <div className="relative">
                <svg 
                  className="absolute -top-6 -left-8 h-16 w-16 text-orange-200 opacity-50"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="relative text-xl md:text-2xl font-heading text-slate-800 italic">
                  {quote}
                </p>
              </div>
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 font-medium">{name.charAt(0)}</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-900">{name}</p>
                <p className="text-sm text-slate-500">{title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 