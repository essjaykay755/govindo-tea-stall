import { Trophy, CalendarDays, Users, Medal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TournamentPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="rounded-full bg-orange-100 p-3">
          <Trophy className="h-8 w-8 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-orange-800 font-heading">Tournament</h1>
          <p className="text-muted-foreground mt-2">Coming Soon - Get ready for exciting carrom tournaments!</p>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Trophy className="h-16 w-16 text-orange-600" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-orange-800">Tournament Feature Coming Soon</h2>
              <p className="text-muted-foreground max-w-md">
                We're working on bringing you an exciting tournament system. Stay tuned for updates!
              </p>
            </div>
            <Button className="mt-4" disabled>
              Notify Me When Available
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Preview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="rounded-full bg-orange-100 w-10 h-10 flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5 text-orange-600" />
            </div>
            <CardTitle>Tournament Brackets</CardTitle>
            <CardDescription>
              Organized tournament structure with automatic bracket generation and progression tracking.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="rounded-full bg-orange-100 w-10 h-10 flex items-center justify-center mb-2">
              <Medal className="h-5 w-5 text-orange-600" />
            </div>
            <CardTitle>Leaderboards</CardTitle>
            <CardDescription>
              Real-time rankings and statistics for all tournament participants.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="rounded-full bg-orange-100 w-10 h-10 flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <CardTitle>Team Management</CardTitle>
            <CardDescription>
              Create and manage teams, track performance, and coordinate matches.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Development Timeline</CardTitle>
          <CardDescription>Our planned roadmap for tournament features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[
              {
                phase: "Phase 1",
                title: "Basic Tournament Structure",
                description: "Tournament creation and bracket generation",
                status: "In Development",
              },
              {
                phase: "Phase 2",
                title: "Team Management",
                description: "Team creation and management features",
                status: "Planning",
              },
              {
                phase: "Phase 3",
                title: "Advanced Features",
                description: "Statistics, achievements, and rewards system",
                status: "Future",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="flex-none">
                  <div className="rounded-full bg-orange-100 w-8 h-8 flex items-center justify-center">
                    <CalendarDays className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-orange-800">{item.phase}</span>
                    <span className="text-xs text-muted-foreground">- {item.status}</span>
                  </div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 