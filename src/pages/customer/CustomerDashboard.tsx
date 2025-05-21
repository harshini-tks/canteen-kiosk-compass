
import React, { useState, useEffect } from "react";
import { Sidebar, customerSidebarLinks } from "@/components/shared/Sidebar";
import { useCanteen, MenuItem, Order, OrderItem } from "@/context/CanteenContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, ShoppingCart, History, ArrowLeft, RefreshCcw, Home, CreditCard, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CartSummary } from "@/components/customer/CartSummary";
import { OrderHistory } from "@/components/customer/OrderHistory";
import { FoodCategories } from "@/components/customer/FoodCategories";
import { PromotionalBanners } from "@/components/customer/PromotionalBanners";
import { PopularItems } from "@/components/customer/PopularItems";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { menu, orders, placeOrder, loading, fetchUserOrders } = useCanteen();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<{item: MenuItem, quantity: number}[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [view, setView] = useState<"menu" | "cart" | "history" | "payment" | "tracking">("menu");
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

    // Navigate to payment view if cart is not empty
    setView("payment");
  };

  // Handle payment
  const handlePayment = async (paymentMethod: "cash" | "card" | "upi") => {
    if (!user && paymentMethod !== "cash") {
      toast.error("Please login to use online payment methods");
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
      customerName: user?.name || "Guest",
      orderType: "takeaway", // Default to takeaway
      paymentStatus: "pending",
      paymentMethod: paymentMethod
    };

    await placeOrder(newOrder);
    setCartItems([]);
    setView("tracking");
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
      <Sidebar links={customerSidebarLinks} title="Canteen Connect" />
      
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
                className="flex items-center gap-2 bg-canteen-primary hover:bg-canteen-secondary relative"
              >
                <ShoppingCart size={16} />
                <span>Cart</span>
                {cartItems.length > 0 && 
                  <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                }
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
                    placeholder="Search for food, drinks, or categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <PromotionalBanners />
              
              <PopularItems menu={menu} addToCart={addToCart} />
              
              <FoodCategories
                categories={categories}
                filteredMenu={filteredMenu}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                addToCart={addToCart}
              />
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
                    <div key={item.id} className="flex items-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-16 h-16 overflow-hidden rounded-md mr-4">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500">No image</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="font-semibold">₹{item.price * quantity}</p>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-1">{item.description}</p>
                      </div>
                      
                      <div className="flex items-center ml-4 gap-2">
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
                    </div>
                  ))}
                </div>
                
                <div className="p-6 border rounded-lg bg-white shadow-sm">
                  <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">GST (5%)</span>
                      <span>₹{(cartTotal * 0.05).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Packing Charges</span>
                      <span>₹10.00</span>
                    </div>
                    
                    <div className="pt-2 border-t mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₹{(cartTotal + cartTotal * 0.05 + 10).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Input placeholder="Apply coupon code" className="flex-1" />
                    <Button variant="outline">Apply</Button>
                  </div>
                  
                  <Button 
                    className="w-full bg-canteen-primary hover:bg-canteen-secondary"
                    onClick={handleCheckout}
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <Button onClick={() => setView("menu")}>Browse Menu</Button>
              </div>
            )}
          </div>
        )}
        
        {view === "payment" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Payment</h2>
            <div className="space-y-6">
              <div className="p-6 border rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Payment Methods</h3>
                
                <div className="space-y-4">
                  <div 
                    className="p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors flex items-center"
                    onClick={() => handlePayment("upi")}
                  >
                    <div className="bg-purple-100 p-3 rounded-full mr-4">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">UPI Payment</h4>
                      <p className="text-sm text-gray-500">Google Pay, PhonePe, Paytm etc.</p>
                    </div>
                    <Button variant="outline" onClick={(e) => {e.stopPropagation(); handlePayment("upi")}}>Pay Now</Button>
                  </div>
                  
                  <div 
                    className="p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors flex items-center"
                    onClick={() => handlePayment("card")}
                  >
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Card Payment</h4>
                      <p className="text-sm text-gray-500">Debit/Credit Card</p>
                    </div>
                    <Button variant="outline" onClick={(e) => {e.stopPropagation(); handlePayment("card")}}>Pay Now</Button>
                  </div>
                  
                  <div 
                    className="p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors flex items-center"
                    onClick={() => handlePayment("cash")}
                  >
                    <div className="bg-green-100 p-3 rounded-full mr-4">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Cash Payment</h4>
                      <p className="text-sm text-gray-500">Pay at counter</p>
                    </div>
                    <Button variant="outline" onClick={(e) => {e.stopPropagation(); handlePayment("cash")}}>Select</Button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items</span>
                    <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 font-semibold">
                    <span>Total (incl. taxes)</span>
                    <span>₹{(cartTotal + cartTotal * 0.05 + 10).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {view === "tracking" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Order Tracking</h2>
            <div className="p-6 border rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-500">Order ID</p>
                  <p className="font-medium">#ORD12345</p>
                </div>
                <div className="bg-amber-100 py-2 px-4 rounded-full text-amber-800 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Being Prepared</span>
                </div>
              </div>
              
              <div className="relative">
                <div className="flex items-center mb-8">
                  <div className="w-8 h-8 bg-canteen-primary text-white rounded-full flex items-center justify-center z-10">1</div>
                  <div className="flex-1 ml-4">
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-gray-500">10:30 AM</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-8">
                  <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center z-10">2</div>
                  <div className="flex-1 ml-4">
                    <p className="font-medium">Being Prepared</p>
                    <p className="text-sm text-gray-500">Estimated: 15-20 mins</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-8">
                  <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center z-10">3</div>
                  <div className="flex-1 ml-4">
                    <p className="font-medium text-gray-500">Ready for Pickup</p>
                    <p className="text-sm text-gray-500">-</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center z-10">4</div>
                  <div className="flex-1 ml-4">
                    <p className="font-medium text-gray-500">Completed</p>
                    <p className="text-sm text-gray-500">-</p>
                  </div>
                </div>
                
                <div className="absolute left-4 top-8 h-[calc(100%-32px)] w-0.5 bg-gray-200 z-0"></div>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-md text-blue-700 text-sm">
                <p>Your order will be ready in approximately 15-20 minutes. We'll notify you when it's ready for pickup.</p>
              </div>
              
              <Button 
                className="w-full mt-6 bg-canteen-primary hover:bg-canteen-secondary"
                onClick={() => setView("menu")}
              >
                Continue Browsing
              </Button>
            </div>
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
