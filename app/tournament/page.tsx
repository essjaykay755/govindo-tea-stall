"use client";

import { Trophy, Users, Medal, Calendar, Info, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"

// Define interfaces for tournament data
interface Team {
  id?: string;
  name: string;
  player1_id: string;
  player2_id: string;
  group_name?: string;
  player1?: TeamMember;
  player2?: TeamMember;
  stage?: string;
}

interface TeamMember {
  id: string;
  name: string;
  image: string | null;
}

interface Match {
  id?: string;
  team1_id: string;
  team2_id: string;
  date: string;
  stage: 'group' | 'super_six' | 'semifinal' | 'final';
  group_name?: string;
  winner_id?: string;
  scores?: {
    team1_score: number;
    team2_score: number;
  };
  team1?: Team;
  team2?: Team;
}

interface TournamentSettings {
  id: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed';
}

// MatchCard component for displaying matches
const MatchCard = ({ 
  match, 
  getTeamName, 
  showWinner = true 
}: { 
  match: Match; 
  getTeamName: (teamId: string) => string; 
  showWinner?: boolean;
}) => {
  return (
    <div className="text-center space-y-2">
      <p className="text-sm text-muted-foreground">
        {format(new Date(match.date), 'MMMM d, yyyy')}
      </p>
      <div className="flex items-center justify-center space-x-4">
        <div className="text-right w-1/3">
          <p className="font-medium">{getTeamName(match.team1_id)}</p>
        </div>
        <div className="bg-orange-200 px-3 py-1 rounded-lg">
          <span className="font-bold text-sm">
            {match.scores ? `${match.scores.team1_score} - ${match.scores.team2_score}` : 'vs'}
          </span>
        </div>
        <div className="text-left w-1/3">
          <p className="font-medium">{getTeamName(match.team2_id)}</p>
        </div>
      </div>
      {showWinner && match.winner_id && (
        <p className="text-xs text-orange-600">
          Winner: {getTeamName(match.winner_id)}
        </p>
      )}
    </div>
  );
};

// Final matches
const FinalMatchCard = ({ 
  match, 
  getTeamName 
}: { 
  match: Match; 
  getTeamName: (teamId: string) => string;
}) => {
  return (
    <div className="text-center space-y-2">
      <p className="text-sm text-muted-foreground">
        {format(new Date(match.date), 'MMMM d, yyyy')}
      </p>
      <div className="flex items-center justify-center space-x-4">
        <div className="text-right w-1/3">
          <p className="font-medium">{getTeamName(match.team1_id)}</p>
        </div>
        <div className="bg-orange-300 px-3 py-1 rounded-lg">
          <span className="font-bold text-sm">
            {match.scores ? `${match.scores.team1_score} - ${match.scores.team2_score}` : 'vs'}
          </span>
        </div>
        <div className="text-left w-1/3">
          <p className="font-medium">{getTeamName(match.team2_id)}</p>
        </div>
      </div>
      {match.winner_id && (
        <div className="mt-2">
          <div className="rounded-full bg-orange-300 inline-flex items-center justify-center p-2 mb-1">
            <Trophy className="h-5 w-5 text-orange-800" />
          </div>
          <p className="font-medium text-orange-800">
            Winner: {getTeamName(match.winner_id)}
          </p>
        </div>
      )}
    </div>
  );
};

export default function TournamentPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [tournamentSettings, setTournamentSettings] = useState<TournamentSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Add this useEffect to fix the share button issue
  useEffect(() => {
    // This handles the share button functionality safely
    const shareButton = document.querySelector('.share-button');
    if (shareButton) {
      const handleShare = () => {
        if (navigator.share) {
          navigator.share({
            title: 'Govindo Tea Stall - Tournament',
            text: 'Check out this tournament!',
            url: window.location.href,
          })
          .catch(err => console.error('Error sharing:', err));
        } else {
          // Fallback for browsers that don't support Web Share API
          console.log('Web Share API not supported');
        }
      };
      
      shareButton.addEventListener('click', handleShare);
      return () => {
        shareButton.removeEventListener('click', handleShare);
      };
    }
  }, []);

  // Group teams by their group
  const teamsByGroup = teams.reduce((acc, team) => {
    if (team.group_name) {
      if (!acc[team.group_name]) {
        acc[team.group_name] = [];
      }
      acc[team.group_name].push(team);
    }
    return acc;
  }, {} as Record<string, Team[]>);

  // Filter matches by stage
  const groupMatches = matches.filter(match => match.stage === 'group');
  const superSixMatches = matches.filter(match => match.stage === 'super_six');
  const semifinalMatches = matches.filter(match => match.stage === 'semifinal');
  const finalMatches = matches.filter(match => match.stage === 'final');

  useEffect(() => {
    async function fetchTournamentData() {
      setLoading(true);
      try {
        // Fetch members
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('id, name, image');
        
        if (membersError) {
          console.warn('Error fetching members:', membersError);
        }
        setMembers(membersData || []);

        // Fetch teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('tournament_teams')
          .select('id, name, player1_id, player2_id, group_name, stage');
        
        if (teamsError) {
          // If table doesn't exist yet, just use empty array
          console.warn('Error fetching teams:', teamsError);
          setTeams([]);
        } else {
          setTeams(teamsData || []);
        }

        // Fetch matches
        const { data: matchesData, error: matchesError } = await supabase
          .from('tournament_matches')
          .select('id, team1_id, team2_id, date, stage, group_name, winner_id, scores');
        
        if (matchesError) {
          // If table doesn't exist yet, just use empty array
          console.warn('Error fetching matches:', matchesError);
          setMatches([]);
        } else {
          setMatches(matchesData || []);
        }

        // Improved error handling for tournament settings
        try {
          // Try to fetch with select *
          const { data: settingsData, error: settingsError } = await supabase
            .from('tournament_settings')
            .select('*')
            .limit(1)
            .single();
          
          if (settingsError) {
            // If no settings exist yet, create default settings
            console.warn('Error fetching tournament settings:', settingsError);
            
            // Set default settings in state with proper UUID
            const defaultSettings = {
              id: crypto.randomUUID(), // Generate proper UUID instead of '1'
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
              status: 'upcoming' as const
            };
            
            setTournamentSettings(defaultSettings);
            
            // Try to insert default settings
            try {
              const { error: insertError } = await supabase
                .from('tournament_settings')
                .insert([defaultSettings]);
                
              if (insertError) {
                console.warn('Error creating default tournament settings:', insertError);
              }
            } catch (insertCatchError) {
              console.error('Exception creating default tournament settings:', insertCatchError);
            }
          } else {
            setTournamentSettings(settingsData);
          }
        } catch (settingsCatchError) {
          console.error('Exception in tournament settings fetch:', settingsCatchError);
          
          // Set default settings as fallback with proper UUID
          setTournamentSettings({
            id: crypto.randomUUID(), // Generate proper UUID instead of '1'
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            status: 'upcoming' as const
          });
        }
      } catch (error) {
        console.error('Error fetching tournament data:', error);
        // Continue with empty state
        setTeams([]);
        setMatches([]);
        setTournamentSettings(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTournamentData();
  }, []);

  // Helper function to get team name by ID
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'TBD';
  };

  // Helper function to get member name by ID
  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : 'TBD';
  };

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

      {/* No Data Message */}
      {!loading && teams.length === 0 && matches.length === 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <Calendar className="h-8 w-8 text-orange-600 mb-2" />
              <h3 className="text-xl font-medium text-orange-800">Tournament Coming Soon</h3>
              <p className="text-muted-foreground">
                The tournament details are being finalized. Check back later for teams and match schedules!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
                        {teamsByGroup[group] ? (
                          teamsByGroup[group].map((team) => (
                            <li key={team.id || ''} className="text-sm pb-2 border-b">
                              {team.name}{' '}
                              <span className="text-xs text-muted-foreground">
                                ({getMemberName(team.player1_id)}, {getMemberName(team.player2_id)})
                              </span>
                            </li>
                          ))
                        ) : (
                          <>
                            <li className="text-sm pb-2 border-b">Team {group}1 <span className="text-xs text-muted-foreground">(TBD)</span></li>
                            <li className="text-sm pb-2 border-b">Team {group}2 <span className="text-xs text-muted-foreground">(TBD)</span></li>
                            <li className="text-sm">Team {group}3 <span className="text-xs text-muted-foreground">(TBD)</span></li>
                          </>
                        )}
                      </ul>
                      
                      {/* Group Matches */}
                      {groupMatches.filter((match: Match) => match.group_name === group).length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Matches:</h4>
                          <div className="space-y-2">
                            {groupMatches
                              .filter((match: Match) => match.group_name === group)
                              .map(match => (
                                <Card key={match.id || ''} className="p-2 bg-orange-100">
                                  <MatchCard match={match} getTeamName={getTeamName} />
                                </Card>
                              ))
                            }
                          </div>
                        </div>
                      )}
                      
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
                  {teams.filter(team => team.stage === 'super_six').length > 0 ? (
                    teams.filter(team => team.stage === 'super_six').map((team) => (
                      <Card key={team.id || ''} className="bg-orange-50 p-4">
                        <div className="text-center">
                          <div className="rounded-full bg-orange-200 h-10 w-10 flex items-center justify-center mx-auto mb-2">
                            <Users className="h-5 w-5 text-orange-800" />
                          </div>
                          <p className="font-medium">{team.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {getMemberName(team.player1_id)}, {getMemberName(team.player2_id)}
                          </p>
                        </div>
                      </Card>
                    ))
                  ) : (
                    [...Array(6)].map((_, i) => (
                      <Card key={i} className="bg-orange-50 p-4">
                        <div className="text-center">
                          <div className="rounded-full bg-orange-200 h-10 w-10 flex items-center justify-center mx-auto mb-2">
                            <Users className="h-5 w-5 text-orange-800" />
                          </div>
                          <p className="font-medium">Team {i+1}</p>
                          <p className="text-xs text-muted-foreground">TBD</p>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
                
                {/* Super Six Matches */}
                {superSixMatches.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Super Six Matches</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {superSixMatches.map(match => (
                        <Card key={match.id || ''} className="bg-orange-50 p-4">
                          <MatchCard match={match} getTeamName={getTeamName} />
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
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
                    {semifinalMatches.length > 0 ? (
                      semifinalMatches.map((match) => (
                        <Card key={match.id || ''} className="bg-orange-50 p-4">
                          <MatchCard match={match} getTeamName={getTeamName} />
                        </Card>
                      ))
                    ) : (
                      <>
                        <Card className="bg-orange-50 p-4">
                          <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">TBD</p>
                            <div className="flex items-center justify-center space-x-4">
                              <div className="text-right w-1/3">
                                <p className="font-medium">Semifinal 1</p>
                              </div>
                              <div className="bg-orange-200 px-3 py-1 rounded-lg">
                                <span className="font-bold text-sm">vs</span>
                              </div>
                              <div className="text-left w-1/3">
                                <p className="font-medium">Semifinal 2</p>
                              </div>
                            </div>
                          </div>
                        </Card>
                        <Card className="bg-orange-50 p-4">
                          <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">TBD</p>
                            <div className="flex items-center justify-center space-x-4">
                              <div className="text-right w-1/3">
                                <p className="font-medium">Semifinal 3</p>
                              </div>
                              <div className="bg-orange-200 px-3 py-1 rounded-lg">
                                <span className="font-bold text-sm">vs</span>
                              </div>
                              <div className="text-left w-1/3">
                                <p className="font-medium">Semifinal 4</p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-orange-800 mb-2">Final</h3>
                  {finalMatches.length > 0 ? (
                    finalMatches.map((match) => (
                      <Card key={match.id || ''} className="bg-orange-100 p-4 border-orange-300">
                        <FinalMatchCard match={match} getTeamName={getTeamName} />
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-orange-100 p-4 border-orange-300">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">TBD</p>
                        <div className="flex items-center justify-center space-x-4">
                          <div className="text-right w-1/3">
                            <p className="font-medium">Finalist 1</p>
                          </div>
                          <div className="bg-orange-300 px-3 py-1 rounded-lg">
                            <span className="font-bold text-sm">vs</span>
                          </div>
                          <div className="text-left w-1/3">
                            <p className="font-medium">Finalist 2</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
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
          <div className="flex space-x-3">
            <Button>Register Interest</Button>
            <Button variant="outline" className="share-button">
              <span className="mr-2">Share</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-share">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 