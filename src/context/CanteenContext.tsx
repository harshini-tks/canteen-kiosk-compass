
import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";

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
  placeOrder: (order: Omit<Order, "id" | "timestamp">) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  updatePaymentStatus: (id: string, status: Order["paymentStatus"], method?: Order["paymentMethod"]) => void;
}

// Mock menu data
const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "Vegetable Sandwich",
    price: 60,
    category: "Sandwiches",
    description: "Fresh vegetables with cheese in toasted bread",
    available: true,
    vegetarian: true,
  },
  {
    id: "2",
    name: "Chicken Burger",
    price: 120,
    category: "Burgers",
    description: "Grilled chicken patty with lettuce and mayo",
    available: true,
    vegetarian: false,
  },
  {
    id: "3",
    name: "Cold Coffee",
    price: 80,
    category: "Beverages",
    description: "Chilled coffee with ice cream",
    available: true,
    vegetarian: true,
  },
  {
    id: "4",
    name: "Masala Dosa",
    price: 90,
    category: "South Indian",
    description: "Crispy dosa with potato filling",
    available: true,
    vegetarian: true,
  },
  {
    id: "5",
    name: "Chicken Biryani",
    price: 150,
    category: "Main Course",
    description: "Fragrant rice cooked with chicken and spices",
    available: true,
    vegetarian: false,
  }
];

// Mock orders data
const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    items: [
      { menuItem: MOCK_MENU_ITEMS[0], quantity: 2 },
      { menuItem: MOCK_MENU_ITEMS[2], quantity: 1 }
    ],
    status: "completed",
    total: 200,
    timestamp: new Date(Date.now() - 3600000),
    customerName: "John Doe",
    orderType: "dine-in",
    paymentStatus: "completed",
    paymentMethod: "cash"
  },
  {
    id: "2",
    items: [
      { menuItem: MOCK_MENU_ITEMS[1], quantity: 1 },
      { menuItem: MOCK_MENU_ITEMS[2], quantity: 2 }
    ],
    status: "ready",
    total: 280,
    timestamp: new Date(Date.now() - 1800000),
    customerName: "Jane Smith",
    orderType: "takeaway",
    paymentStatus: "completed",
    paymentMethod: "card"
  },
  {
    id: "3",
    items: [
      { menuItem: MOCK_MENU_ITEMS[4], quantity: 1 },
    ],
    status: "preparing",
    total: 150,
    timestamp: new Date(),
    customerName: "Mike Johnson",
    orderType: "dine-in",
    paymentStatus: "pending"
  }
];

// Mock sales data
const MOCK_SALES_DATA: SalesData = {
  today: 630,
  transactions: 3,
  popularItems: [
    { name: "Cold Coffee", count: 3 },
    { name: "Vegetable Sandwich", count: 2 },
    { name: "Chicken Burger", count: 1 },
    { name: "Chicken Biryani", count: 1 }
  ]
};

const CanteenContext = createContext<CanteenContextType | undefined>(undefined);

export const CanteenProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [menu, setMenu] = useState<MenuItem[]>(MOCK_MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [salesData, setSalesData] = useState<SalesData>(MOCK_SALES_DATA);

  const addMenuItem = (item: Omit<MenuItem, "id">) => {
    const newItem = {
      ...item,
      id: `${menu.length + 1}`,
    };
    setMenu([...menu, newItem]);
    toast.success(`${item.name} added to menu`);
  };

  const updateMenuItem = (id: string, item: Partial<MenuItem>) => {
    setMenu(menu.map(menuItem => 
      menuItem.id === id ? { ...menuItem, ...item } : menuItem
    ));
    toast.success("Menu item updated");
  };

  const deleteMenuItem = (id: string) => {
    setMenu(menu.filter(item => item.id !== id));
    toast.success("Menu item deleted");
  };

  const placeOrder = (order: Omit<Order, "id" | "timestamp">) => {
    const newOrder = {
      ...order,
      id: `${orders.length + 1}`,
      timestamp: new Date(),
    };
    
    setOrders([newOrder, ...orders]);
    
    // Update sales data
    setSalesData({
      ...salesData,
      today: salesData.today + newOrder.total,
      transactions: salesData.transactions + 1,
      popularItems: updatePopularItems(newOrder.items, salesData.popularItems)
    });
    
    toast.success("Order placed successfully");
  };

  const updatePopularItems = (
    orderItems: OrderItem[], 
    popularItems: { name: string; count: number }[]
  ) => {
    const updatedPopularItems = [...popularItems];
    
    orderItems.forEach(item => {
      const itemName = item.menuItem.name;
      const existingItem = updatedPopularItems.find(i => i.name === itemName);
      
      if (existingItem) {
        existingItem.count += item.quantity;
      } else {
        updatedPopularItems.push({ name: itemName, count: item.quantity });
      }
    });
    
    // Sort by count in descending order
    return updatedPopularItems.sort((a, b) => b.count - a.count);
  };

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status } : order
    ));
    toast.success(`Order status updated to ${status}`);
  };

  const updatePaymentStatus = (id: string, paymentStatus: Order["paymentStatus"], paymentMethod?: Order["paymentMethod"]) => {
    setOrders(orders.map(order => 
      order.id === id ? { 
        ...order, 
        paymentStatus,
        ...(paymentMethod ? { paymentMethod } : {})
      } : order
    ));
    toast.success(`Payment status updated to ${paymentStatus}`);
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
