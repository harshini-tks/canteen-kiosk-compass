
import React, { useState } from "react";
import { Sidebar, customerSidebarLinks } from "@/components/shared/Sidebar";
import { useCanteen, MenuItem } from "@/context/CanteenContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Search, ShoppingCart } from "lucide-react";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { menu } = useCanteen();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<{item: MenuItem, quantity: number}[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  // Get unique categories
  const categories = ["all", ...Array.from(new Set(menu.map(item => item.category)))];
  
  // Filter menu items based on search query and category
  const filteredMenu = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory && item.available;
  });
  
  // Handle adding item to cart
  const addToCart = (item: MenuItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.item.id === item.id);
      if (existingItem) {
        return prev.map(cartItem => 
          cartItem.item.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      } else {
        return [...prev, { item, quantity: 1 }];
      }
    });
    toast.success(`Added ${item.name} to cart`);
  };
  
  // Calculate cart total
  const cartTotal = cartItems.reduce(
    (total, { item, quantity }) => total + (item.price * quantity), 
    0
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar links={customerSidebarLinks} title="Canteen Menu" />
      
      <div className="flex-1 overflow-y-auto p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-gray-600">Browse our menu and place your order</p>
        </header>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-3/4">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveCategory}>
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
                        <Card key={item.id} className="overflow-hidden">
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
                                  ? "border-green-500 text-green-600" 
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
          </div>
          
          <div className="md:w-1/4">
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
                          <p className="text-sm text-gray-600">₹{item.price} × {quantity}</p>
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
                  <Button className="w-full bg-canteen-primary hover:bg-canteen-secondary">
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
