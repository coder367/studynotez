import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const AuthHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/")}
        className="mr-4"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div>
        <h2 className="text-3xl font-bold tracking-tight heading-gradient">
          Welcome to StudyNotes
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Join our community of students sharing knowledge
        </p>
      </div>
    </div>
  );
};