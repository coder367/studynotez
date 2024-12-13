import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Video, MessageCircle, Check } from "lucide-react";
import Navbar from "../components/Navbar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
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

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 heading-gradient">
            Simple, Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`glass-card p-8 rounded-xl ${
                  plan.featured ? "border-2 border-primary" : ""
                }`}
              >
                {plan.featured && (
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.featured ? "/auth" : "/contact"}
                  className={`w-full text-center block py-3 px-6 rounded-lg ${
                    plan.featured
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "border border-primary text-primary hover:bg-primary/10"
                  } transition-colors`}
                >
                  {plan.featured ? "Get Started" : "Contact Sales"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 heading-gradient">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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

const pricingPlans = [
  {
    name: "Basic",
    description: "Perfect for getting started",
    price: "0",
    featured: false,
    features: [
      "Up to 5 study groups",
      "Basic note sharing",
      "Community support",
      "Email support",
    ],
  },
  {
    name: "Pro",
    description: "Best for active students",
    price: "19",
    featured: true,
    features: [
      "Unlimited study groups",
      "Advanced note organization",
      "Priority support",
      "Live study sessions",
      "AI study assistance",
    ],
  },
  {
    name: "Enterprise",
    description: "For educational institutions",
    price: "99",
    featured: false,
    features: [
      "Custom user limits",
      "Advanced analytics",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
  },
];

const faqs = [
  {
    question: "How does the note-sharing feature work?",
    answer: "Our note-sharing feature allows you to upload and share your study notes with fellow students. You can organize notes by subject, add tags, and collaborate with others in real-time.",
  },
  {
    question: "Can I try StudyNotes before subscribing?",
    answer: "Yes! Our Basic plan is free and includes essential features to help you get started. You can upgrade to Pro anytime to access advanced features.",
  },
  {
    question: "How do study groups work?",
    answer: "Study groups are virtual spaces where you can collaborate with peers. You can create or join groups, share resources, and participate in discussions.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take security seriously. All data is encrypted, and we follow industry best practices to protect your information.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.",
  },
  {
    question: "Do you offer student discounts?",
    answer: "Yes! Students with a valid .edu email address can get 20% off the Pro plan. Contact our support team to learn more.",
  },
];

export default Index;
