import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary">
              Notez
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
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
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:text-white hover:bg-primary/20 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
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
      )}
    </nav>
  );
};

export default Navbar;