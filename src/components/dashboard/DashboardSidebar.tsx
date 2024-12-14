import { Link } from "react-router-dom";
import { BookOpen, MessageSquare, Users, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";

const DashboardSidebar = () => {
  return (
    <Sidebar className="border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="space-y-1">
              <SidebarMenuItem className="list-none">
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/notes" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50">
                    <BookOpen className="h-5 w-5" />
                    <span>Notes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="list-none">
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/chat" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50">
                    <MessageSquare className="h-5 w-5" />
                    <span>Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="list-none">
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/study-room" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50">
                    <Users className="h-5 w-5" />
                    <span>Study Room</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t border-border p-2">
        <SidebarMenuItem className="list-none">
          <SidebarMenuButton asChild>
            <Link to="/dashboard/profile" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted/50">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;