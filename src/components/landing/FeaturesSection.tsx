import { BookOpen, Users, Video, MessageCircle } from "lucide-react";

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

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16 heading-gradient">
          Everything You Need to Excel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card p-6 rounded-xl animate-fade-up hover:scale-105 transition-transform"
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
  );
};

export default FeaturesSection;