"use client";

import { Card, CardContent, Typography, Box, Skeleton } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  loading?: boolean;
  trend?: number;
  suffix?: string;
  color?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  loading,
  trend,
  suffix,
  color = "#6366F1",
}: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Skeleton variant="text" width={100} height={20} />
          <Skeleton variant="text" width={60} height={40} sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: "#0F172A", fontSize: "1.75rem" }}>
              {typeof value === "number" ? value.toLocaleString() : value}
              {suffix && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                  {suffix}
                </Typography>
              )}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              backgroundColor: `${color}14`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color,
            }}
          >
            {icon}
          </Box>
        </Box>
        {trend !== undefined && (
          <Box display="flex" alignItems="center" gap={0.5} mt={1.5}>
            {trend >= 0 ? (
              <TrendingUpIcon sx={{ fontSize: 14, color: "#10B981" }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 14, color: "#EF4444" }} />
            )}
            <Typography variant="caption" sx={{ color: trend >= 0 ? "#10B981" : "#EF4444", fontWeight: 500 }}>
              {Math.abs(trend)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              vs last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
