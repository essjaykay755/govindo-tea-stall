"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Upload, 
  Users2, 
  Loader2,
  UserCog,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Trash,
  Pencil,
  Trophy
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
  const [photos, setPhotos] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<AttendanceType[]>([]);
  const [updatingAttendance, setUpdatingAttendance] = useState<string | null>(null);
  const [editPhotoId, setEditPhotoId] = useState<string | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  
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
        
        // Fetch photos for the selected date
        const { data: photosData, error: photosError } = await supabase
          .from('photo_history')
          .select('*')
          .eq('date', formattedDate);
        
        if (photosError) {
          console.error('Error fetching photos:', photosError);
        } else {
          if (photosData && photosData.length > 0) {
            // Transform photo URLs to include storage URL
            const photosWithUrls = photosData.map(photo => {
              const { data: publicUrl } = supabase.storage
                .from('photos')
                .getPublicUrl(photo.image_url);
              
              return {
                ...photo,
                url: publicUrl.publicUrl,
                alt: `Photo from ${format(parseISO(photo.date), 'MMMM d, yyyy')}`
              };
            });
            
            setPhotos(photosWithUrls);
          } else {
            setPhotos([]);
          }
        }
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
      
      // Refresh photos after upload
      const { data: newPhotosData } = await supabase
        .from('photo_history')
        .select('*')
        .eq('date', formattedDate);
      
      if (newPhotosData && newPhotosData.length > 0) {
        const photosWithUrls = newPhotosData.map(photo => {
          const { data: publicUrl } = supabase.storage
            .from('photos')
            .getPublicUrl(photo.image_url);
          
          return {
            ...photo,
            url: publicUrl.publicUrl,
            alt: `Photo from ${format(parseISO(photo.date), 'MMMM d, yyyy')}`
          };
        });
        
        setPhotos(photosWithUrls);
      }
      
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

  // Delete photo
  const deletePhoto = async (photoId: string, photoPath: string) => {
    setDeletingPhotoId(photoId);
    
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([photoPath]);
      
      if (storageError) {
        console.error('Error deleting photo from storage:', storageError);
        throw storageError;
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('photo_history')
        .delete()
        .eq('id', photoId);
      
      if (dbError) {
        console.error('Error deleting photo from database:', dbError);
        throw dbError;
      }
      
      // Update local state
      setPhotos(photos.filter(photo => photo.id !== photoId));
      
      toast({
        title: "Success",
        description: "Photo deleted successfully.",
        duration: 5000,
      });
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Error",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setDeletingPhotoId(null);
    }
  };

  // Replace photo
  const replacePhoto = async (photoId: string, oldPhotoPath: string) => {
    if (!photo) return;
    
    setUploadingPhoto(true);
    
    try {
      // Delete old photo from storage
      await supabase.storage
        .from('photos')
        .remove([oldPhotoPath]);
      
      // Upload new photo
      const fileExt = photo.name.split('.').pop();
      const fileName = `${formattedDate}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `daily/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, photo);
      
      if (uploadError) throw uploadError;
      
      // Update in database
      const { error: dbError } = await supabase
        .from('photo_history')
        .update({ image_url: filePath })
        .eq('id', photoId);
      
      if (dbError) throw dbError;
      
      // Refresh photos
      const { data: newPhotosData } = await supabase
        .from('photo_history')
        .select('*')
        .eq('date', formattedDate);
      
      if (newPhotosData && newPhotosData.length > 0) {
        const photosWithUrls = newPhotosData.map(photo => {
          const { data: publicUrl } = supabase.storage
            .from('photos')
            .getPublicUrl(photo.image_url);
          
          return {
            ...photo,
            url: publicUrl.publicUrl,
            alt: `Photo from ${format(parseISO(photo.date), 'MMMM d, yyyy')}`
          };
        });
        
        setPhotos(photosWithUrls);
      }
      
      toast({
        title: "Success",
        description: "Photo replaced successfully.",
        duration: 5000,
      });
      
      setPhoto(null);
      setEditPhotoId(null);
      
      // Reset the file input
      const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error replacing photo:', error);
      toast({
        title: "Error",
        description: "Failed to replace photo. Please try again.",
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
      // Check if the member is present
      const isMemberPresent = attendance.some(record => record.user_id === value);
      
      if (!isMemberPresent) {
        toast({
          title: "Error",
          description: "Only present members can be assigned as partners.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
      
      // Get the existing pair from state
      const existingPair = partners[partnerIndex];
      
      // Check if this is a temporary pair (not yet saved to the database)
      if (existingPair && existingPair.id.toString().startsWith('temp-')) {
        // Update the pair in local state
        const updatedPartner = {
          ...existingPair,
          [partnerPosition]: value,
        };
        
        // Check if both players are now selected
        if (
          (partnerPosition === 'player1_id' && updatedPartner.player2_id) ||
          (partnerPosition === 'player2_id' && updatedPartner.player1_id)
        ) {
          // Both players are selected, save to database
          const newPair = {
            date: formattedDate,
            player1_id: updatedPartner.player1_id,
            player2_id: updatedPartner.player2_id,
          };
          
          const { data, error } = await supabase
            .from('partner_assignments')
            .insert([newPair])
            .select();
          
          if (error) throw error;
          
          // Update in local state - replace temp with real DB record
          const updatedPartners = [...partners];
          updatedPartners[partnerIndex] = data[0];
          setPartners(updatedPartners);
          
          toast({
            title: "Success",
            description: "Partner assignment saved to database.",
            duration: 5000,
          });
        } else {
          // Only one player selected, just update local state
          const updatedPartners = [...partners];
          updatedPartners[partnerIndex] = updatedPartner;
          setPartners(updatedPartners);
          
          toast({
            title: "Success",
            description: "Partner assignment updated. Select the other player to save.",
            duration: 5000,
          });
        }
        return;
      }
      
      // This is a pair that exists in the database
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
        
        toast({
          title: "Success",
          description: "Partner assignment updated.",
          duration: 5000,
        });
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
        
        toast({
          title: "Success",
          description: "Partner assignment created.",
          duration: 5000,
        });
      }
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
        
        // When a member is marked absent, remove them from any partner assignments
        const updatedPartners = [...partners];
        let partnerAssignmentsChanged = false;
        
        // Check for database-saved partners
        const dbPartners = updatedPartners.filter(pair => !pair.id.toString().startsWith('temp-'));
        for (const pair of dbPartners) {
          if (pair.player1_id === memberId || pair.player2_id === memberId) {
            partnerAssignmentsChanged = true;
            // Remove the member from the pair in the database
            const update = pair.player1_id === memberId 
              ? { player1_id: null } 
              : { player2_id: null };
            
            await supabase
              .from('partner_assignments')
              .update(update)
              .eq('id', pair.id);
            
            // Update local state
            const index = updatedPartners.findIndex(p => p.id === pair.id);
            if (index !== -1) {
              updatedPartners[index] = {
                ...pair,
                ...update
              };
            }
          }
        }
        
        // Check for temporary partners
        const tempPartners = updatedPartners.filter(pair => pair.id.toString().startsWith('temp-'));
        for (const pair of tempPartners) {
          if (pair.player1_id === memberId || pair.player2_id === memberId) {
            partnerAssignmentsChanged = true;
            // Update the temporary pair
            const index = updatedPartners.findIndex(p => p.id === pair.id);
            if (index !== -1) {
              if (pair.player1_id === memberId) {
                updatedPartners[index] = { ...pair, player1_id: null };
              } else {
                updatedPartners[index] = { ...pair, player2_id: null };
              }
            }
          }
        }
        
        // Update partners state if any changes were made
        if (partnerAssignmentsChanged) {
          setPartners(updatedPartners);
          toast({
            title: "Partner Assignments Updated",
            description: "The member was removed from partner assignments.",
            duration: 5000,
          });
        }
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
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-3xl font-bold text-orange-800 font-heading">Admin Panel</h1>
        
        {/* Date Navigation */}
        <div className="flex flex-wrap items-center gap-2 w-full">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate('prev')}
            className="flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal flex-grow min-w-[180px] max-w-[240px]",
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
            className="flex-shrink-0"
            disabled={
              date.getDate() === new Date().getDate() && 
              date.getMonth() === new Date().getMonth() && 
              date.getFullYear() === new Date().getFullYear()
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Link href="/admin/members" className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            <Button variant="outline" className="flex items-center gap-2 w-full">
              <UserCog className="h-4 w-4" />
              Member Management
            </Button>
          </Link>
          <Link href="/admin/tournament" className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 ml-2">
            <Button variant="outline" className="flex items-center gap-2 w-full">
              <Trophy className="h-4 w-4" />
              Tournament Management
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
          <Card className="overflow-hidden">
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
                      className={`flex items-center p-3 rounded-lg border ${isPresent ? 'bg-green-50 border-green-200' : ''}`}
                    >
                      <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                        <AvatarImage src={getAvatarUrl(member.image)} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                      </div>
                      <div className="flex items-center ml-1">
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
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Partner Assignments for {displayDate}</CardTitle>
              <CardDescription>Assign partners for today's games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {partners.map((pair, index) => (
                  <div key={index} className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-lg border relative pb-6 md:pb-4">
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
                    
                    <div className="flex flex-1 w-full md:w-auto items-center gap-2 mb-3 md:mb-0">
                      <Avatar className="h-10 w-10 bg-orange-100 flex-shrink-0">
                        <AvatarFallback>P1</AvatarFallback>
                      </Avatar>
                      <Select
                        value={pair.player1_id ?? ""}
                        onValueChange={(value) => handlePartnerSelect(value, index, 'player1_id')}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Player 1" />
                        </SelectTrigger>
                        <SelectContent>
                          {members
                            .filter(member => attendance.some(record => record.user_id === member.id))
                            .map((member) => (
                              <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                            ))
                          }
                          {!members.some(member => attendance.some(record => record.user_id === member.id)) && (
                            <div className="px-2 py-1 text-sm text-muted-foreground">
                              No present members available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="rounded-full bg-orange-100 p-2 hidden md:block">
                      <Users2 className="h-5 w-5 text-orange-600" />
                    </div>
                    
                    <div className="flex flex-1 w-full md:w-auto items-center gap-2">
                      <Avatar className="h-10 w-10 bg-orange-100 flex-shrink-0">
                        <AvatarFallback>P2</AvatarFallback>
                      </Avatar>
                      <Select
                        value={pair.player2_id ?? ""}
                        onValueChange={(value) => handlePartnerSelect(value, index, 'player2_id')}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Player 2" />
                        </SelectTrigger>
                        <SelectContent>
                          {members
                            .filter(member => attendance.some(record => record.user_id === member.id))
                            .map((member) => (
                              <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                            ))
                          }
                          {!members.some(member => attendance.some(record => record.user_id === member.id)) && (
                            <div className="px-2 py-1 text-sm text-muted-foreground">
                              No present members available
                            </div>
                          )}
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

          {/* Daily Photos */}
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daily Photos for {displayDate}</CardTitle>
                <CardDescription>View photos from this date</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {photos.length > 0 ? (
                <div className="relative overflow-hidden rounded-lg bg-orange-50">
                  <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory p-4">
                    {photos.map((photo, i) => (
                      <div key={i} className="flex-none w-full max-w-xs sm:max-w-sm md:max-w-md snap-center">
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden group">
                          <img 
                            src={photo.url} 
                            alt={photo.alt} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex gap-2">
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="bg-white hover:bg-gray-100 text-gray-800"
                                onClick={() => setEditPhotoId(photo.id)}
                                disabled={!!deletingPhotoId}
                              >
                                <Pencil className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Edit</span>
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => deletePhoto(photo.id, photo.image_url)}
                                disabled={!!deletingPhotoId}
                              >
                                {deletingPhotoId === photo.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <Trash className="h-4 w-4 mr-1" />
                                )}
                                <span className="hidden sm:inline">Delete</span>
                              </Button>
                            </div>
                          </div>
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

          {/* Photo Upload */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>
                {editPhotoId ? 'Replace Photo' : 'Upload Photo'} for {displayDate}
              </CardTitle>
              <CardDescription>
                {editPhotoId ? 'Replace an existing photo' : 'Upload a new photo for today\'s gathering'}
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="space-y-4">
                <div className="w-full items-center gap-1.5">
                  <label htmlFor="photo-upload" className="text-sm font-medium">
                    Photo
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="rounded-md border border-input p-2 w-full text-sm"
                    onChange={handlePhotoUpload}
                  />
                </div>
                
                {photo && (
                  <div className="mt-2">
                    <p className="text-sm truncate">Selected: {photo.name}</p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {editPhotoId ? (
                    <>
                      <Button 
                        onClick={() => {
                          const photoToEdit = photos.find(p => p.id === editPhotoId);
                          if (photoToEdit) {
                            replacePhoto(photoToEdit.id, photoToEdit.image_url);
                          }
                        }} 
                        disabled={!photo || uploadingPhoto}
                        className="flex-1 min-w-[120px]"
                      >
                        {uploadingPhoto ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Replacing...
                          </>
                        ) : 'Replace Photo'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditPhotoId(null);
                          setPhoto(null);
                          const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                        className="min-w-[100px]"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={uploadPhoto} 
                      disabled={!photo || uploadingPhoto}
                      className="w-full sm:w-auto"
                    >
                      {uploadingPhoto ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : 'Upload Photo'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        {/* Attendance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users2 className="h-5 w-5 text-orange-600" />
              Attendance & Partners
            </CardTitle>
            <CardDescription>Manage player attendance and partner assignments</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowAttendanceTab(true)}>Manage</Button>
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Upload className="h-5 w-5 text-orange-600" />
              Photo Gallery
            </CardTitle>
            <CardDescription>Upload and manage photos for {displayDate}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowPhotosTab(true)}>Manage</Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Member Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserCog className="h-5 w-5 text-orange-600" />
              Members
            </CardTitle>
            <CardDescription>Add, edit, or remove members</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex justify-end">
              <Link href="/admin/members" className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                <Button variant="outline" size="sm">Manage</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Tournament Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Trophy className="h-5 w-5 text-orange-600" />
              Tournament
            </CardTitle>
            <CardDescription>Manage teams, players, and tournament matches</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex justify-end">
              <Link href="/admin/tournament" className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                <Button variant="outline" size="sm">Manage</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 