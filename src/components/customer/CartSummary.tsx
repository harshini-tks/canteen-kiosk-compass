
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { MenuItem } from "@/context/CanteenContext";
import { Skeleton } from "@/components/ui/skeleton";

interface CartSummaryProps {
  cartItems: { item: MenuItem; quantity: number }[];
  cartTotal: number;
  updateQuantity?: (itemId: string, quantity: number) => void;
  onCheckout: () => void;
  loading?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  cartItems,
  cartTotal,
  updateQuantity,
  onCheckout,
  loading = false
}) => {
  if (loading) {
    return (
      <Card className="sticky top-6">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>

        <div className="p-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="mb-4">
              <Skeleton className="h-4 w-full mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <div className="flex justify-between mb-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="sticky top-6">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg">Your Cart</h2>
          <ShoppingCart size={18} />
        </div>
      </div>

      <div className="p-4 max-h-[50vh] overflow-y-auto">
        {cartItems.length === 0 ? (
          <p className="text-center py-4 text-gray-500">Your cart is empty</p>
        ) : (
          <ul className="space-y-4">
            {cartItems.map(({ item, quantity }) => (
              <li key={item.id} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span>₹{item.price} × </span>
                    {updateQuantity ? (
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => updateQuantity(item.id, quantity - 1)}
                          className="text-gray-500 hover:text-gray-700 px-1"
                        >
                          -
                        </button>
                        <span>{quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, quantity + 1)}
                          className="text-gray-500 hover:text-gray-700 px-1"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <span>{quantity}</span>
                    )}
                  </div>
                </div>
                <p className="font-medium">₹{item.price * quantity}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="p-4 border-t">
          <div className="flex justify-between mb-4">
            <span>Total</span>
            <span className="font-bold">₹{cartTotal}</span>
          </div>
          <Button 
            onClick={onCheckout}
            className="w-full bg-canteen-primary hover:bg-canteen-secondary"
          >
            Proceed to Checkout
          </Button>
        </div>
      )}
    </Card>
  );
};
