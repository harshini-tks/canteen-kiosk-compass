
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Promotion {
  id: string;
  title: string;
  description: string;
  image?: string;
  color: string;
}

const promotions: Promotion[] = [
  {
    id: "1",
    title: "Lunch Combo",
    description: "Get 20% off on all lunch combos today!",
    color: "bg-orange-100 border-orange-300",
  },
  {
    id: "2",
    title: "Happy Hours",
    description: "Buy 1 Get 1 on all beverages between 3-5 PM",
    color: "bg-blue-100 border-blue-300",
  },
  {
    id: "3",
    title: "Weekend Special",
    description: "Free dessert with orders above ₹300 on weekends",
    color: "bg-green-100 border-green-300",
  }
];

export const PromotionalBanners: React.FC = () => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Today's Offers</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {promotions.map((promo) => (
          <Card 
            key={promo.id}
            className={`overflow-hidden border-2 ${promo.color}`}
          >
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{promo.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{promo.description}</p>
              <Button 
                variant="outline" 
                size="sm"
                className="text-canteen-primary border-canteen-primary hover:bg-canteen-primary hover:text-white"
              >
                Redeem Offer
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
