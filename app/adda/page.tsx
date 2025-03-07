import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddaPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="rounded-full bg-orange-100 p-3">
          <Users className="h-8 w-8 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-orange-800 font-heading">Adda Section</h1>
          <p className="text-muted-foreground mt-2">Track daily hangout attendance and stay connected with friends</p>
        </div>
      </div>

      {/* Today's Attendance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>Mark your attendance for today's hangout session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-orange-50">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-orange-100 p-2">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-orange-800">Present Today</p>
                  <p className="text-sm text-muted-foreground">Join the hangout session</p>
                </div>
              </div>
              <Button variant="outline" className="border-orange-200 hover:bg-orange-100">
                Mark Present
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-800">12</div>
            <p className="text-xs text-muted-foreground">Members attending today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Regular Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-800">8</div>
            <p className="text-xs text-muted-foreground">Consistent attendees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Joiners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-800">2</div>
            <p className="text-xs text-muted-foreground">First time today</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from the hangout sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                <div className="rounded-full bg-orange-100 p-2">
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-orange-800">New member joined</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 