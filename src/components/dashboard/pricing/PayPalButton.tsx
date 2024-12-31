import { useEffect } from "react";

interface PayPalButtonProps {
  onSuccess: (orderId: string) => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export const PayPalButton = ({ onSuccess }: PayPalButtonProps) => {
  useEffect(() => {
    if (window.paypal) {
      const paypalButtonContainer = document.getElementById('paypal-button-container');
      if (paypalButtonContainer) {
        window.paypal.Buttons({
          createOrder: (_data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: '20.00'
                }
              }]
            });
          },
          onApprove: async (data: any, actions: any) => {
            const order = await actions.order.capture();
            onSuccess(order.id);
          }
        }).render(paypalButtonContainer);
      }
    }
  }, [onSuccess]);

  return <div id="paypal-button-container" className="mt-4" />;
};