
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image?: string;
  available: boolean;
  vegetarian: boolean;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  customizations?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  status: "pending" | "preparing" | "ready" | "completed";
  total: number;
  timestamp: Date;
  customerName?: string;
  orderType: "dine-in" | "takeaway" | "scheduled";
  paymentStatus: "pending" | "completed";
  paymentMethod?: "cash" | "card" | "upi";
}

interface SalesData {
  today: number;
  transactions: number;
  popularItems: { name: string; count: number }[];
}

interface CanteenContextType {
  menu: MenuItem[];
  orders: Order[];
  salesData: SalesData;
  addMenuItem: (item: Omit<MenuItem, "id">) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  placeOrder: (order: Omit<Order, "id" | "timestamp">) => Promise<void>;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  updatePaymentStatus: (id: string, status: Order["paymentStatus"], method?: Order["paymentMethod"]) => void;
  loading: boolean;
  fetchUserOrders: () => Promise<void>;
}

// Mock sales data for Dashboard
const MOCK_SALES_DATA: SalesData = {
  today: 0,
  transactions: 0,
  popularItems: []
};

const CanteenContext = createContext<CanteenContextType | undefined>(undefined);

export const CanteenProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { user } = useAuth();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [salesData, setSalesData] = useState<SalesData>(MOCK_SALES_DATA);
  const [loading, setLoading] = useState(true);

  // Fetch menu items from Supabase
  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setMenu(data.map(item => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          category: item.category,
          description: item.description,
          image: item.image || undefined,
          available: item.available || true,
          vegetarian: item.vegetarian || false
        })));
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    }
  };

  // Fetch user's orders
  const fetchUserOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      if (!ordersData) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // For each order, fetch its items
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const { data: orderItemsData, error: orderItemsError } = await supabase
            .from('order_items')
            .select('*, menu_item_id(*)')
            .eq('order_id', order.id);
          
          if (orderItemsError) throw orderItemsError;
          
          const items = orderItemsData?.map(item => ({
            menuItem: {
              id: item.menu_item_id.id,
              name: item.menu_item_id.name,
              price: Number(item.menu_item_id.price),
              category: item.menu_item_id.category,
              description: item.menu_item_id.description,
              image: item.menu_item_id.image || undefined,
              available: item.menu_item_id.available,
              vegetarian: item.menu_item_id.vegetarian
            },
            quantity: item.quantity,
            customizations: item.customizations
          })) || [];
          
          return {
            id: order.id,
            items,
            status: order.status,
            total: Number(order.total),
            timestamp: new Date(order.created_at),
            customerName: order.customer_name,
            orderType: order.order_type,
            paymentStatus: order.payment_status,
            paymentMethod: order.payment_method
          };
        })
      );
      
      setOrders(ordersWithItems);
      
      // Update sales data
      if (ordersWithItems.length > 0) {
        const today = new Date();
        const todayOrders = ordersWithItems.filter(
          order => order.timestamp.toDateString() === today.toDateString()
        );
        
        const todayTotal = todayOrders.reduce((sum, order) => sum + order.total, 0);
        const allItems = ordersWithItems.flatMap(order => 
          order.items.map(item => ({ name: item.menuItem.name, count: item.quantity }))
        );
        
        // Group by item name and sum counts
        const itemCounts = allItems.reduce((acc, { name, count }) => {
          acc[name] = (acc[name] || 0) + count;
          return acc;
        }, {} as Record<string, number>);
        
        // Convert to array and sort by count
        const popularItems = Object.entries(itemCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        
        setSalesData({
          today: todayTotal,
          transactions: todayOrders.length,
          popularItems
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const addMenuItem = async (item: Omit<MenuItem, "id">) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([{
          name: item.name,
          price: item.price,
          category: item.category,
          description: item.description,
          image: item.image,
          available: item.available,
          vegetarian: item.vegetarian
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        const newItem = {
          ...item,
          id: data[0].id,
        };
        setMenu([...menu, newItem]);
        toast.success(`${item.name} added to menu`);
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error('Failed to add menu item');
    }
  };

  const updateMenuItem = async (id: string, item: Partial<MenuItem>) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update(item)
        .eq('id', id);
      
      if (error) throw error;
      
      setMenu(menu.map(menuItem => 
        menuItem.id === id ? { ...menuItem, ...item } : menuItem
      ));
      toast.success("Menu item updated");
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setMenu(menu.filter(item => item.id !== id));
      toast.success("Menu item deleted");
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const placeOrder = async (order: Omit<Order, "id" | "timestamp">) => {
    if (!user) {
      toast.error("You must be logged in to place an order");
      return;
    }
    
    try {
      // Insert order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: user.name,
          user_id: user.id,
          status: order.status,
          total: order.total,
          order_type: order.orderType,
          payment_status: order.paymentStatus,
          payment_method: order.paymentMethod
        }])
        .select();
      
      if (orderError) throw orderError;
      
      if (!orderData || !orderData[0]) {
        throw new Error("Failed to create order");
      }
      
      const orderId = orderData[0].id;
      
      // Insert order items
      const orderItems = order.items.map(item => ({
        order_id: orderId,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        customizations: item.customizations,
        price_at_time: item.menuItem.price
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Refresh orders list
      await fetchUserOrders();
      
      toast.success("Order placed successfully");
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    }
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      setOrders(orders.map(order => 
        order.id === id ? { ...order, status } : order
      ));
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const updatePaymentStatus = async (id: string, paymentStatus: Order["paymentStatus"], paymentMethod?: Order["paymentMethod"]) => {
    try {
      const updateData: any = { payment_status: paymentStatus };
      if (paymentMethod) {
        updateData.payment_method = paymentMethod;
      }
      
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      setOrders(orders.map(order => 
        order.id === id ? { 
          ...order, 
          paymentStatus,
          ...(paymentMethod ? { paymentMethod } : {})
        } : order
      ));
      toast.success(`Payment status updated to ${paymentStatus}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  return (
    <CanteenContext.Provider
      value={{
        menu,
        orders,
        salesData,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        placeOrder,
        updateOrderStatus,
        updatePaymentStatus,
        loading,
        fetchUserOrders
      }}
    >
      {children}
    </CanteenContext.Provider>
  );
};

export const useCanteen = () => {
  const context = useContext(CanteenContext);
  if (context === undefined) {
    throw new Error("useCanteen must be used within a CanteenProvider");
  }
  return context;
};
