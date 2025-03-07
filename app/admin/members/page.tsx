"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function MembersManagementPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [loadingData, setLoadingData] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [deletingMember, setDeletingMember] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<any | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Add a ref to store the current preview URL
  const editAvatarPreviewUrl = useRef<string | null>(null);

  // Clean up object URLs when component unmounts or when preview changes
  useEffect(() => {
    return () => {
      // Clean up any object URLs when component unmounts
      if (editAvatarPreviewUrl.current) {
        URL.revokeObjectURL(editAvatarPreviewUrl.current);
      }
    };
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (!loading) {
      // Only allow essjaykay755@gmail.com to access the admin panel
      if (!isAdmin || (user?.email !== 'essjaykay755@gmail.com')) {
        router.push('/');
      }
    }
  }, [loading, isAdmin, router, user]);

  // Fetch members
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
  }, [isAdmin, toast]);

  // Member management
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setAvatarFile(files[0]);
    
    // Create a preview of the selected image
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(files[0]);
  };

  const addNewMember = async () => {
    if (!newMemberName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a member name",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    setAddingMember(true);
    
    try {
      let imagePath = null;
      
      // Upload avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('members')
          .upload(filePath, avatarFile);
        
        if (uploadError) throw uploadError;
        
        imagePath = filePath;
      }
      
      // Add member to database
      const { data, error } = await supabase
        .from('members')
        .insert([
          {
            name: newMemberName.trim(),
            image: imagePath,
          }
        ])
        .select();
      
      if (error) throw error;
      
      // Update local state
      setMembers([...members, data[0]]);
      
      // Reset form
      setNewMemberName('');
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Reset the file input
      const fileInput = document.getElementById('new-member-avatar') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      toast({
        title: "Success",
        description: "Member added successfully",
        duration: 5000,
      });
    } catch (error) {
      console.error('Error adding new member:', error);
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setAddingMember(false);
    }
  };

  const startEditMember = (member: any) => {
    setEditingMember(member.id);
    setEditName(member.name);
    setEditAvatarFile(null);
  };

  // Update the edit avatar preview handling
  const handleEditAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Clean up previous preview URL
    if (editAvatarPreviewUrl.current) {
      URL.revokeObjectURL(editAvatarPreviewUrl.current);
    }
    
    setEditAvatarFile(files[0]);
  };

  const updateMember = async (id: string) => {
    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    try {
      let updatedData: { name: string; image?: string } = { name: editName.trim() };
      
      // Handle avatar upload if a new file is selected
      if (editAvatarFile) {
        const fileExt = editAvatarFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('members')
          .upload(filePath, editAvatarFile);
        
        if (uploadError) throw uploadError;
        
        // Add the image path to the update data
        updatedData.image = filePath;
      }
      
      // Update the member record
      const { error } = await supabase
        .from('members')
        .update(updatedData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Get the updated member to ensure we have correct data
      const { data: updatedMember, error: fetchError } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Update local state
      setMembers(members.map(member => 
        member.id === id ? updatedMember : member
      ));
      
      // Reset edit state
      setEditingMember(null);
      setEditName('');
      
      // Clean up image preview
      if (editAvatarFile) {
        if (editAvatarPreviewUrl.current) {
          URL.revokeObjectURL(editAvatarPreviewUrl.current);
          editAvatarPreviewUrl.current = null;
        }
        setEditAvatarFile(null);
      }
      
      // Reset the file input
      const fileInput = document.getElementById('edit-member-avatar') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      toast({
        title: "Success",
        description: "Member updated successfully",
        duration: 5000,
      });
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: "Error",
        description: "Failed to update member. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Start the delete process by opening the confirmation dialog
  const confirmDeleteMember = (member: any) => {
    setMemberToDelete(member);
    setDeleteConfirmName('');
    setDeleteDialogOpen(true);
  };

  // Delete the member if confirmation is successful
  const deleteMember = async () => {
    if (!memberToDelete) return;
    
    // Get admin email from user state instead of name
    const adminEmail = user?.email || '';
    
    // Check if the entered name matches the admin's email (or part of it)
    // This is a simple alternative since we don't have access to user.name
    if (!deleteConfirmName.trim() || !adminEmail.includes(deleteConfirmName.trim().toLowerCase())) {
      toast({
        title: "Verification Failed",
        description: "The verification text you entered is incorrect. Deletion cancelled.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    // If verification passed, proceed with deletion
    setDeletingMember(memberToDelete.id);
    setDeleteDialogOpen(false);
    
    try {
      // Delete member
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberToDelete.id);
      
      if (error) throw error;
      
      // Update local state
      setMembers(members.filter(member => member.id !== memberToDelete.id));
      
      toast({
        title: "Success",
        description: "Member deleted successfully",
        duration: 5000,
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: "Error",
        description: "Failed to delete member. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setDeletingMember(null);
      setMemberToDelete(null);
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
      <div className="flex items-center justify-between">
        <Link href="/admin" className="flex items-center text-orange-600 hover:text-orange-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Link>
      </div>
      
      <div className="flex flex-col items-center text-center space-y-4">
        <h1 className="text-3xl font-bold text-orange-800 font-heading">Member Management</h1>
      </div>

      {loadingData ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      ) : (
        <>
          {/* Add New Member */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Member</CardTitle>
              <CardDescription>Add a new member with name and avatar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="new-member-name" className="text-sm font-medium">
                      Name
                    </label>
                    <input
                      id="new-member-name"
                      type="text"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Enter member name"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="new-member-avatar" className="text-sm font-medium">
                      Avatar
                    </label>
                    <input
                      id="new-member-avatar"
                      type="file"
                      accept="image/*"
                      className="rounded-md border border-input p-2"
                      onChange={handleAvatarSelect}
                    />
                    {avatarPreview && (
                      <div className="mt-2 flex items-center">
                        <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-orange-200">
                          <img 
                            src={avatarPreview} 
                            alt="Avatar preview" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="ml-2 text-xs text-muted-foreground">Preview</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  onClick={addNewMember}
                  disabled={!newMemberName || addingMember}
                  className="w-full md:w-auto"
                >
                  {addingMember ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Member"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Member List */}
          <Card>
            <CardHeader>
              <CardTitle>Member List</CardTitle>
              <CardDescription>Manage existing members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {members.length === 0 ? (
                  <p className="text-muted-foreground col-span-full text-center py-8">No members found. Add your first member above.</p>
                ) : (
                  members.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex flex-col p-4 rounded-lg border"
                    >
                      {editingMember === member.id ? (
                        <>
                          <div className="flex flex-col space-y-4 w-full">
                            <div>
                              <label htmlFor="edit-member-name" className="text-sm font-medium block mb-1">
                                Name
                              </label>
                              <input
                                id="edit-member-name"
                                type="text"
                                className="rounded-md border border-input px-3 py-2 text-sm w-full"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="edit-member-avatar" className="text-sm font-medium block mb-1">
                                Change Avatar
                              </label>
                              <input
                                id="edit-member-avatar"
                                type="file"
                                accept="image/*"
                                className="rounded-md border border-input p-2 w-full text-sm"
                                onChange={handleEditAvatarSelect}
                              />
                              {editAvatarFile && (
                                <div>
                                  <p className="text-xs text-orange-600 mt-1">
                                    New avatar selected: {editAvatarFile.name}
                                  </p>
                                  <div className="mt-2 flex items-center">
                                    <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-orange-200">
                                      {(() => {
                                        // Create and store the object URL
                                        const url = URL.createObjectURL(editAvatarFile);
                                        editAvatarPreviewUrl.current = url;
                                        return (
                                          <img 
                                            src={url} 
                                            alt="Avatar preview" 
                                            className="h-full w-full object-cover"
                                          />
                                        );
                                      })()}
                                    </div>
                                    <span className="ml-2 text-xs text-muted-foreground">Preview</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex space-x-2 pt-2">
                              <Button 
                                size="sm" 
                                onClick={() => updateMember(member.id)}
                                className="flex-1"
                              >
                                Save Changes
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  // Clean up image preview
                                  if (editAvatarFile) {
                                    if (editAvatarPreviewUrl.current) {
                                      URL.revokeObjectURL(editAvatarPreviewUrl.current);
                                      editAvatarPreviewUrl.current = null;
                                    }
                                    setEditAvatarFile(null);
                                  }
                                  
                                  setEditingMember(null);
                                  setEditName('');
                                }}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center mb-3">
                            <Avatar className="h-12 w-12 mr-3">
                              <AvatarImage src={getAvatarUrl(member.image)} alt={member.name} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{member.name}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between mt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-blue-500"
                              onClick={() => startEditMember(member)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => confirmDeleteMember(member)}
                              disabled={deletingMember === member.id}
                            >
                              {deletingMember === member.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Delete"
                              )}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the member{' '}
              <span className="font-semibold">{memberToDelete?.name}</span> and remove all of their data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-2 text-sm text-gray-700">
              To verify, please enter your email address (or part of it):
            </p>
            <Input
              value={deleteConfirmName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeleteConfirmName(e.target.value)}
              placeholder="Enter verification text"
              className="w-full"
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="mt-2 sm:mt-0"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteMember}
              disabled={!deleteConfirmName.trim()}
              className="mt-2 sm:mt-0"
            >
              Yes, Delete Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 