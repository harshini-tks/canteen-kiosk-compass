
import React from "react";
import { MenuItem } from "@/context/CanteenContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface PopularItemsProps {
  menu: MenuItem[];
  addToCart: (item: MenuItem) => void;
}

export const PopularItems: React.FC<PopularItemsProps> = ({ menu, addToCart }) => {
  // In a real app, this would be based on order analytics
  // For now, just take the first 4 items
  const popularItems = menu.slice(0, 4);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Popular Items</h2>
        <Button variant="link" className="text-canteen-primary p-0">View All</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        {popularItems.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-32 bg-gray-200">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-500">No image</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium">{item.name}</h3>
                <div className="flex items-center text-yellow-500 text-xs">
                  <Star className="h-3 w-3 fill-yellow-500" />
                  <span className="ml-1">4.5</span>
                </div>
              </div>
              <p className="text-gray-600 text-xs line-clamp-1 mb-2">{item.description}</p>
              <div className="flex justify-between items-center">
                <p className="font-semibold">₹{item.price}</p>
                <Button 
                  variant="outline"
                  size="sm" 
                  className="text-xs h-8"
                  onClick={() => addToCart(item)}
                >
                  Add
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
