
import React, { useState } from "react";
import { Sidebar, cashierSidebarLinks } from "@/components/shared/Sidebar";
import { useCanteen } from "@/context/CanteenContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/shared/DashboardCard";
import { DollarSign, ShoppingCart, Clock, Bell } from "lucide-react";

const CashierDashboard = () => {
  const { user } = useAuth();
  const { salesData, orders } = useCanteen();
  const [activeTab, setActiveTab] = useState<"pending" | "ready" | "recent">("pending");
  
  // Get pending and ready orders
  const pendingOrders = orders.filter(order => order.status === "pending");
  const readyOrders = orders.filter(order => order.status === "ready");
  const recentOrders = orders.filter(order => order.status === "completed").slice(0, 5);
  
  // Calculate cashier stats
  const cashierSales = 350; // This would come from real data
  const cashierTransactions = 5; // This would come from real data

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar links={cashierSidebarLinks} title="Cashier Portal" />
      
      <div className="flex-1 overflow-y-auto p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-gray-600">Cashier Dashboard</p>
        </header>
        
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <DashboardCard
            title="Your Sales Today"
            value={`₹${cashierSales}`}
            icon={<DollarSign className="text-primary" size={18} />}
            description="Personal performance"
          />
          
          <DashboardCard
            title="Your Transactions"
            value={cashierTransactions}
            icon={<ShoppingCart className="text-primary" size={18} />}
            description="Bills generated today"
          />
          
          <DashboardCard
            title="Shift Timer"
            value="3h 24m"
            icon={<Clock className="text-primary" size={18} />}
            description="Current shift duration"
          />
        </div>
        
        <div className="mb-6">
          <div className="flex space-x-4 mb-4">
            <Button
              variant={activeTab === "pending" ? "default" : "outline"}
              onClick={() => setActiveTab("pending")}
              className={`${activeTab === "pending" && "bg-canteen-primary hover:bg-canteen-secondary"}`}
            >
              Pending Orders ({pendingOrders.length})
            </Button>
            <Button
              variant={activeTab === "ready" ? "default" : "outline"}
              onClick={() => setActiveTab("ready")}
              className={`${activeTab === "ready" && "bg-canteen-primary hover:bg-canteen-secondary"}`}
            >
              Ready Orders ({readyOrders.length})
            </Button>
            <Button
              variant={activeTab === "recent" ? "default" : "outline"}
              onClick={() => setActiveTab("recent")}
              className={`${activeTab === "recent" && "bg-canteen-primary hover:bg-canteen-secondary"}`}
            >
              Recent Orders
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-4">
              {activeTab === "pending" && (
                <>
                  {pendingOrders.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No pending orders</p>
                  ) : (
                    <ul className="space-y-4">
                      {pendingOrders.map((order) => (
                        <li key={order.id} className="border-b pb-3">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="font-medium">Order #{order.id}</span>
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full ml-2">
                                Preparing
                              </span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {order.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {order.customerName || "Customer"} | {order.orderType}
                          </div>
                          <div className="text-sm">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{item.quantity}x {item.menuItem.name}</span>
                                <span>₹{item.menuItem.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between mt-2 font-bold">
                            <span>Total:</span>
                            <span>₹{order.total}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
              
              {activeTab === "ready" && (
                <>
                  {readyOrders.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No orders ready for pickup</p>
                  ) : (
                    <ul className="space-y-4">
                      {readyOrders.map((order) => (
                        <li key={order.id} className="border-b pb-3">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="font-medium">Order #{order.id}</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full ml-2">
                                Ready
                              </span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {order.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {order.customerName || "Customer"} | {order.orderType}
                          </div>
                          <div className="flex justify-between mt-2 font-bold">
                            <span>Total:</span>
                            <span>₹{order.total}</span>
                          </div>
                          <div className="flex justify-end mt-2 space-x-2">
                            <Button size="sm" variant="outline">Notify Customer</Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">Mark Completed</Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
              
              {activeTab === "recent" && (
                <>
                  {recentOrders.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No recent orders</p>
                  ) : (
                    <ul className="space-y-4">
                      {recentOrders.map((order) => (
                        <li key={order.id} className="border-b pb-3">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="font-medium">Order #{order.id}</span>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-2">
                                Completed
                              </span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {order.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.customerName || "Customer"} | {order.orderType} | ₹{order.total}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">Quick Actions</CardTitle>
              <Bell className="text-primary" size={18} />
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-canteen-primary hover:bg-canteen-secondary">
                Create New Bill
              </Button>
              <Button variant="outline" className="w-full">
                View All Orders
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-md font-medium">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sales Today</span>
                  <span className="font-medium">₹{salesData.today}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Transactions</span>
                  <span className="font-medium">{salesData.transactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Most Sold Item</span>
                  <span className="font-medium">{salesData.popularItems[0]?.name || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;
