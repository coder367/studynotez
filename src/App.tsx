import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import StudyRoom from "./pages/StudyRoom";
import StudyRoomView from "./pages/StudyRoomView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      networkMode: 'always'
    },
  },
});

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return null; // Or a loading spinner
  }

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
            <Route
              path="/dashboard"
              element={session ? <Dashboard /> : <Navigate to="/auth" />}
            />
            <Route
              path="/dashboard/notes"
              element={session ? <Notes /> : <Navigate to="/auth" />}
            />
            <Route
              path="/dashboard/chat"
              element={session ? <Chat /> : <Navigate to="/auth" />}
            />
            <Route
              path="/dashboard/profile"
              element={session ? <Profile /> : <Navigate to="/auth" />}
            />
            <Route
              path="/dashboard/profile/:userId"
              element={session ? <Profile /> : <Navigate to="/auth" />}
            />
            <Route
              path="/dashboard/study-room"
              element={session ? <StudyRoom /> : <Navigate to="/auth" />}
            />
            <Route
              path="/dashboard/study-room/:id"
              element={session ? <StudyRoomView /> : <Navigate to="/auth" />}
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;