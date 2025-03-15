"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Trophy, 
  Users, 
  Calendar, 
  Loader2, 
  ArrowLeft, 
  Plus,
  UserPlus,
  ListChecks,
  Edit,
  Trash
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define interfaces for tournament data
interface Team {
  id?: string;
  name: string;
  player1_id: string;
  player2_id: string;
  group?: string;
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
  group?: string;
  winner_id?: string;
  scores?: {
    team1_score: number;
    team2_score: number;
  };
}

interface TournamentSettings {
  id: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed';
}

export default function TournamentManagementPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("settings");
  
  // Tournament data state
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [tournamentSettings, setTournamentSettings] = useState<TournamentSettings | null>(null);
  
  // Team management state
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamPlayer1, setNewTeamPlayer1] = useState("");
  const [newTeamPlayer2, setNewTeamPlayer2] = useState("");
  const [newTeamGroup, setNewTeamGroup] = useState("");
  const [addingTeam, setAddingTeam] = useState(false);
  
  // Match management state
  const [newMatchTeam1, setNewMatchTeam1] = useState("");
  const [newMatchTeam2, setNewMatchTeam2] = useState("");
  const [newMatchDate, setNewMatchDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newMatchStage, setNewMatchStage] = useState<'group' | 'super_six' | 'semifinal' | 'final'>("group");
  const [newMatchGroup, setNewMatchGroup] = useState("");
  const [addingMatch, setAddingMatch] = useState(false);
  
  // Tournament settings state
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [tournamentStartDate, setTournamentStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tournamentEndDate, setTournamentEndDate] = useState(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [tournamentStatus, setTournamentStatus] = useState<'upcoming' | 'active' | 'completed'>('upcoming');
  
  // Dialog states
  const [showAddTeamDialog, setShowAddTeamDialog] = useState(false);
  const [showAddMatchDialog, setShowAddMatchDialog] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  
  // Check if user is admin
  useEffect(() => {
    if (!loading) {
      // Only allow essjaykay755@gmail.com to access the admin panel
      if (!isAdmin || (user?.email !== 'essjaykay755@gmail.com')) {
        router.push('/');
      }
    }
  }, [loading, isAdmin, router, user]);
  
  // Fetch tournament data
  useEffect(() => {
    async function fetchData() {
      if (!isAdmin) return;
      
      setLoadingData(true);
      
      try {
        // Fetch members for player selection
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('id, name, image')
          .order('name');
        
        if (membersError) throw membersError;
        setMembers(membersData || []);
        
        // Fetch teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('tournament_teams')
          .select('id, name, player1_id, player2_id, group, stage');
        
        if (teamsError) throw teamsError;
        setTeams(teamsData || []);
        
        // Fetch matches
        const { data: matchesData, error: matchesError } = await supabase
          .from('tournament_matches')
          .select('id, team1_id, team2_id, date, stage, group, winner_id, scores');
        
        if (matchesError) throw matchesError;
        setMatches(matchesData || []);
        
        // Fetch tournament settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('tournament_settings')
          .select('id, start_date, end_date, status')
          .single();
        
        if (settingsError && settingsError.code !== 'PGRST116') {
          // If table exists but no data, create default
          if (settingsError.code === 'PGRST116') {
            setTournamentSettings({
              id: '1',
              start_date: format(new Date(), 'yyyy-MM-dd'),
              end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
              status: 'upcoming'
            });
          } else {
            throw settingsError;
          }
        } else {
          setTournamentSettings(settingsData || {
            id: '1',
            start_date: format(new Date(), 'yyyy-MM-dd'),
            end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
            status: 'upcoming'
          });
        }
        
        // Set form values from tournament settings
        if (settingsData) {
          setTournamentStartDate(settingsData.start_date);
          setTournamentEndDate(settingsData.end_date);
          setTournamentStatus(settingsData.status);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load tournament data. Please try again later.",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setLoadingData(false);
      }
    }
    
    fetchData();
  }, [isAdmin, toast]);
  
  // Function to add a new team
  const handleAddTeam = async () => {
    if (!newTeamName || !newTeamPlayer1 || !newTeamPlayer2 || !newTeamGroup) {
      toast({
        title: "Missing Information",
        description: "Please fill in all team details.",
        variant: "destructive",
      });
      return;
    }
    
    if (newTeamPlayer1 === newTeamPlayer2) {
      toast({
        title: "Invalid Selection",
        description: "A player cannot be on the same team twice.",
        variant: "destructive",
      });
      return;
    }
    
    setAddingTeam(true);
    
    try {
      // Create the team object
      const newTeam: Team = {
        name: newTeamName,
        player1_id: newTeamPlayer1,
        player2_id: newTeamPlayer2,
        group: newTeamGroup,
        stage: 'group' // Default to group stage when creating a team
      };
      
      // Save to database
      const { data, error } = await supabase
        .from('tournament_teams')
        .insert(newTeam)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state with the returned data
      setTeams([...teams, data]);
      
      toast({
        title: "Team Added",
        description: `${newTeamName} has been added to the tournament.`,
      });
      
      // Reset form
      setNewTeamName("");
      setNewTeamPlayer1("");
      setNewTeamPlayer2("");
      setNewTeamGroup("");
      setShowAddTeamDialog(false);
      
    } catch (error) {
      console.error('Error adding team:', error);
      toast({
        title: "Error",
        description: "Failed to add team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingTeam(false);
    }
  };
  
  // Function to add a new match
  const handleAddMatch = async () => {
    if (!newMatchTeam1 || !newMatchTeam2 || !newMatchDate || !newMatchStage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all match details.",
        variant: "destructive",
      });
      return;
    }
    
    if (newMatchTeam1 === newMatchTeam2) {
      toast({
        title: "Invalid Selection",
        description: "A team cannot play against itself.",
        variant: "destructive",
      });
      return;
    }
    
    if (newMatchStage === 'group' && !newMatchGroup) {
      toast({
        title: "Missing Group",
        description: "Please select a group for the group stage match.",
        variant: "destructive",
      });
      return;
    }
    
    setAddingMatch(true);
    
    try {
      // Create the match object
      const newMatch: Match = {
        team1_id: newMatchTeam1,
        team2_id: newMatchTeam2,
        date: newMatchDate,
        stage: newMatchStage,
        group: newMatchStage === 'group' ? newMatchGroup : undefined
      };
      
      // Save to database
      const { data, error } = await supabase
        .from('tournament_matches')
        .insert(newMatch)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state with the returned data
      setMatches([...matches, data]);
      
      toast({
        title: "Match Added",
        description: `New match has been scheduled for ${format(new Date(newMatchDate), 'MMMM d, yyyy')}.`,
      });
      
      // If the match is in super_six or later stages, update the teams' stage
      if (newMatchStage !== 'group') {
        // Get the teams involved in this match
        const team1 = teams.find(t => t.id === newMatchTeam1);
        const team2 = teams.find(t => t.id === newMatchTeam2);
        
        // Update team stages if needed
        if (team1 && (!team1.stage || team1.stage === 'group')) {
          await supabase
            .from('tournament_teams')
            .update({ stage: newMatchStage })
            .eq('id', team1.id);
          
          // Update local state
          setTeams(teams.map(t => t.id === team1.id ? { ...t, stage: newMatchStage } : t));
        }
        
        if (team2 && (!team2.stage || team2.stage === 'group')) {
          await supabase
            .from('tournament_teams')
            .update({ stage: newMatchStage })
            .eq('id', team2.id);
          
          // Update local state
          setTeams(teams.map(t => t.id === team2.id ? { ...t, stage: newMatchStage } : t));
        }
      }
      
      // Reset form
      setNewMatchTeam1("");
      setNewMatchTeam2("");
      setNewMatchDate(format(new Date(), 'yyyy-MM-dd'));
      setNewMatchStage("group");
      setNewMatchGroup("");
      setShowAddMatchDialog(false);
      
    } catch (error) {
      console.error('Error adding match:', error);
      toast({
        title: "Error",
        description: "Failed to add match. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingMatch(false);
    }
  };
  
  // Function to update tournament settings
  const handleSaveSettings = async () => {
    if (!tournamentStartDate || !tournamentEndDate || !tournamentStatus) {
      toast({
        title: "Missing Information",
        description: "Please fill in all tournament settings.",
        variant: "destructive",
      });
      return;
    }
    
    if (new Date(tournamentStartDate) > new Date(tournamentEndDate)) {
      toast({
        title: "Invalid Dates",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }
    
    setIsEditingSettings(true);
    
    try {
      // Create the settings object
      const updatedSettings: TournamentSettings = {
        id: tournamentSettings?.id || '1',
        start_date: tournamentStartDate,
        end_date: tournamentEndDate,
        status: tournamentStatus
      };
      
      // Check if we have existing settings
      if (tournamentSettings?.id) {
        // Update existing settings
        const { data, error } = await supabase
          .from('tournament_settings')
          .update({
            start_date: tournamentStartDate,
            end_date: tournamentEndDate,
            status: tournamentStatus
          })
          .eq('id', tournamentSettings.id)
          .select()
          .single();
        
        if (error) throw error;
        setTournamentSettings(data);
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from('tournament_settings')
          .insert(updatedSettings)
          .select()
          .single();
        
        if (error) throw error;
        setTournamentSettings(data);
      }
      
      toast({
        title: "Settings Saved",
        description: "Tournament settings have been updated.",
      });
      
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditingSettings(false);
    }
  };

  // Function to delete a team
  const handleDeleteTeam = async (teamId: string) => {
    if (!teamId) return;
    
    try {
      // Delete from database
      const { error } = await supabase
        .from('tournament_teams')
        .delete()
        .eq('id', teamId);
      
      if (error) throw error;
      
      // Update local state
      setTeams(teams.filter(team => team.id !== teamId));
      
      toast({
        title: "Team Deleted",
        description: "The team has been removed from the tournament.",
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to delete a match
  const handleDeleteMatch = async (matchId: string) => {
    if (!matchId) return;
    
    try {
      // Delete from database
      const { error } = await supabase
        .from('tournament_matches')
        .delete()
        .eq('id', matchId);
      
      if (error) throw error;
      
      // Update local state
      setMatches(matches.filter(match => match.id !== matchId));
      
      toast({
        title: "Match Deleted",
        description: "The match has been removed from the schedule.",
      });
    } catch (error) {
      console.error('Error deleting match:', error);
      toast({
        title: "Error",
        description: "Failed to delete match. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Render loading state
  if (loading || !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Link href="/admin" className="hover:text-orange-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-orange-800 font-heading">Tournament Management</h1>
          </div>
          <p className="text-muted-foreground mt-1">Configure tournament details, teams, and matches</p>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-8">
          <TabsTrigger value="settings">Tournament Settings</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
        </TabsList>
        
        {/* Tournament Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                Tournament Schedule
              </CardTitle>
              <CardDescription>Set up the tournament dates and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input 
                      id="start-date" 
                      type="date" 
                      value={tournamentStartDate} 
                      onChange={(e) => setTournamentStartDate(e.target.value)}
                      disabled={!isEditingSettings}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input 
                      id="end-date" 
                      type="date" 
                      value={tournamentEndDate} 
                      onChange={(e) => setTournamentEndDate(e.target.value)}
                      disabled={!isEditingSettings}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Tournament Status</Label>
                  <Select 
                    value={tournamentStatus} 
                    onValueChange={(value: 'upcoming' | 'active' | 'completed') => setTournamentStatus(value)}
                    disabled={!isEditingSettings}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select tournament status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-2">
                  {isEditingSettings ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditingSettings(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveSettings}>
                        Save Settings
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditingSettings(true)}>
                      Edit Settings
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Tournament Teams</h2>
            <Dialog open={showAddTeamDialog} onOpenChange={setShowAddTeamDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                  <DialogDescription>
                    Add a new team to the tournament. Each team consists of 2 players.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input 
                      id="team-name" 
                      placeholder="Enter team name" 
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="player1">Player 1</Label>
                    <Select value={newTeamPlayer1} onValueChange={setNewTeamPlayer1}>
                      <SelectTrigger id="player1">
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="player2">Player 2</Label>
                    <Select value={newTeamPlayer2} onValueChange={setNewTeamPlayer2}>
                      <SelectTrigger id="player2">
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="group">Group</Label>
                    <Select value={newTeamGroup} onValueChange={setNewTeamGroup}>
                      <SelectTrigger id="group">
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Group A</SelectItem>
                        <SelectItem value="B">Group B</SelectItem>
                        <SelectItem value="C">Group C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddTeamDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTeam} disabled={addingTeam}>
                    {addingTeam ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Team'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {teams.length === 0 ? (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No teams added yet</p>
                <p className="text-muted-foreground text-sm mb-4">Start by adding teams to the tournament</p>
                <Button onClick={() => setShowAddTeamDialog(true)}>
                  Add First Team
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => {
                const player1 = members.find(m => m.id === team.player1_id);
                const player2 = members.find(m => m.id === team.player2_id);
                
                return (
                  <Card key={team.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{team.name}</CardTitle>
                          <CardDescription>Group {team.group}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => team.id && handleDeleteTeam(team.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={player1?.image || ''} alt={player1?.name} />
                            <AvatarFallback>{player1?.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <span>{player1?.name || 'Unknown Player'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={player2?.image || ''} alt={player2?.name} />
                            <AvatarFallback>{player2?.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <span>{player2?.name || 'Unknown Player'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Tournament Matches</h2>
            <Dialog open={showAddMatchDialog} onOpenChange={setShowAddMatchDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Match
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule New Match</DialogTitle>
                  <DialogDescription>
                    Create a new match between two teams.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="team1">Team 1</Label>
                    <Select value={newMatchTeam1} onValueChange={setNewMatchTeam1}>
                      <SelectTrigger id="team1">
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="team2">Team 2</Label>
                    <Select value={newMatchTeam2} onValueChange={setNewMatchTeam2}>
                      <SelectTrigger id="team2">
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="match-date">Match Date</Label>
                    <Input 
                      id="match-date" 
                      type="date" 
                      value={newMatchDate}
                      onChange={(e) => setNewMatchDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stage">Tournament Stage</Label>
                    <Select 
                      value={newMatchStage} 
                      onValueChange={(value: 'group' | 'super_six' | 'semifinal' | 'final') => setNewMatchStage(value)}
                    >
                      <SelectTrigger id="stage">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="group">Group Stage</SelectItem>
                        <SelectItem value="super_six">Super Six</SelectItem>
                        <SelectItem value="semifinal">Semi-Finals</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {newMatchStage === 'group' && (
                    <div className="space-y-2">
                      <Label htmlFor="match-group">Group</Label>
                      <Select value={newMatchGroup} onValueChange={setNewMatchGroup}>
                        <SelectTrigger id="match-group">
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Group A</SelectItem>
                          <SelectItem value="B">Group B</SelectItem>
                          <SelectItem value="C">Group C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddMatchDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMatch} disabled={addingMatch}>
                    {addingMatch ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Schedule Match'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {matches.length === 0 ? (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <ListChecks className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No matches scheduled yet</p>
                <p className="text-muted-foreground text-sm mb-4">Start by adding matches to the tournament</p>
                <Button onClick={() => setShowAddMatchDialog(true)}>
                  Add First Match
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Group matches by stage */}
              {(['group', 'super_six', 'semifinal', 'final'] as const).map((stage) => {
                const stageMatches = matches.filter(match => match.stage === stage);
                if (stageMatches.length === 0) return null;
                
                const stageTitle = {
                  'group': 'Group Stage',
                  'super_six': 'Super Six',
                  'semifinal': 'Semi-Finals',
                  'final': 'Final'
                }[stage];
                
                return (
                  <div key={stage} className="space-y-2">
                    <h3 className="text-lg font-medium">{stageTitle}</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {stageMatches.map((match) => {
                        const team1 = teams.find(t => t.id === match.team1_id);
                        const team2 = teams.find(t => t.id === match.team2_id);
                        const matchDate = new Date(match.date);
                        
                        return (
                          <Card key={match.id}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">
                                  {stage === 'group' && `Group ${match.group}`}
                                </CardTitle>
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => match.id && handleDeleteMatch(match.id)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <CardDescription>
                                {format(matchDate, 'MMMM d, yyyy')}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-center">
                                <div className="text-center flex-1">
                                  <p className="font-medium">{team1?.name || 'TBD'}</p>
                                </div>
                                <div className="mx-2 text-xl font-bold text-muted-foreground">vs</div>
                                <div className="text-center flex-1">
                                  <p className="font-medium">{team2?.name || 'TBD'}</p>
                                </div>
                              </div>
                              
                              {match.scores && (
                                <div className="flex justify-between items-center mt-2 border-t pt-2">
                                  <div className="text-center flex-1">
                                    <p className="text-2xl font-bold">{match.scores.team1_score}</p>
                                  </div>
                                  <div className="mx-2 text-sm text-muted-foreground">Final Score</div>
                                  <div className="text-center flex-1">
                                    <p className="text-2xl font-bold">{match.scores.team2_score}</p>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 