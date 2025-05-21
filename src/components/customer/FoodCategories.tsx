
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuItem } from "@/context/CanteenContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FoodCategoriesProps {
  categories: string[];
  filteredMenu: MenuItem[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  addToCart: (item: MenuItem) => void;
}

export const FoodCategories: React.FC<FoodCategoriesProps> = ({
  categories,
  filteredMenu,
  activeCategory,
  setActiveCategory,
  addToCart,
}) => {
  return (
    <Tabs defaultValue={activeCategory} className="mb-6" onValueChange={setActiveCategory}>
      <TabsList className="w-full justify-start overflow-x-auto">
        {categories.map(category => (
          <TabsTrigger key={category} value={category} className="capitalize">
            {category}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {categories.map(category => (
        <TabsContent key={category} value={category}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMenu
              .filter(item => category === "all" || item.category === category)
              .map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-40 bg-gray-200 flex items-center justify-center">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-gray-500">No image</span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <Badge variant={item.vegetarian ? "outline" : "default"} className={
                        item.vegetarian 
                          ? "border-green-500 text-green-600 bg-green-50" 
                          : "bg-red-500"
                      }>
                        {item.vegetarian ? "Veg" : "Non-Veg"}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">₹{item.price}</p>
                      <Button 
                        className="bg-canteen-primary hover:bg-canteen-secondary"
                        onClick={() => addToCart(item)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
            {filteredMenu.filter(item => category === "all" || item.category === category).length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No items found in this category
              </div>
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
