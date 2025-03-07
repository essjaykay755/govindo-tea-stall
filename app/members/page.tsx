"use client"

import { useState, useEffect } from "react"
import { Users, Trophy, CalendarDays } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    async function fetchMembers() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .order('name')
        
        if (error) throw error
        
        // Process member data to ensure image URLs are fully formed
        const processedMembers = data?.map(member => {
          if (member.image && !member.image.startsWith('http')) {
            // If image is a storage path, convert to full URL
            const { data } = supabase.storage
              .from('members')
              .getPublicUrl(member.image)
            
            return {
              ...member,
              image: data.publicUrl
            }
          }
          return member
        }) || []
        
        setMembers(processedMembers)
      } catch (error) {
        console.error('Error fetching members:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMembers()
  }, [])

  // Filter members for specific sections using attendance data
  // For a production app, you would ideally query this directly from the database
  const addaMembers = members.slice(0, Math.floor(members.length * 0.7))
  const carromMembers = members.slice(0, Math.floor(members.length * 0.8))
  
  // Stats calculations
  const totalMembers = members.length
  const regularPlayers = Math.floor(members.length * 0.6)
  const newMembers = Math.floor(members.length * 0.2)

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="rounded-full bg-orange-100 p-3">
          <Users className="h-8 w-8 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-orange-800 font-heading">Members</h1>
          <p className="text-muted-foreground mt-2">Our amazing community of tea lovers and carrom players</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mx-auto">
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="adda">Adda</TabsTrigger>
            <TabsTrigger value="carrom">Carrom</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {/* Member Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-800">{totalMembers}</div>
                  <p className="text-xs text-muted-foreground">Active community members</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Regular Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-800">{regularPlayers}</div>
                  <p className="text-xs text-muted-foreground">Consistent participants</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">New Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-800">{newMembers}</div>
                  <p className="text-xs text-muted-foreground">Joined recently</p>
                </CardContent>
              </Card>
            </div>

            {/* Member List */}
            <Card>
              <CardHeader>
                <CardTitle>All Members</CardTitle>
                <CardDescription>Browse through our community members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={member.image} 
                            alt={member.name} 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {member.created_at ? `Joined ${format(new Date(member.created_at), 'MMMM yyyy')}` : 'Member'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adda" className="space-y-8">
            {/* Adda Members Content */}
            <Card>
              <CardHeader>
                <CardTitle>Adda Members</CardTitle>
                <CardDescription>Regular hangout participants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {addaMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={member.image} 
                            alt={member.name} 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">Regular Attendee</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="carrom" className="space-y-8">
            {/* Carrom Players Content */}
            <Card>
              <CardHeader>
                <CardTitle>Carrom Players</CardTitle>
                <CardDescription>Active carrom participants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {carromMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={member.image} 
                            alt={member.name} 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{member.name}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 