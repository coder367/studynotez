import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-background/50 scroll-mt-16">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16 heading-gradient">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-border">
              <AccordionTrigger className="text-left hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;