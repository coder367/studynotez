import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import StudyRoom from "./pages/StudyRoom";
import StudyRoomView from "./pages/StudyRoomView";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/notes" element={<Notes />} />
            <Route path="/dashboard/chat" element={<Chat />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="/dashboard/profile/:userId" element={<Profile />} />
            <Route path="/dashboard/study-room" element={<StudyRoom />} />
            <Route path="/dashboard/study-room/:id" element={<StudyRoomView />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;