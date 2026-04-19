"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  Tooltip,
  Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import QrCodeIcon from "@mui/icons-material/QrCode";
import PeopleIcon from "@mui/icons-material/People";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import LogoutIcon from "@mui/icons-material/Logout";
import useAuthStore from "@/store/authStore";
import { authService } from "@/services/auth.service";
import type { UserRole } from "@/types";

const SIDEBAR_WIDTH = 240;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: <DashboardIcon fontSize="small" />,
    href: "/dashboard",
    roles: ["super_admin", "vendor_admin", "vendor_user"],
  },
  {
    label: "Products",
    icon: <InventoryIcon fontSize="small" />,
    href: "/dashboard/products",
    roles: ["super_admin", "vendor_admin", "vendor_user"],
  },
  {
    label: "QR Codes",
    icon: <QrCodeIcon fontSize="small" />,
    href: "/dashboard/qr-codes",
    roles: ["super_admin", "vendor_admin", "vendor_user"],
  },
  {
    label: "Users",
    icon: <PeopleIcon fontSize="small" />,
    href: "/dashboard/users",
    roles: ["super_admin", "vendor_admin"],
  },
  {
    label: "Techpack",
    icon: <AttachFileIcon fontSize="small" />,
    href: "/dashboard/techpack",
    roles: ["super_admin", "vendor_admin"],
  },
  {
    label: "Import / Export",
    icon: <ImportExportIcon fontSize="small" />,
    href: "/dashboard/import-export",
    roles: ["super_admin", "vendor_admin"],
  },
];

const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  vendor_admin: "Admin",
  vendor_user: "User",
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    logout();
    router.replace("/auth/login");
  };

  const filteredNav = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH,
          boxSizing: "border-box",
          background: "#0F172A",
          color: "#fff",
          border: "none",
        },
      }}
    >
      {/* Logo */}
      <Box px={2.5} py={3} display="flex" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <QrCodeIcon sx={{ fontSize: 18, color: "#fff" }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ color: "#fff", fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.2 }}>
            DPP Platform
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.7rem" }}>
            Digital Product Passport
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#1E293B", mx: 2 }} />

      {/* Navigation */}
      <Box flex={1} px={1.5} py={2}>
        <List disablePadding>
          {filteredNav.map((item) => {
            const active = isActive(item.href);
            return (
              <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => router.push(item.href)}
                  sx={{
                    borderRadius: 2,
                    px: 1.5,
                    py: 1,
                    backgroundColor: active ? "#6366F1" : "transparent",
                    "&:hover": {
                      backgroundColor: active ? "#5558E3" : "#1E293B",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 34,
                      color: active ? "#fff" : "#94A3B8",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: active ? 600 : 400,
                      color: active ? "#fff" : "#CBD5E1",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User profile */}
      <Divider sx={{ borderColor: "#1E293B", mx: 2 }} />
      <Box px={2} py={2}>
        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
          <Avatar
            sx={{ width: 32, height: 32, bgcolor: "#6366F1", fontSize: "0.8rem" }}
          >
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography
              variant="body2"
              sx={{ color: "#F1F5F9", fontWeight: 500, fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B", fontSize: "0.7rem" }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Chip
            label={user ? roleLabels[user.role] : ""}
            size="small"
            sx={{
              backgroundColor: "#1E293B",
              color: "#94A3B8",
              fontSize: "0.68rem",
              height: 20,
            }}
          />
          <Tooltip title="Logout">
            <Box
              onClick={handleLogout}
              sx={{
                cursor: "pointer",
                color: "#64748B",
                display: "flex",
                "&:hover": { color: "#EF4444" },
              }}
            >
              <LogoutIcon fontSize="small" />
            </Box>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
}
