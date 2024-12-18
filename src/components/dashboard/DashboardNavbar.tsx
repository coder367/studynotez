import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";

const DashboardNavbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("notifications")
        .select(`
          *,
          sender:profiles!notifications_user_id_fkey (
            full_name
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      return data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getNotificationText = (notification: any) => {
    switch (notification.type) {
      case 'new_message':
        return `New message from ${notification.sender?.full_name || 'Someone'}`;
      case 'new_follower':
        return `${notification.sender?.full_name || 'Someone'} started following you`;
      case 'new_note':
        return `${notification.sender?.full_name || 'Someone'} uploaded a new note: ${notification.data?.title || ''}`;
      default:
        return 'New notification';
    }
  };

  const handleNotificationClick = (notification: any) => {
    switch (notification.type) {
      case 'new_message':
        navigate(`/dashboard/chat?user=${notification.data?.sender_id}`);
        break;
      case 'new_follower':
        navigate(`/dashboard/profile/${notification.data?.follower_id}`);
        break;
      case 'new_note':
        navigate(`/dashboard/notes`);
        break;
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 md:gap-4">
          <SidebarTrigger />
          <span className="text-lg font-semibold">StudyNotes</span>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <BellRing className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{getNotificationText(notification)}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;