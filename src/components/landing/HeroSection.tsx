import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 animate-fade-up leading-tight">
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
            Share Notes &
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Excel Together
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-12 animate-fade-up delay-100 max-w-2xl mx-auto">
          The ultimate platform for students to share notes, join study groups,
          and collaborate in real-time.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-up delay-200">
          <Link 
            to="/auth" 
            className="btn-primary flex items-center justify-center gap-2 hover:scale-105 transition-transform"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link 
            to="#features" 
            className="btn-secondary hover:scale-105 transition-transform"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;