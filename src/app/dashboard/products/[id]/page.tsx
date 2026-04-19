"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Skeleton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import QrCodeIcon from "@mui/icons-material/QrCode";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DoneIcon from "@mui/icons-material/Done";
import { useSnackbar } from "notistack";
import PageHeader from "@/components/ui/PageHeader";
import StatusChip from "@/components/ui/StatusChip";
import { productsService } from "@/services/products.service";
import { qrService } from "@/services/qr.service";
import useAuthStore from "@/store/authStore";
import type { Product } from "@/types";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  const isAdmin = user?.role !== "vendor_user";

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [generating, setGenerating] = useState(false);
  const safeArrayOrObject = (val: any, fallback = []) => {
    if (!val) return fallback;

    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (typeof parsed === "object") return parsed;
        return Array.isArray(parsed) ? parsed : fallback;
      } catch {
        return fallback;
      }
    }

    if (typeof val === "object") return val;
    return fallback;
  };

  useEffect(() => {
    productsService.getById(id).then((res) => {
      if (res.data?.certifications) {
        const certs = safeArrayOrObject(res.data.certifications);
        const careInstructions = safeArrayOrObject(res.data.careInstructions);
        const materials = safeArrayOrObject(res.data.materials);
        const supplyChain = safeArrayOrObject(res.data.supplyChain);



        let products_ = res.data;
        products_.certifications = certs;
        products_.careInstructions = careInstructions;
        products_.materials = materials;
        products_.supplyChain = supplyChain;
        console.log("Products_", products_);

        setProduct(products_);
      } else {
        if (res.data) setProduct(res.data);
        console.log("res.data", res.data);
      }

    }).finally(() => setLoading(false));
  }, [id]);

  const handleGenerateQR = async () => {
    setGenerating(true);
    try {
      const res = await qrService.generate(id);
      if (res.success) {
        enqueueSnackbar("QR code generated", { variant: "success" });
        const refreshed = await productsService.getById(id);
        if (refreshed.data) {
          setProduct(refreshed.data);
        }
      }
    } catch {
      enqueueSnackbar("Failed to generate QR code", { variant: "error" });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} />
      </Box>
    );
  }

  if (!product) {
    return <Typography>Product not found</Typography>;
  }

  const activeQR = product.qrCodes?.find((q) => q.isActive);

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          size="small"
          variant="text"
          onClick={() => router.push("/dashboard/products")}
          sx={{ color: "text.secondary" }}
        >
          Products
        </Button>
      </Box>

      <PageHeader
        title={product.name}
        subtitle={`SKU: ${product.sku} · Version ${product.version}`}
        actions={
          isAdmin ? (
            <>
              <Button
                variant="outlined"
                startIcon={<QrCodeIcon />}
                size="small"
                onClick={handleGenerateQR}
                disabled={generating}
              >
                {generating ? "Generating..." : "Generate QR"}
              </Button>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                size="small"
                onClick={() => router.push(`/dashboard/products/${id}/edit`)}
              >
                Edit
              </Button>
            </>
          ) : undefined
        }
      />

      <Box display="flex" gap={1} mb={3} flexWrap="wrap">
        <StatusChip status={product.status} />
        {product.season && <Chip label={product.season} size="small" variant="outlined" />}
        {product.category && <Chip label={product.category} size="small" variant="outlined" />}
        {product.brand && <Chip label={product.brand} size="small" variant="outlined" />}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: "1px solid #E2E8F0" }}>
        <Tab label="Overview" />
        <Tab label="Materials" />
        <Tab label="Supply Chain" />
        <Tab label="QR Codes" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Product Details</Typography>
                {product.description && (
                  <Typography variant="body2" color="text.secondary" mb={2} lineHeight={1.7}>
                    {product.description}
                  </Typography>
                )}
                <Grid container spacing={2}>
                  {[
                    { label: "Brand", value: product.brand },
                    { label: "Category", value: product.category },
                    { label: "Season", value: product.season },
                    { label: "Colorway", value: product.colorway },
                  ].filter((f) => f.value).map((f) => (
                    <Grid key={f.label} item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">{f.label}</Typography>
                      <Typography variant="body2" fontWeight={500}>{f.value}</Typography>
                    </Grid>
                  ))}
                </Grid>

                {product.manufacturing?.facility && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" fontWeight={600} mb={1.5}>Manufacturing</Typography>
                    <Grid container spacing={2}>
                      {[
                        { label: "Facility", value: product.manufacturing.facility },
                        { label: "Country", value: product.manufacturing.country },
                        { label: "Address", value: product.manufacturing.address },
                      ].filter((f) => f.value).map((f) => (
                        <Grid key={f.label} item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary" display="block">{f.label}</Typography>
                          <Typography variant="body2" fontWeight={500}>{f.value}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}


                {product.certifications.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" fontWeight={600} mb={1.5}>Certifications</Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>

                      {product.certifications?.map((cert) => (
                        <Chip
                          key={cert}
                          label={cert}
                          size="small"
                          icon={<CheckCircleIcon sx={{ fontSize: "14px !important" }} />}
                          sx={{ backgroundColor: "#D1FAE5", color: "#059669" }}
                        />
                      ))}
                    </Box>
                  </>
                )}

                {product.careInstructions.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" fontWeight={600} mb={1}>Care Instructions</Typography>
                    <List dense disablePadding>
                      {product.careInstructions.map((ins, i) => (
                        <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <DoneIcon sx={{ fontSize: 14, color: "#6366F1" }} />
                          </ListItemIcon>
                          <ListItemText primary={ins} primaryTypographyProps={{ variant: "body2" }} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            {activeQR && (
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Active QR Code</Typography>
                  <Box display="flex" justifyContent="center" mb={2}>
                    <img
                      src={activeQR.imageDataUrl}
                      alt="QR Code"
                      style={{ width: 180, height: 180, borderRadius: 8 }}
                    />
                  </Box>
                  <Typography variant="caption" display="block" textAlign="center" color="text.secondary" mb={1}>
                    Code: {activeQR.code}
                  </Typography>
                  <Typography variant="caption" display="block" textAlign="center" color="text.secondary">
                    Scanned {activeQR.scanCount} times
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2.5}>Material Composition</Typography>
            {product.materials.length === 0 ? (
              <Typography color="text.secondary">No materials specified</Typography>
            ) : (
              product.materials.map((mat, i) => (
                <Box key={i} mb={2.5}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight={500}>{mat.name}</Typography>
                    <Typography variant="body2" fontWeight={600}>{mat.percentage}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={mat.percentage}
                    sx={{ height: 6, borderRadius: 3, mb: 0.5, backgroundColor: "#EEF2FF", "& .MuiLinearProgress-bar": { backgroundColor: "#6366F1" } }}
                  />
                  <Box display="flex" gap={2}>
                    {mat.origin && <Typography variant="caption" color="text.secondary">Origin: {mat.origin}</Typography>}
                    {mat.certifications && <Typography variant="caption" color="text.secondary">Certs: {mat.certifications}</Typography>}
                  </Box>
                </Box>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2.5}>Supply Chain Journey</Typography>
            {product.supplyChain.length === 0 ? (
              <Typography color="text.secondary">No supply chain data</Typography>
            ) : (
              <Box position="relative">
                {product.supplyChain.map((step, i) => (
                  <Box key={i} display="flex" gap={2} mb={2.5} alignItems="flex-start">
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "#6366F1", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                        {i + 1}
                      </Box>
                      {i < product.supplyChain.length - 1 && (
                        <Box sx={{ width: 2, height: 32, bgcolor: "#E2E8F0", mt: 0.5 }} />
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{step.step}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {step.facility}{step.country ? `, ${step.country}` : ""}
                        {step.date ? ` · ${step.date}` : ""}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2.5}>QR Codes</Typography>
            {!product.qrCodes?.length ? (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary" mb={2}>No QR codes generated yet</Typography>
                {isAdmin && (
                  <Button variant="contained" startIcon={<QrCodeIcon />} onClick={handleGenerateQR} disabled={generating}>
                    Generate QR Code
                  </Button>
                )}
              </Box>
            ) : (
              <Grid container spacing={2}>
                {product.qrCodes.map((qr) => (
                  <Grid key={qr.id} item xs={12} sm={6} md={4}>
                    <Card variant="outlined" sx={{ opacity: qr.isActive ? 1 : 0.5 }}>
                      <CardContent sx={{ textAlign: "center" }}>
                        <img src={qr.imageDataUrl} alt="QR" style={{ width: 140, height: 140 }} />
                        <Typography variant="caption" display="block" sx={{ fontFamily: "monospace", mt: 1 }}>{qr.code}</Typography>
                        <Typography variant="caption" color="text.secondary">{qr.scanCount} scans</Typography>
                        <Chip label={qr.isActive ? "Active" : "Inactive"} size="small" sx={{ display: "block", mt: 1, mx: "auto", backgroundColor: qr.isActive ? "#D1FAE5" : "#F1F5F9", color: qr.isActive ? "#059669" : "#64748B" }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
