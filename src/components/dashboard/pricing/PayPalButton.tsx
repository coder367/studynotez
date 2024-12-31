import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface PayPalButtonProps {
  amount: string;
  onSuccess: (orderId: string) => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export const PayPalButton = ({ amount, onSuccess }: PayPalButtonProps) => {
  const { toast } = useToast();

  useEffect(() => {
    // Add PayPal Script
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;

    script.onload = () => {
      if (window.paypal) {
        window.paypal.Buttons({
          createOrder: (_data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: amount
                }
              }]
            });
          },
          onApprove: async (data: any, actions: any) => {
            try {
              const order = await actions.order.capture();
              onSuccess(order.id);
              toast({
                title: "Payment Successful",
                description: "Your subscription has been activated!",
              });
            } catch (error) {
              toast({
                title: "Payment Failed",
                description: "There was an error processing your payment.",
                variant: "destructive",
              });
            }
          },
          onError: () => {
            toast({
              title: "Payment Error",
              description: "There was an error processing your payment.",
              variant: "destructive",
            });
          }
        }).render("#paypal-button-container");
      }
    };

    document.body.appendChild(script);

    return () => {
      const paypalScript = document.querySelector(`script[src*="paypal"]`);
      if (paypalScript) {
        document.body.removeChild(paypalScript);
      }
    };
  }, [amount, onSuccess, toast]);

  return <div id="paypal-button-container" className="mt-4 w-full" />;
};