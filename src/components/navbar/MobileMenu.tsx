import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  user: any;
  handleLogout: () => void;
  handleNavClick: (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const MobileMenu = ({ 
  isOpen, 
  user, 
  handleLogout, 
  handleNavClick,
  setIsOpen 
}: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <a
          href="#features"
          className="block nav-link"
          onClick={(e) => handleNavClick(e, "features")}
        >
          Features
        </a>
        <a
          href="#pricing"
          className="block nav-link"
          onClick={(e) => handleNavClick(e, "pricing")}
        >
          Pricing
        </a>
        <a
          href="#faq"
          className="block nav-link"
          onClick={(e) => handleNavClick(e, "faq")}
        >
          FAQ
        </a>
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="block nav-link"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start nav-link"
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link
              to="/auth"
              className="block nav-link"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/auth"
              className="block btn-primary w-full text-center"
              onClick={() => setIsOpen(false)}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
};