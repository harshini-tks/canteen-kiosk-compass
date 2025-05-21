
import React from "react";
import { Order } from "@/context/CanteenContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderHistoryProps {
  orders: Order[];
  loading?: boolean;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, loading = false }) => {
  // Function to format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  // Function to get status badge variant
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case "preparing":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Preparing</Badge>;
      case "ready":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Ready</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Function to get payment status badge variant
  const getPaymentBadge = (status: Order["paymentStatus"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Paid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="bg-gray-50 p-4 border-b">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-full max-w-[300px]" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-full max-w-[250px]" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-full max-w-[200px]" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id} className="overflow-hidden">
          <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
            <div>
              <div className="font-medium">Order #{order.id.substring(0, 8)}</div>
              <div className="text-sm text-gray-500">{formatDate(order.timestamp)}</div>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(order.status)}
              {getPaymentBadge(order.paymentStatus)}
            </div>
          </div>
          
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.menuItem.name}</div>
                        {item.customizations && (
                          <div className="text-sm text-gray-500">{item.customizations}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">₹{item.menuItem.price}</TableCell>
                    <TableCell className="text-right">₹{item.menuItem.price * item.quantity}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                  <TableCell className="text-right font-bold">₹{order.total}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <div className="mt-4 text-sm text-gray-500">
              <div>Order Type: <span className="capitalize">{order.orderType}</span></div>
              {order.paymentMethod && (
                <div>Payment Method: <span className="capitalize">{order.paymentMethod}</span></div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
