
import React from "react";
import { Order } from "@/context/CanteenContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OrderHistoryProps {
  orders: Order[];
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
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
              <div className="font-medium">Order #{order.id}</div>
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
