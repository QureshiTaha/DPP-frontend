"use client";

import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Skeleton,
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import QrCodeIcon from "@mui/icons-material/QrCode";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleIcon from "@mui/icons-material/People";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import dayjs from "dayjs";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardData } from "@/types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.overview().then((res) => {
      if (res.data) setData(res.data);
    }).finally(() => setLoading(false));
  }, []);



  const stats = data?.stats;
  const chartData = (() => {
    const months: Record<string, { month: string; products: number; scans: number }> = {};
    data?.charts.productTrend.forEach((p) => {
      months[p.month] = { month: p.month, products: Number(p.count), scans: 0 };
    });
    data?.charts.scanTrend.forEach((s) => {
      if (months[s.month]) months[s.month].scans = Number(s.count);
      else months[s.month] = { month: s.month, products: 0, scans: Number(s.count) };
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  })();

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Overview of your Digital Product Passport platform" />

      <Grid container spacing={2.5} mb={3}>
        {[
          { title: "Total Products", value: stats?.totalProducts ?? 0, icon: <InventoryIcon />, color: "#6366F1" },
          { title: "Active Products", value: stats?.activeProducts ?? 0, icon: <InventoryIcon />, color: "#10B981" },
          { title: "QR Codes", value: stats?.totalQRCodes ?? 0, icon: <QrCodeIcon />, color: "#F59E0B" },
          { title: "Total Scans", value: stats?.totalScans ?? 0, icon: <VisibilityIcon />, color: "#8B5CF6" },
          { title: "Draft Products", value: stats?.draftProducts ?? 0, icon: <InventoryIcon />, color: "#64748B" },
          { title: "Users", value: stats?.totalUsers ?? 0, icon: <PeopleIcon />, color: "#EC4899" },
        ].map((stat) => (
          <Grid key={stat.title} item xs={12} sm={6} md={4} lg={2}>
            <StatCard {...stat} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Activity Trends (Last 6 Months)
              </Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={240} />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#94A3B8" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        border: "1px solid #E2E8F0",
                        borderRadius: 8,
                        fontSize: 12,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    <Area
                      type="monotone"
                      dataKey="products"
                      name="Products"
                      stroke="#6366F1"
                      fill="#EEF2FF"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="scans"
                      name="Scans"
                      stroke="#10B981"
                      fill="#D1FAE5"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Recent Activity
              </Typography>
              {loading ? (
                [...Array(5)].map((_, i) => <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />)
              ) : data?.recentActivity.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No activity yet</Typography>
              ) : (
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {data?.recentActivity.slice(0, 8).map((log) => (
                    <Box key={log.id} display="flex" gap={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "#6366F1",
                          mt: 0.6,
                          flexShrink: 0,
                        }}
                      />
                      <Box flex={1} minWidth={0}>
                        <Typography variant="body2" sx={{ fontSize: "0.8rem", lineHeight: 1.4 }} noWrap>
                          {log.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(log.createdAt).isBefore(dayjs().subtract(7, "day"))}

                          {/* {dayjs(log.createdAt).fromNow()} */}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
