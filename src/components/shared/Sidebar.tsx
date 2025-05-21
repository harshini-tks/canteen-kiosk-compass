
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Home, ShoppingCart, FileText, Users, Settings, Menu } from "lucide-react";

interface SidebarLink {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface SidebarProps {
  links: SidebarLink[];
  title: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ links, title }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className={cn(
      "h-screen bg-sidebar flex flex-col transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
        <h1 className={cn(
          "font-bold text-2xl text-canteen-primary",
          collapsed && "hidden"
        )}>
          {title}
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Menu size={20} />
        </Button>
      </div>
      
      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="space-y-2 px-3">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center p-3 rounded-md transition-colors",
                collapsed ? "justify-center" : "justify-start",
                location.pathname === link.path
                  ? "bg-canteen-primary text-white"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <link.icon size={20} />
              {!collapsed && <span className="ml-3">{link.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-6 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed && "justify-center"
          )}
          onClick={logout}
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

// Admin sidebar links
export const adminSidebarLinks: SidebarLink[] = [
  { icon: Home, label: "Dashboard", path: "/admin" },
  { icon: FileText, label: "Menu Management", path: "/admin/menu" },
  { icon: Users, label: "User Management", path: "/admin/users" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

// Cashier sidebar links
export const cashierSidebarLinks: SidebarLink[] = [
  { icon: Home, label: "Dashboard", path: "/cashier" },
  { icon: ShoppingCart, label: "New Bill", path: "/cashier/bill" },
  { icon: FileText, label: "Recent Orders", path: "/cashier/orders" },
];

// Customer sidebar links
export const customerSidebarLinks: SidebarLink[] = [
  { icon: Home, label: "Menu", path: "/customer" },
  { icon: ShoppingCart, label: "My Cart", path: "/customer/cart" },
  { icon: FileText, label: "Order History", path: "/customer/orders" },
];
