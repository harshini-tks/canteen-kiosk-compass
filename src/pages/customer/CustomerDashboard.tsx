
import React, { useState, useEffect } from "react";
import { Sidebar, customerSidebarLinks } from "@/components/shared/Sidebar";
import { useCanteen, MenuItem, Order, OrderItem } from "@/context/CanteenContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Search, ShoppingCart, History, ArrowLeft, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CartSummary } from "@/components/customer/CartSummary";
import { OrderHistory } from "@/components/customer/OrderHistory";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { menu, orders, placeOrder, loading, fetchUserOrders } = useCanteen();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<{item: MenuItem, quantity: number}[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [view, setView] = useState<"menu" | "cart" | "history">("menu");
  const navigate = useNavigate();
  
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

  // Update item quantity in cart
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(prev => prev.filter(cartItem => cartItem.item.id !== itemId));
    } else {
      setCartItems(prev => 
        prev.map(cartItem => 
          cartItem.item.id === itemId 
            ? { ...cartItem, quantity: newQuantity } 
            : cartItem
        )
      );
    }
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!user) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }

    const orderItems: OrderItem[] = cartItems.map(({ item, quantity }) => ({
      menuItem: item,
      quantity,
    }));

    const newOrder: Omit<Order, "id" | "timestamp"> = {
      items: orderItems,
      status: "pending",
      total: cartTotal,
      customerName: user?.name,
      orderType: "takeaway", // Default to takeaway
      paymentStatus: "pending",
    };

    await placeOrder(newOrder);
    setCartItems([]);
    setView("history");
  };

  // Refresh orders
  const handleRefreshOrders = () => {
    fetchUserOrders();
  };

  // If not logged in and trying to view history, redirect to menu
  useEffect(() => {
    if (!user && view === "history") {
      setView("menu");
    }
  }, [user, view]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar links={customerSidebarLinks} title="Canteen Menu" />
      
      <div className="flex-1 overflow-y-auto p-6">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name || "Guest"}</h1>
            <p className="text-gray-600">Browse our menu and place your order</p>
          </div>
          <div className="flex space-x-3">
            {view !== "menu" && (
              <Button 
                variant="outline" 
                onClick={() => setView("menu")}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Menu
              </Button>
            )}
            {view !== "cart" && cartItems.length > 0 && (
              <Button 
                onClick={() => setView("cart")} 
                className="flex items-center gap-2 bg-canteen-primary hover:bg-canteen-secondary"
              >
                <ShoppingCart size={16} />
                Cart {cartItems.length > 0 && `(${cartItems.length})`}
              </Button>
            )}
            {view !== "history" && user && (
              <Button 
                variant="outline" 
                onClick={() => setView("history")}
                className="flex items-center gap-2"
              >
                <History size={16} />
                Order History
              </Button>
            )}
            {view === "history" && (
              <Button
                variant="outline"
                onClick={handleRefreshOrders}
                className="flex items-center gap-2"
              >
                <RefreshCcw size={16} />
                Refresh
              </Button>
            )}
          </div>
        </header>
        
        {view === "menu" && (
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
              <CartSummary 
                cartItems={cartItems} 
                cartTotal={cartTotal} 
                updateQuantity={updateQuantity}
                onCheckout={() => setView("cart")}
              />
            </div>
          </div>
        )}
        
        {view === "cart" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
            {cartItems.length > 0 ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  {cartItems.map(({ item, quantity }) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-gray-600">₹{item.price} per item</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                          <span className="font-medium">₹{item.price * quantity}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <Card className="p-6">
                  <div className="flex justify-between mb-4">
                    <span className="text-lg">Total</span>
                    <span className="text-lg font-bold">₹{cartTotal}</span>
                  </div>
                  <Button 
                    className="w-full bg-canteen-primary hover:bg-canteen-secondary"
                    onClick={handleCheckout}
                  >
                    Place Order
                  </Button>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <Button onClick={() => setView("menu")}>Browse Menu</Button>
              </div>
            )}
          </div>
        )}
        
        {view === "history" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Your Order History</h2>
            {!user ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Please login to view your order history</p>
                <Button onClick={() => navigate("/login")}>Login</Button>
              </div>
            ) : (
              <OrderHistory orders={orders} loading={loading} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
