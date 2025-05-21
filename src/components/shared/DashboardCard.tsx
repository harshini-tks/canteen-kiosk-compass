
import React, { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: "up" | "down";
  trendValue?: string;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  className
}) => {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trendValue) && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {trend && (
              <span className={cn(
                "mr-1",
                trend === "up" ? "text-green-500" : "text-red-500"
              )}>
                {trend === "up" ? "↑" : "↓"}
              </span>
            )}
            {trendValue && <span className="mr-1">{trendValue}</span>}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
