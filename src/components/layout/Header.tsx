"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Breadcrumbs,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  ListItemIcon,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import useAuthStore from "@/store/authStore";
import { authService } from "@/services/auth.service";

const SIDEBAR_WIDTH = 240;

const pathLabels: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Products",
  "qr-codes": "QR Codes",
  users: "Users",
  techpack: "Techpack",
  "import-export": "Import & Export",
  new: "New",
  edit: "Edit",
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => {
    const label = pathLabels[seg] || seg;
    const href = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;
    return { label, href, isLast };
  });

  const handleLogout = async () => {
    setAnchorEl(null);
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    logout();
    router.replace("/auth/login");
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
        ml: `${SIDEBAR_WIDTH}px`,
        backgroundColor: "#fff",
        borderBottom: "1px solid #E2E8F0",
        height: 56,
        justifyContent: "center",
      }}
    >
      <Toolbar sx={{ minHeight: "56px !important", px: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ color: "#CBD5E1" }} />}
          sx={{ flex: 1 }}
        >
          {breadcrumbs.map((bc) =>
            bc.isLast ? (
              <Typography key={bc.href} variant="body2" sx={{ color: "#0F172A", fontWeight: 600 }}>
                {bc.label}
              </Typography>
            ) : (
              <Typography
                key={bc.href}
                variant="body2"
                sx={{ color: "#64748B", cursor: "pointer", "&:hover": { color: "#6366F1" } }}
                onClick={() => router.push(bc.href)}
              >
                {bc.label}
              </Typography>
            )
          )}
        </Breadcrumbs>

        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <Avatar sx={{ width: 30, height: 30, bgcolor: "#6366F1", fontSize: "0.75rem" }}>
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { mt: 1, minWidth: 180, border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" } }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box px={2} py={1.5}>
            <Typography variant="body2" fontWeight={600}>{user?.firstName} {user?.lastName}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); router.push("/dashboard"); }}>
            <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
            <Typography variant="body2">Profile</Typography>
          </MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); }}>
            <ListItemIcon><LockIcon fontSize="small" /></ListItemIcon>
            <Typography variant="body2">Change Password</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
            <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: "error.main" }} /></ListItemIcon>
            <Typography variant="body2">Logout</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
