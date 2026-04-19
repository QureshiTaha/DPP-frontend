"use client";

import { useState, useRef } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Stack,
  LinearProgress,
  Chip,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CodeIcon from "@mui/icons-material/Code";
import { useSnackbar } from "notistack";
import PageHeader from "@/components/ui/PageHeader";
import AuthGuard from "@/components/layout/AuthGuard";
import { productsService } from "@/services/products.service";

const columnSpec = [
  { name: "sku", required: true, description: "Unique product identifier" },
  { name: "name", required: true, description: "Product display name" },
  { name: "description", required: false, description: "Short product description" },
  { name: "category", required: false, description: "e.g. Apparel / Accessories" },
  { name: "brand", required: false, description: "Brand or label" },
  { name: "season", required: false, description: "e.g. SS25, FW24" },
  { name: "colorway", required: false, description: "Color variant" },
  { name: "status", required: false, description: "draft | active | archived (default: draft)" },
];

const apiEndpoints = [
  { method: "GET", path: "/api/v1/products", desc: "List products with pagination & search" },
  { method: "GET", path: "/api/v1/products/:id", desc: "Get single product by id" },
  { method: "POST", path: "/api/v1/products", desc: "Create a new product" },
  { method: "PUT", path: "/api/v1/products/:id", desc: "Update existing product (increments version)" },
  { method: "DELETE", path: "/api/v1/products/:id", desc: "Soft-archive a product" },
  { method: "POST", path: "/api/v1/products/import", desc: "Bulk import via XLSX upload" },
  { method: "GET", path: "/api/v1/products/export/xlsx", desc: "Export all products to XLSX" },
  { method: "POST", path: "/api/v1/qr/generate", desc: "Generate QR code for a product" },
  { method: "GET", path: "/api/v1/qr/scan/:code", desc: "Public passport lookup (no auth)" },
];

const methodColors: Record<string, { bg: string; color: string }> = {
  GET: { bg: "#DBEAFE", color: "#1E40AF" },
  POST: { bg: "#DCFCE7", color: "#166534" },
  PUT: { bg: "#FEF3C7", color: "#92400E" },
  DELETE: { bg: "#FEE2E2", color: "#991B1B" },
};

function ImportExportInner() {
  const { enqueueSnackbar } = useSnackbar();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastResult, setLastResult] = useState<{ count: number; at: string } | null>(null);

  const handleImport = async () => {
    if (!file) {
      enqueueSnackbar("Select an .xlsx file first", { variant: "warning" });
      return;
    }
    setImporting(true);
    try {
      const res = await productsService.importProducts(file);
      if (res.success && res.data) {
        setLastResult({ count: res.data.count, at: new Date().toISOString() });
        enqueueSnackbar(`Imported ${res.data.count} products successfully`, { variant: "success" });
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Import failed";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await productsService.exportProducts();
      enqueueSnackbar("Export downloaded", { variant: "success" });
    } catch {
      enqueueSnackbar("Export failed", { variant: "error" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Import & Export"
        subtitle="Bulk manage products via spreadsheet or integrate directly with the API"
      />

      <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={3} mb={3}>
        <Card sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                backgroundColor: "#EEF2FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UploadFileIcon sx={{ color: "primary.main" }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Import Products
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Upload an .xlsx file to create multiple products at once
              </Typography>
            </Box>
          </Stack>

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <Button
            variant="outlined"
            fullWidth
            onClick={() => inputRef.current?.click()}
            sx={{ mb: 2, py: 1.5, borderStyle: "dashed" }}
            disabled={importing}
          >
            {file ? file.name : "Choose XLSX file"}
          </Button>

          {importing && <LinearProgress sx={{ mb: 2 }} />}

          <Button
            variant="contained"
            fullWidth
            startIcon={<UploadFileIcon />}
            onClick={handleImport}
            disabled={!file || importing}
          >
            {importing ? "Importing..." : "Start Import"}
          </Button>

          {lastResult && (
            <Box
              mt={2}
              p={1.5}
              sx={{
                backgroundColor: "#DCFCE7",
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CheckCircleIcon fontSize="small" sx={{ color: "#166534" }} />
              <Typography variant="body2" sx={{ color: "#166534", fontWeight: 600 }}>
                Last import: {lastResult.count} products
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
            REQUIRED COLUMNS
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Column</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {columnSpec.map((col) => (
                <TableRow key={col.name}>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                        {col.name}
                      </Typography>
                      {col.required && (
                        <Chip
                          label="required"
                          size="small"
                          sx={{ backgroundColor: "#FEE2E2", color: "#991B1B", height: 18, fontSize: 10 }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {col.description}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                backgroundColor: "#DCFCE7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileDownloadIcon sx={{ color: "#166534" }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Export Products
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Download all products as an XLSX spreadsheet
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              backgroundColor: "#F8FAFC",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              border: "1px solid #E2E8F0",
            }}
          >
            <FileDownloadIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
            <Typography variant="body2" color="text.secondary" mb={2}>
              Includes SKU, name, brand, category, season, status, and materials JSON
            </Typography>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? "Preparing..." : "Download XLSX"}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <CodeIcon fontSize="small" sx={{ color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              cURL EXAMPLE
            </Typography>
          </Stack>
          <Box
            component="pre"
            sx={{
              backgroundColor: "#0F172A",
              color: "#E2E8F0",
              p: 2,
              borderRadius: 1.5,
              fontSize: 12,
              overflow: "auto",
              m: 0,
              fontFamily: "monospace",
            }}
          >
            {`curl -X GET '${typeof window !== "undefined" ? window.location.origin : ""}/api/v1/products/export/xlsx' \\
  -H 'Authorization: Bearer <ACCESS_TOKEN>' \\
  --output products.xlsx`}
          </Box>
        </Card>
      </Box>

      <Card sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
          <CodeIcon sx={{ color: "primary.main" }} />
          <Typography variant="subtitle1" fontWeight={700}>
            API Reference
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={2}>
          All endpoints are prefixed with <code>/api/v1</code> and require a Bearer token except where noted.
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={90}>Method</TableCell>
              <TableCell>Endpoint</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apiEndpoints.map((ep) => {
              const color = methodColors[ep.method];
              return (
                <TableRow key={ep.method + ep.path}>
                  <TableCell>
                    <Chip
                      label={ep.method}
                      size="small"
                      sx={{
                        backgroundColor: color.bg,
                        color: color.color,
                        fontWeight: 700,
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {ep.path}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {ep.desc}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}

export default function ImportExportPage() {
  return (
    <AuthGuard allowedRoles={["super_admin", "vendor_admin", "vendor_user"]}>
      <ImportExportInner />
    </AuthGuard>
  );
}
