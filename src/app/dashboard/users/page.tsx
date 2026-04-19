"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Skeleton,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import AuthGuard from "@/components/layout/AuthGuard";
import { usersService } from "@/services/users.service";
import useAuthStore from "@/store/authStore";
import type { User, UserRole, PaginationMeta } from "@/types";

const roleColors: Record<UserRole, { bg: string; color: string; label: string }> = {
  super_admin: { bg: "#FCE7F3", color: "#BE185D", label: "Super Admin" },
  vendor_admin: { bg: "#EEF2FF", color: "#4F46E5", label: "Vendor Admin" },
  vendor_user: { bg: "#F1F5F9", color: "#475569", label: "Vendor User" },
};

function UsersPageInner() {
  const { user: currentUser } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();

  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "vendor_user" as UserRole,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersService.list({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
      });
      if (res.data) setUsers(res.data);
      if (res.meta) setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      enqueueSnackbar("All fields are required", { variant: "warning" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await usersService.create(form);
      if (res.success) {
        enqueueSnackbar("User created", { variant: "success" });
        setDialogOpen(false);
        setForm({ firstName: "", lastName: "", email: "", password: "", role: "vendor_user" });
        fetch();
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create user";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await usersService.toggleStatus(id);
      enqueueSnackbar("Status updated", { variant: "success" });
      fetch();
    } catch {
      enqueueSnackbar("Failed to update status", { variant: "error" });
    }
  };

  const availableRoles: UserRole[] =
    currentUser?.role === "super_admin"
      ? ["super_admin", "vendor_admin", "vendor_user"]
      : ["vendor_admin", "vendor_user"];

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle={`${meta?.total ?? 0} users total`}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={() => setDialogOpen(true)}>
            New User
          </Button>
        }
      />

      <Card>
        <Box p={2} borderBottom="1px solid #E2E8F0">
          <TextField
            placeholder="Search users..."
            size="small"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5, color: "#94A3B8" }} /> }}
            sx={{ minWidth: 260 }}
          />
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((_, j) => (<TableCell key={j}><Skeleton /></TableCell>))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState title="No users found" />
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => {
                const role = roleColors[u.role];
                return (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {u.firstName} {u.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{u.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={role.label}
                        size="small"
                        sx={{ backgroundColor: role.bg, color: role.color, fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {u.lastLoginAt ? dayjs(u.lastLoginAt).format("MMM D, YYYY HH:mm") : "Never"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={u.isActive}
                        onChange={() => handleToggle(u.id)}
                        size="small"
                        disabled={u.id === currentUser?.id}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {meta && (
          <TablePagination
            component="div"
            count={meta.total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={6}>
              <TextField
                label="First Name" fullWidth required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Last Name" fullWidth required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email" type="email" fullWidth required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password" type="password" fullWidth required
                helperText="Minimum 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  value={form.role}
                  label="Role"
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                >
                  {availableRoles.map((r) => (
                    <MenuItem key={r} value={r}>{roleColors[r].label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={submitting}>
            {submitting ? "Creating..." : "Create User"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function UsersPage() {
  return (
    <AuthGuard allowedRoles={["super_admin", "vendor_admin"]}>
      <UsersPageInner />
    </AuthGuard>
  );
}
