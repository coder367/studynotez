import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const navigate = useNavigate();
  
  const { data: userNotes = [], isLoading } = useQuery({
    queryKey: ["userNotes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      return data || [];
    },
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">JD</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">John Doe</h2>
              <p className="text-sm text-muted-foreground">University of Example</p>
            </div>
          </div>
          <div className="space-y-2">
            <Button className="w-full" variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Follow
            </Button>
            <Button className="w-full" onClick={() => navigate("/dashboard/chat")}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </div>
        </Card>

        {/* User's Notes */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Uploaded Notes</h3>
          {isLoading ? (
            <p>Loading...</p>
          ) : userNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userNotes.map((note: any) => (
                <Card key={note.id} className="p-4">
                  <h4 className="font-medium">{note.title}</h4>
                  <p className="text-sm text-muted-foreground">{note.subject}</p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No notes uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;