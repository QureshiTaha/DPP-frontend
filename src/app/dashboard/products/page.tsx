"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Typography,
  Skeleton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import QrCodeIcon from "@mui/icons-material/QrCode";
import SearchIcon from "@mui/icons-material/Search";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import PageHeader from "@/components/ui/PageHeader";
import StatusChip from "@/components/ui/StatusChip";
import EmptyState from "@/components/ui/EmptyState";
import { productsService } from "@/services/products.service";
import useAuthStore from "@/store/authStore";
import type { Product, ProductStatus, PaginationMeta } from "@/types";

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  const isAdmin = user?.role !== "vendor_user";

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "">("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsService.list({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      if (res.data) setProducts(res.data);
      if (res.meta) setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleExport = async () => {
    try {
      await productsService.exportProducts();
      enqueueSnackbar("Export started", { variant: "success" });
    } catch {
      enqueueSnackbar("Export failed", { variant: "error" });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Products"
        subtitle={`${meta?.total ?? 0} products total`}
        actions={
          isAdmin ? (
            <>
              <Button variant="outlined" size="small" onClick={handleExport}>
                Export XLSX
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="small"
                onClick={() => router.push("/dashboard/products/new")}
              >
                New Product
              </Button>
            </>
          ) : undefined
        }
      />

      <Card>
        <Box p={2} display="flex" gap={1.5} flexWrap="wrap" borderBottom="1px solid #E2E8F0">
          <TextField
            placeholder="Search name, SKU, brand..."
            size="small"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5, color: "#94A3B8" }} /> }}
            sx={{ minWidth: 260 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value as ProductStatus | ""); setPage(0); }}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    title="No products found"
                    description="Create your first product to get started"
                    actionLabel={isAdmin ? "Create Product" : undefined}
                    onAction={isAdmin ? () => router.push("/dashboard/products/new") : undefined}
                  />
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} hover sx={{ cursor: "pointer" }} onClick={() => router.push(`/dashboard/products/${product.id}`)}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{product.name}</Typography>
                      {product.brand && (
                        <Typography variant="caption" color="text.secondary">{product.brand}</Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                      {product.sku}
                    </Typography>
                  </TableCell>
                  <TableCell>{product.category || "—"}</TableCell>
                  <TableCell><StatusChip status={product.status} /></TableCell>
                  <TableCell>v{product.version}</TableCell>
                  <TableCell>{dayjs(product.createdAt).format("MMM D, YYYY")}</TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => router.push(`/dashboard/products/${product.id}`)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {isAdmin && (
                      <>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="QR Codes">
                          <IconButton size="small" onClick={() => router.push(`/dashboard/qr-codes?productId=${product.id}`)}>
                            <QrCodeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
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
    </Box>
  );
}
