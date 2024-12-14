import { Link } from "react-router-dom";
import { BookOpen, MessageSquare, Users, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const DashboardSidebar = () => {
  return (
    <Sidebar className="border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium">
                <Link to="/dashboard/notes">
                  <BookOpen className="h-5 w-5" />
                  <span>Notes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium">
                <Link to="/dashboard/chat">
                  <MessageSquare className="h-5 w-5" />
                  <span>Chat</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium">
                <Link to="/dashboard/study-room">
                  <Users className="h-5 w-5" />
                  <span>Study Room</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium">
                <Link to="/dashboard/profile">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;