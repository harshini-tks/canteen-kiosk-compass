
import React from "react";
import { Sidebar, adminSidebarLinks } from "@/components/shared/Sidebar";
import DashboardCard from "@/components/shared/DashboardCard";
import { useCanteen } from "@/context/CanteenContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Utensils, Package } from "lucide-react";

const AdminDashboard = () => {
  const { salesData, menu, orders } = useCanteen();
  
  // Calculate stock status
  const lowStockItems = 2; // This would come from real data
  const itemsOutOfStock = menu.filter(item => !item.available).length;
  
  // Calculate pending orders
  const pendingOrders = orders.filter(order => 
    order.status === "pending" || order.status === "preparing"
  ).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar links={adminSidebarLinks} title="Admin Portal" />
      
      <div className="flex-1 overflow-y-auto p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of canteen operations</p>
        </header>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <DashboardCard
            title="Total Sales Today"
            value={`₹${salesData.today}`}
            icon={<DollarSign className="text-primary" size={18} />}
            description="Last 24 hours"
            trend="up"
            trendValue="8%"
          />
          
          <DashboardCard
            title="Transactions"
            value={salesData.transactions}
            icon={<ShoppingCart className="text-primary" size={18} />}
            description="Today"
          />
          
          <DashboardCard
            title="Items Running Low"
            value={lowStockItems}
            icon={<Package className="text-primary" size={18} />}
            description="Needs attention"
            trend={lowStockItems > 3 ? "up" : "down"}
            trendValue={lowStockItems > 3 ? "Critical" : "Normal"}
          />
          
          <DashboardCard
            title="Pending Orders"
            value={pendingOrders}
            icon={<Utensils className="text-primary" size={18} />}
            description="Waiting to be processed"
          />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {salesData.popularItems.slice(0, 5).map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600">{item.count} sold</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {orders.slice(0, 5).map((order) => (
                  <li key={order.id} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">Order #{order.id}</span>
                      <span className="text-xs text-gray-600 ml-2">
                        {order.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "completed" ? "bg-green-100 text-green-800" :
                        order.status === "ready" ? "bg-blue-100 text-blue-800" :
                        order.status === "preparing" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Menu Items</span>
                <span className="font-medium">{menu.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Available Items</span>
                <span className="font-medium">{menu.filter(item => item.available).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Out of Stock</span>
                <span className="font-medium">{itemsOutOfStock}</span>
              </div>
              <div className="flex justify-between">
                <span>Vegetarian Options</span>
                <span className="font-medium">{menu.filter(item => item.vegetarian).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
