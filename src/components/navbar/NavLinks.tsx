import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavLinksProps {
  user: any;
  handleLogout: () => void;
  handleNavClick: (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => void;
}

export const NavLinks = ({ user, handleLogout, handleNavClick }: NavLinksProps) => {
  return (
    <div className="ml-10 flex items-center space-x-4">
      <a
        href="#features"
        className="nav-link"
        onClick={(e) => handleNavClick(e, "features")}
      >
        Features
      </a>
      <a
        href="#pricing"
        className="nav-link"
        onClick={(e) => handleNavClick(e, "pricing")}
      >
        Pricing
      </a>
      <a
        href="#faq"
        className="nav-link"
        onClick={(e) => handleNavClick(e, "faq")}
      >
        FAQ
      </a>
      {user ? (
        <>
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          <Button
            variant="ghost"
            className="nav-link"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </>
      ) : (
        <>
          <Link to="/auth" className="nav-link">
            Login
          </Link>
          <Link to="/auth" className="btn-primary">
            Sign Up
          </Link>
        </>
      )}
    </div>
  );
};