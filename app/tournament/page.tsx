import { Trophy, Users, Medal, Calendar, Info, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TournamentPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="rounded-full bg-orange-100 p-3">
          <Trophy className="h-8 w-8 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-orange-800 font-heading">Carrom Tournament</h1>
          <p className="text-muted-foreground mt-2">Join us for an exciting carrom competition!</p>
        </div>
      </div>

      {/* Tournament Rules Card */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-orange-600" />
            Tournament Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium text-orange-800">Team Structure</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              <li>Each team consists of 2 players</li>
              <li>9 teams in total (18 players)</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-orange-800">Scoring System</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              <li>4 games per match</li>
              <li>1 point for each remaining coin of the opponent</li>
              <li>1 extra point if the winning team "puts red"</li>
              <li>Total score determines the winner of the match</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Tournament Structure Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="group">Group Stage</TabsTrigger>
          <TabsTrigger value="super-six">Super Six</TabsTrigger>
          <TabsTrigger value="finals">Finals</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Structure</CardTitle>
              <CardDescription>Complete tournament flow from groups to finals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                  <Card className="w-full md:w-64 bg-orange-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Group Stage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">3 groups × 3 teams</p>
                      <p className="text-sm text-muted-foreground">Top 2 teams from each group advance</p>
                    </CardContent>
                  </Card>
                  
                  <div className="hidden md:block text-orange-600">→</div>
                  <div className="block md:hidden text-orange-600">↓</div>
                  
                  <Card className="w-full md:w-64 bg-orange-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Super Six</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">6 teams compete</p>
                      <p className="text-sm text-muted-foreground">Top 4 teams advance</p>
                    </CardContent>
                  </Card>
                  
                  <div className="hidden md:block text-orange-600">→</div>
                  <div className="block md:hidden text-orange-600">↓</div>
                  
                  <Card className="w-full md:w-64 bg-orange-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Finals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Semi-Finals: 4 teams</p>
                      <p className="text-sm text-muted-foreground">Finals: 2 teams</p>
                      <p className="text-sm text-muted-foreground">29 points matches</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Group Stage Tab */}
        <TabsContent value="group" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Group Stage</CardTitle>
              <CardDescription>3 groups with 3 teams each</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {['A', 'B', 'C'].map((group) => (
                  <Card key={group} className="bg-orange-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-orange-200 flex items-center justify-center text-orange-800">
                          {group}
                        </div>
                        Group {group}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="text-sm pb-2 border-b">Team {group}1 <span className="text-xs text-muted-foreground">(TBD)</span></li>
                        <li className="text-sm pb-2 border-b">Team {group}2 <span className="text-xs text-muted-foreground">(TBD)</span></li>
                        <li className="text-sm">Team {group}3 <span className="text-xs text-muted-foreground">(TBD)</span></li>
                      </ul>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium">Format:</h4>
                        <p className="text-xs text-muted-foreground">• Each team plays against other teams in the group</p>
                        <p className="text-xs text-muted-foreground">• Top 2 teams advance to Super Six</p>
                        <p className="text-xs text-muted-foreground">• 1 team eliminated</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Super Six Tab */}
        <TabsContent value="super-six" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Super Six</CardTitle>
              <CardDescription>6 teams compete for semi-final spots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">The Super Six round consists of the top 2 teams from each group:</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="bg-orange-50 p-4">
                      <div className="text-center">
                        <div className="rounded-full bg-orange-200 h-10 w-10 flex items-center justify-center mx-auto mb-2">
                          <Users className="h-5 w-5 text-orange-800" />
                        </div>
                        <p className="font-medium">Team {i+1}</p>
                        <p className="text-xs text-muted-foreground">TBD</p>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium">Format:</h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2">
                    <li>Teams play matches against each other</li>
                    <li>4 games per match with the same scoring system as the group stage</li>
                    <li>Top 4 teams advance to the Semi-Finals</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Finals Tab */}
        <TabsContent value="finals" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Semi-Finals & Finals</CardTitle>
              <CardDescription>Best teams compete for the championship</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-orange-800 mb-2">Semi-Finals</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="bg-orange-50 p-4">
                      <div className="text-center">
                        <h4 className="font-medium">Semi-Final 1</h4>
                        <div className="flex justify-center items-center gap-2 mt-2">
                          <div className="text-center">
                            <div className="rounded-full bg-orange-200 h-8 w-8 flex items-center justify-center mx-auto">
                              <span className="text-xs font-medium">1</span>
                            </div>
                            <p className="text-xs mt-1">TBD</p>
                          </div>
                          <span className="text-orange-800 font-bold">vs</span>
                          <div className="text-center">
                            <div className="rounded-full bg-orange-200 h-8 w-8 flex items-center justify-center mx-auto">
                              <span className="text-xs font-medium">4</span>
                            </div>
                            <p className="text-xs mt-1">TBD</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                    <Card className="bg-orange-50 p-4">
                      <div className="text-center">
                        <h4 className="font-medium">Semi-Final 2</h4>
                        <div className="flex justify-center items-center gap-2 mt-2">
                          <div className="text-center">
                            <div className="rounded-full bg-orange-200 h-8 w-8 flex items-center justify-center mx-auto">
                              <span className="text-xs font-medium">2</span>
                            </div>
                            <p className="text-xs mt-1">TBD</p>
                          </div>
                          <span className="text-orange-800 font-bold">vs</span>
                          <div className="text-center">
                            <div className="rounded-full bg-orange-200 h-8 w-8 flex items-center justify-center mx-auto">
                              <span className="text-xs font-medium">3</span>
                            </div>
                            <p className="text-xs mt-1">TBD</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Semi-Finals are played as full 2 matches with 29 points each.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-orange-800 mb-2">Final</h3>
                  <Card className="bg-orange-50 p-4">
                    <div className="text-center">
                      <h4 className="font-medium">Championship Final</h4>
                      <div className="flex justify-center items-center gap-2 mt-2">
                        <div className="text-center">
                          <div className="rounded-full bg-orange-200 h-8 w-8 flex items-center justify-center mx-auto">
                            <span className="text-xs font-medium">SF1</span>
                          </div>
                          <p className="text-xs mt-1">Winner</p>
                        </div>
                        <span className="text-orange-800 font-bold">vs</span>
                        <div className="text-center">
                          <div className="rounded-full bg-orange-200 h-8 w-8 flex items-center justify-center mx-auto">
                            <span className="text-xs font-medium">SF2</span>
                          </div>
                          <p className="text-xs mt-1">Winner</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                  <p className="text-sm text-muted-foreground mt-3">
                    The final is played as a 29 points match to determine the tournament champion.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Registration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Tournament Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Registration details and schedule will be announced soon.</p>
          <Button>Register Interest</Button>
        </CardContent>
      </Card>
    </div>
  )
} 