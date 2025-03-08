import { Coffee, Users, GamepadIcon, CalendarDays } from "lucide-react"

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-b from-orange-100/70 via-white to-white" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center mb-16 sm:mb-24">
          <Coffee className="h-16 w-16 text-orange-600 mb-6" />
          <div className="space-y-3">
            <p className="text-lg font-medium text-orange-600 tracking-wide uppercase">welcome to</p>
            <h1 className="font-heading text-4xl font-bold text-orange-800 sm:text-7xl tracking-wider uppercase px-4">
              GOVINDO TEA STALL
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mt-6 leading-relaxed px-4">
            A cozy corner where friends gather, stories unfold, and carrom battles are won.
            Join us in creating daily memories over a perfect cup of tea.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          <div className="group relative overflow-hidden rounded-lg border bg-gradient-to-b from-orange-50 p-6 sm:p-8 transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="rounded-full bg-orange-100 p-2.5">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-orange-800">Adda Section</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Track daily attendance for hangout sessions and stay connected with friends.
              Never miss a moment of laughter and camaraderie.
            </p>
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-100/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <div className="group relative overflow-hidden rounded-lg border bg-gradient-to-b from-orange-50 p-6 sm:p-8 transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="rounded-full bg-orange-100 p-2.5">
                <GamepadIcon className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-orange-800">Carrom Section</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Manage carrom games, partner assignments, and upcoming tournaments.
              Challenge friends and track your progress.
            </p>
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-100/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center rounded-full border bg-orange-50 px-4 py-1.5 hover:bg-orange-100 transition-colors cursor-pointer">
            <CalendarDays className="mr-2 h-4 w-4 text-orange-600" />
            <span className="font-heading text-sm font-medium text-orange-800 tracking-wide">Daily Updates & History</span>
          </div>
        </div>
      </div>
    </div>
  )
}
