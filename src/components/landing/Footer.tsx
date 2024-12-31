import { Link } from "react-router-dom";
import { useState } from "react";
import ContactForm from "./ContactForm";

const Footer = () => {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  return (
    <footer className="bg-background/50 border-t border-border">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8">
          <div>
            <h3 className="text-sm font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setIsContactFormOpen(true)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
          <p>&copy; 2024 StudyNotes. All rights reserved.</p>
        </div>
      </div>
      <ContactForm open={isContactFormOpen} onOpenChange={setIsContactFormOpen} />
    </footer>
  );
};

export default Footer;