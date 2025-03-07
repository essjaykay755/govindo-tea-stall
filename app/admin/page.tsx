"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Upload, 
  Users2, 
  Loader2,
  UserCog,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import type { Attendance as AttendanceType } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [loadingData, setLoadingData] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [attendance, setAttendance] = useState<AttendanceType[]>([]);
  const [updatingAttendance, setUpdatingAttendance] = useState<string | null>(null);
  
  const formattedDate = format(date, 'yyyy-MM-dd');
  const displayDate = format(date, 'EEEE, MMMM d, yyyy');

  // Function to navigate dates
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(date);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    // Only set date if it's not in the future
    if (newDate <= new Date()) {
      setDate(newDate);
    }
  };

  // Check if user is admin
  useEffect(() => {
    if (!loading) {
      // Only allow essjaykay755@gmail.com to access the admin panel
      if (!isAdmin || (user?.email !== 'essjaykay755@gmail.com')) {
        router.push('/');
      }
    }
  }, [loading, isAdmin, router, user]);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      if (!isAdmin) return;
      
      setLoadingData(true);
      
      try {
        // Fetch members
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('*')
          .order('name');
        
        if (membersError) throw membersError;
        setMembers(membersData || []);

        // Fetch partner assignments for the selected date
        const { data: partnersData, error: partnersError } = await supabase
          .from('partner_assignments')
          .select('id, player1_id, player2_id')
          .eq('date', formattedDate);
        
        if (partnersError) throw partnersError;
        setPartners(partnersData || []);
        
        // Fetch attendance for the selected date
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('*')
          .eq('date', formattedDate)
          .eq('section', 'Carrom');
        
        if (attendanceError) throw attendanceError;
        setAttendance(attendanceData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again later.",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, [isAdmin, formattedDate, toast]);

  // Upload photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setPhoto(files[0]);
  };

  const uploadPhoto = async () => {
    if (!photo) return;
    
    setUploadingPhoto(true);
    
    try {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${formattedDate}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `daily/${fileName}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, photo);
      
      if (uploadError) throw uploadError;
      
      // Save to database
      const { error: dbError } = await supabase
        .from('photo_history')
        .upsert([
          {
            date: formattedDate,
            image_url: filePath,
          }
        ]);
      
      if (dbError) throw dbError;
      
      toast({
        title: "Success",
        description: "Photo uploaded successfully.",
        duration: 5000,
      });
      
      setPhoto(null);
      // Reset the file input
      const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Save partner assignment
  const handlePartnerSelect = async (value: string, partnerIndex: number, partnerPosition: 'player1_id' | 'player2_id') => {
    try {
      // If this pair already exists in the database
      const existingPair = partners[partnerIndex];
      
      if (existingPair) {
        // Update existing pair
        const { error } = await supabase
          .from('partner_assignments')
          .update({ [partnerPosition]: value })
          .eq('id', existingPair.id);
        
        if (error) throw error;
        
        // Update local state
        const updatedPartners = [...partners];
        updatedPartners[partnerIndex] = {
          ...existingPair,
          [partnerPosition]: value,
        };
        setPartners(updatedPartners);
      } else {
        // Create new pair
        const newPair = {
          date: formattedDate,
          player1_id: partnerPosition === 'player1_id' ? value : null,
          player2_id: partnerPosition === 'player2_id' ? value : null,
        };
        
        const { data, error } = await supabase
          .from('partner_assignments')
          .insert([newPair])
          .select();
        
        if (error) throw error;
        
        // Add to local state
        setPartners([...partners, data[0]]);
      }
      
      toast({
        title: "Success",
        description: "Partner assignment updated.",
        duration: 5000,
      });
    } catch (error) {
      console.error('Error updating partner assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update partner assignment. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Add a new partner pair
  const addPartnerPair = () => {
    setPartners([...partners, { id: `temp-${Date.now()}`, player1_id: null, player2_id: null }]);
  };

  // Remove a partner pair
  const removePartnerPair = async (index: number) => {
    const pair = partners[index];
    
    // If it's a temporary pair that hasn't been saved to DB yet
    if (pair.id.toString().startsWith('temp-')) {
      const updatedPartners = [...partners];
      updatedPartners.splice(index, 1);
      setPartners(updatedPartners);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('partner_assignments')
        .delete()
        .eq('id', pair.id);
      
      if (error) throw error;
      
      const updatedPartners = [...partners];
      updatedPartners.splice(index, 1);
      setPartners(updatedPartners);
      
      toast({
        title: "Success",
        description: "Partner pair removed.",
        duration: 5000,
      });
    } catch (error) {
      console.error('Error removing partner pair:', error);
      toast({
        title: "Error",
        description: "Failed to remove partner pair. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  // Toggle member attendance
  const toggleAttendance = async (memberId: string) => {
    setUpdatingAttendance(memberId);
    
    try {
      const isPresent = attendance.some(record => record.user_id === memberId);
      const existingRecord = attendance.find(record => record.user_id === memberId);
      
      if (isPresent && existingRecord) {
        // Remove attendance
        const { error: deleteError } = await supabase
          .from('attendance')
          .delete()
          .eq('id', existingRecord.id);
        
        if (deleteError) {
          console.error('Error deleting attendance:', deleteError);
          throw deleteError;
        }
        
        // Update local state
        setAttendance(attendance.filter(record => record.user_id !== memberId));
      } else {
        // Add attendance
        const { data: newRecord, error } = await supabase
          .from('attendance')
          .insert([
            {
              date: formattedDate,
              user_id: memberId,
              section: 'Carrom'
            }
          ])
          .select()
          .single();
        
        if (error) throw error;
        
        // Update local state
        if (newRecord) {
          setAttendance([...attendance, newRecord]);
        }
      }
      
      toast({
        title: "Success",
        description: `Attendance ${isPresent ? 'removed' : 'marked'}.`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update attendance. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setUpdatingAttendance(null);
    }
  };

  const getAvatarUrl = (image: string | null) => {
    if (!image) return '';
    
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/members/${image}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-orange-800 font-heading">Admin Panel</h1>
        <div className="flex items-center gap-4">
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
          <Link href="/admin/members">
            <Button variant="outline" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Member Management
            </Button>
          </Link>
        </div>
      </div>

      {loadingData ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      ) : (
        <>
          {/* Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance for {displayDate}</CardTitle>
              <CardDescription>Mark who is present today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {members.map((member) => {
                  const isPresent = attendance.some(record => record.user_id === member.id);
                  return (
                    <div 
                      key={member.id} 
                      className={`flex items-center p-4 rounded-lg border ${isPresent ? 'bg-green-50 border-green-200' : ''}`}
                    >
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={getAvatarUrl(member.image)} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {updatingAttendance === member.id ? (
                          <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                        ) : (
                          <Switch 
                            checked={isPresent}
                            onCheckedChange={() => toggleAttendance(member.id)}
                            disabled={updatingAttendance === member.id}
                            className="data-[state=checked]:bg-green-600"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Partner Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Partner Assignments for {displayDate}</CardTitle>
              <CardDescription>Assign partners for today's games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {partners.map((pair, index) => (
                  <div key={index} className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-lg border relative">
                    <div className="absolute top-2 right-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={() => removePartnerPair(index)}
                      >
                        ✕
                      </Button>
                    </div>
                    
                    <div className="flex flex-1 items-center gap-2">
                      <Avatar className="h-10 w-10 bg-orange-100">
                        <AvatarFallback>P1</AvatarFallback>
                      </Avatar>
                      <Select
                        value={pair.player1_id ?? ""}
                        onValueChange={(value) => handlePartnerSelect(value, index, 'player1_id')}
                      >
                        <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Select Player 1" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="rounded-full bg-orange-100 p-2">
                      <Users2 className="h-5 w-5 text-orange-600" />
                    </div>
                    
                    <div className="flex flex-1 items-center gap-2">
                      <Avatar className="h-10 w-10 bg-orange-100">
                        <AvatarFallback>P2</AvatarFallback>
                      </Avatar>
                      <Select
                        value={pair.player2_id ?? ""}
                        onValueChange={(value) => handlePartnerSelect(value, index, 'player2_id')}
                      >
                        <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Select Player 2" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                
                <Button onClick={addPartnerPair} className="w-full">
                  Add Partner Pair
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Photo for {displayDate}</CardTitle>
              <CardDescription>Upload a photo for today's gathering</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <label htmlFor="photo-upload" className="text-sm font-medium">
                    Photo
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="rounded-md border border-input p-2"
                    onChange={handlePhotoUpload}
                  />
                </div>
                
                {photo && (
                  <div className="mt-2">
                    <p className="text-sm">Selected: {photo.name}</p>
                  </div>
                )}
                
                <Button
                  onClick={uploadPhoto}
                  disabled={!photo || uploadingPhoto}
                  className="flex items-center gap-2"
                >
                  {uploadingPhoto ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 