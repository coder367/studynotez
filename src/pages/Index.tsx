import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Video, MessageCircle } from "lucide-react";
import Navbar from "../components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 animate-fade-up heading-gradient">
            Share Notes. Connect. Excel Together.
          </h1>
          <p className="text-xl text-muted-foreground mb-12 animate-fade-up delay-100">
            The ultimate platform for students to share notes, join study groups,
            and collaborate in real-time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-up delay-200">
            <Link to="/signup" className="btn-primary">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 inline" />
            </Link>
            <Link to="/features" className="btn-secondary">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 heading-gradient">
            Everything You Need to Excel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-6 rounded-xl animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 heading-gradient">
            Ready to Transform Your Study Experience?
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Join thousands of students who are already sharing knowledge and
            succeeding together.
          </p>
          <Link to="/signup" className="btn-primary">
            Join Now
            <ArrowRight className="ml-2 h-5 w-5 inline" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/50 border-t border-border">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/features" className="text-muted-foreground hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-muted-foreground hover:text-primary">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-primary">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-primary">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-primary">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-primary">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://twitter.com"
                    className="text-muted-foreground hover:text-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.com"
                    className="text-muted-foreground hover:text-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; 2024 StudyNotes. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    title: "Share Notes",
    description: "Upload and share your study notes with fellow students.",
    icon: BookOpen,
  },
  {
    title: "Study Groups",
    description: "Create or join study groups for collaborative learning.",
    icon: Users,
  },
  {
    title: "Live Sessions",
    description: "Participate in live study sessions with your peers.",
    icon: Video,
  },
  {
    title: "Chat & Connect",
    description: "Communicate with other students in real-time.",
    icon: MessageCircle,
  },
];

export default Index;