"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
  TextField,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import BlockIcon from "@mui/icons-material/Block";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { qrService } from "@/services/qr.service";
import useAuthStore from "@/store/authStore";
import type { QRCode } from "@/types";

export default function QRCodesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  const isAdmin = user?.role !== "vendor_user";

  const productIdFilter = searchParams.get("productId") || "";
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchQR = useCallback(async () => {
    setLoading(true);
    try {
      const res = await qrService.list({ productId: productIdFilter || undefined, limit: 50 });
      if (res.data) setQrCodes(res.data);
    } finally {
      setLoading(false);
    }
  }, [productIdFilter]);

  useEffect(() => { fetchQR(); }, [fetchQR]);

  const handleDeactivate = async (id: string) => {
    try {
      await qrService.deactivate(id);
      enqueueSnackbar("QR code deactivated", { variant: "success" });
      fetchQR();
    } catch {
      enqueueSnackbar("Failed to deactivate", { variant: "error" });
    }
  };

  const downloadQR = (qr: QRCode) => {
    const link = document.createElement("a");
    link.href = qr.imageDataUrl;
    link.download = `qr-${qr.code}.png`;
    link.click();
  };

  const filtered = qrCodes.filter((qr) =>
    !search || qr.code.includes(search.toUpperCase()) || qr.product?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <PageHeader title="QR Codes" subtitle={`${qrCodes.length} codes total`} />

      <Box mb={2.5} display="flex" gap={1.5} alignItems="center">
        <TextField
          placeholder="Search code or product..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5, color: "#94A3B8" }} /> }}
          sx={{ minWidth: 260 }}
        />
        {productIdFilter && (
          <Button size="small" variant="outlined" onClick={() => router.push("/dashboard/qr-codes")}>
            Clear filter
          </Button>
        )}
      </Box>

      {loading ? (
        <Grid container spacing={2}>
          {[...Array(6)].map((_, i) => (
            <Grid key={i} item xs={12} sm={6} md={4} lg={3}>
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <EmptyState title="No QR codes found" description="Generate QR codes from a product page" />
      ) : (
        <Grid container spacing={2}>
          {filtered.map((qr) => (
            <Grid key={qr.id} item xs={12} sm={6} md={4} lg={3}>
              <Card sx={{ opacity: qr.isActive ? 1 : 0.55 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Box>
                      {qr.product && (
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 130 }}>
                          {qr.product.name}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                        {qr.code}
                      </Typography>
                    </Box>
                    <Chip
                      label={qr.isActive ? "Active" : "Inactive"}
                      size="small"
                      sx={{
                        backgroundColor: qr.isActive ? "#D1FAE5" : "#F1F5F9",
                        color: qr.isActive ? "#059669" : "#64748B",
                        fontWeight: 600,
                        fontSize: "0.68rem",
                      }}
                    />
                  </Box>

                  <Box display="flex" justifyContent="center" my={1.5}>
                    <img
                      src={qr.imageDataUrl}
                      alt="QR"
                      style={{ width: 150, height: 150, borderRadius: 6 }}
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {qr.scanCount} scans
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(qr.createdAt).format("MMM D, YYYY")}
                      </Typography>
                    </Box>
                    <Box>
                      <Tooltip title="Download PNG">
                        <IconButton size="small" onClick={() => downloadQR(qr)}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View passport">
                        <IconButton size="small" onClick={() => window.open(qr.url, "_blank")}>
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && qr.isActive && (
                        <Tooltip title="Deactivate">
                          <IconButton size="small" sx={{ color: "#EF4444" }} onClick={() => handleDeactivate(qr.id)}>
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
