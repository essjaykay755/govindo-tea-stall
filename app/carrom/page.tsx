"use client"

import { GamepadIcon, Users2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Attendance as AttendanceType } from "@/lib/supabase"
import { useAuth } from "@/components/auth/AuthContext"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

export default function CarromPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [attendance, setAttendance] = useState<AttendanceType[]>([])
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Get formatted date
  const formattedDate = format(date, 'yyyy-MM-dd')
  const displayDate = format(date, 'EEEE, MMMM d, yyyy')

  // Function to navigate dates
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(date)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    // Only set date if it's not in the future
    if (newDate <= new Date()) {
      setDate(newDate)
    }
  }

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      try {
        // Fetch members
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('*')
        
        if (membersError) {
          console.error('Error fetching members:', membersError)
          throw membersError
        }
        
        // Process member data to ensure image URLs are fully formed
        const processedMembers = membersData?.map(member => {
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

        // Fetch partner assignments using a different approach
        try {
          // First, get the raw partner assignments
          const { data: rawPartnersData, error: partnersError } = await supabase
            .from('partner_assignments')
            .select('id, player1_id, player2_id')
            .eq('date', formattedDate)
          
          if (partnersError) {
            console.error('Error fetching partners:', partnersError)
            setPartners([])
          } else if (rawPartnersData && rawPartnersData.length > 0) {
            // Now manually build the partner objects with member details
            const enhancedPartners = rawPartnersData.map(pair => {
              const player1 = processedMembers.find(m => m.id === pair.player1_id) || { 
                id: pair.player1_id, 
                name: 'Unknown Player', 
                image: null 
              }
              
              const player2 = processedMembers.find(m => m.id === pair.player2_id) || { 
                id: pair.player2_id, 
                name: 'Unknown Player', 
                image: null 
              }
              
              return {
                id: pair.id,
                player1,
                player2
              }
            })
            
            setPartners(enhancedPartners)
          } else {
            setPartners([])
          }
        } catch (partnerError) {
          console.error('Error processing partners:', partnerError)
          setPartners([])
        }

        try {
          // Fetch attendance for the selected date
          const { data: attendanceData, error: attendanceError } = await supabase
            .from('attendance')
            .select('*')
            .eq('date', formattedDate)
            .eq('section', 'Carrom')
          
          if (attendanceError) {
            console.error('Error fetching attendance:', attendanceError)
            // Don't throw here, just set empty attendance
            setAttendance([])
          } else {
            setAttendance(attendanceData || [])
          }
        } catch (attendanceError) {
          console.error('Exception fetching attendance:', attendanceError)
          setAttendance([])
        }

        // Fetch photos for the selected date
        const { data: photosData, error: photosError } = await supabase
          .from('photo_history')
          .select('*')
          .eq('date', formattedDate)
        
        if (photosError) {
          console.error('Error fetching photos:', photosError)
          // Don't throw here, just set empty photos
          setPhotos([])
        } else {
          if (photosData && photosData.length > 0) {
            // Transform photo URLs to include storage URL
            const photosWithUrls = photosData.map(photo => {
              const { data: publicUrl } = supabase.storage
                .from('photos')
                .getPublicUrl(photo.image_url)
              
              return {
                ...photo,
                url: publicUrl.publicUrl,
                alt: `Photo from ${format(parseISO(photo.date), 'MMMM d, yyyy')}`
              }
            })
            
            setPhotos(photosWithUrls)
          } else {
            setPhotos([])
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again later.",
          variant: "destructive",
          duration: 5000,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [formattedDate, toast])

  // Mark attendance
  const markAttendance = async (memberId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to mark attendance.",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    try {
      const isPresent = attendance.some(record => record.user_id === memberId)
      const existingRecord = attendance.find(record => record.user_id === memberId)
      
      if (isPresent && existingRecord) {
        // Remove attendance
        const { error: deleteError } = await supabase
          .from('attendance')
          .delete()
          .eq('id', existingRecord.id)
        
        if (deleteError) {
          console.error('Error deleting attendance:', deleteError)
          throw deleteError
        }
        
        // Update local state
        setAttendance(attendance.filter(record => record.user_id !== memberId))
        
        toast({
          title: "Attendance Removed",
          description: "Member attendance has been removed.",
          duration: 5000,
        })
      } else {
        // Add attendance
        const { data: newRecord, error } = await supabase
          .from('attendance')
          .insert([
            { 
              user_id: memberId, 
              date: formattedDate, 
              section: 'Carrom' 
            }
          ])
          .select()
          .single()
        
        if (error) throw error
        
        // Update local state
        if (newRecord) {
          setAttendance([...attendance, newRecord])
        }
        
        toast({
          title: "Attendance Marked",
          description: "Member attendance has been recorded.",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error marking attendance:', error)
      toast({
        title: "Error",
        description: "Failed to update attendance. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="rounded-full bg-orange-100 p-3">
          <GamepadIcon className="h-8 w-8 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-orange-800 font-heading">Carrom Section</h1>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal w-[240px]",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {displayDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDate('next')}
              disabled={
                date.getDate() === new Date().getDate() && 
                date.getMonth() === new Date().getMonth() && 
                date.getFullYear() === new Date().getFullYear()
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      ) : (
        <>
          {/* Image Slider */}
          <Card>
            <CardHeader>
              <CardTitle>Memories</CardTitle>
              <CardDescription>Photos from {displayDate}</CardDescription>
            </CardHeader>
            <CardContent>
              {photos.length > 0 ? (
                <div className="relative overflow-hidden rounded-lg bg-orange-50">
                  <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory">
                    {photos.map((photo, i) => (
                      <div key={i} className="flex-none w-full snap-center">
                        <div className="aspect-[4/3] rounded-lg overflow-hidden">
                          <img 
                            src={photo.url} 
                            alt={photo.alt} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-orange-50 rounded-lg">
                  <p className="text-muted-foreground">No photos available for this date</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Partners List */}
          <Card>
            <CardHeader>
              <CardTitle>Partners</CardTitle>
              <CardDescription>Partner assignments for {displayDate}</CardDescription>
            </CardHeader>
            <CardContent>
              {partners && partners.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {partners.map((pair, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200">
                      <div className="flex -space-x-4">
                        <Avatar className="h-16 w-16 border-2 border-orange-100">
                          <AvatarImage 
                            src={pair.player1?.image || ''} 
                            alt={pair.player1?.name || 'Player 1'} 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <AvatarFallback className="bg-orange-100 text-orange-800">
                            {pair.player1?.name ? pair.player1.name.charAt(0) : 'P1'}
                          </AvatarFallback>
                        </Avatar>
                        <Avatar className="h-16 w-16 border-2 border-orange-100">
                          <AvatarImage 
                            src={pair.player2?.image || ''} 
                            alt={pair.player2?.name || 'Player 2'} 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <AvatarFallback className="bg-orange-100 text-orange-800">
                            {pair.player2?.name ? pair.player2.name.charAt(0) : 'P2'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <p className="font-medium text-orange-800">
                          {pair.player1?.name || 'Unknown'} & {pair.player2?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-orange-50 rounded-lg">
                  <p className="text-muted-foreground">No partner assignments for this date</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance List */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
              <CardDescription>Member attendance for {displayDate}</CardDescription>
            </CardHeader>
            <CardContent>
              {!user && (
                <Alert className="mb-4">
                  <AlertTitle>Authentication Required</AlertTitle>
                  <AlertDescription>
                    Please sign in to mark attendance.
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((member, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border",
                      user && "cursor-pointer hover:bg-orange-50",
                      attendance.some(record => record.user_id === member.id) && "bg-orange-50 border-orange-200"
                    )}
                    onClick={() => user && markAttendance(member.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={member.image} 
                        alt={member.name} 
                        onError={(e) => {
                          // If image fails to load, use fallback
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 font-medium">{member.name}</span>
                    {attendance.some(record => record.user_id === member.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 