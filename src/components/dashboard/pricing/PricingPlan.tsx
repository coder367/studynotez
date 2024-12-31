import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PricingPlanProps {
  name: string;
  description: string;
  price: string;
  features: string[];
  featured?: boolean;
  onSubscribe: () => void;
  disabled?: boolean;
  buttonText?: string;
}

export const PricingPlan = ({
  name,
  description,
  price,
  features,
  featured = false,
  onSubscribe,
  disabled = false,
  buttonText = "Get Started"
}: PricingPlanProps) => {
  return (
    <Card
      className={`p-8 rounded-xl transition-all duration-300 hover:scale-105 ${
        featured ? "border-2 border-primary ring-2 ring-primary/20" : ""
      }`}
    >
      {featured && (
        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
          Most Popular
        </span>
      )}
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <div className="mb-6">
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-muted-foreground">/month</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-muted-foreground">
            <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        className="w-full"
        variant={featured ? "default" : "outline"}
        onClick={onSubscribe}
        disabled={disabled}
      >
        {buttonText}
      </Button>
    </Card>
  );
};