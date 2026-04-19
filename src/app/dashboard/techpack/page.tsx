"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Stack,
  Chip,
  IconButton,
  Skeleton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "notistack";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import AuthGuard from "@/components/layout/AuthGuard";
import { productsService } from "@/services/products.service";
import type { Product } from "@/types";

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED = [".pdf", ".png", ".jpg", ".jpeg"];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function TechpackPageInner() {
  const { enqueueSnackbar } = useSnackbar();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoadingProducts(true);
      try {
        const res = await productsService.list({ limit: 200 });
        if (res.data) setProducts(res.data);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  const selectedProduct = products.find((p) => p.id === selectedId);

  const validate = useCallback(
    (f: File) => {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED.includes(ext)) {
        enqueueSnackbar(`File type not allowed. Accepted: ${ACCEPTED.join(", ")}`, { variant: "error" });
        return false;
      }
      if (f.size > MAX_SIZE) {
        enqueueSnackbar("File exceeds 10MB limit", { variant: "error" });
        return false;
      }
      return true;
    },
    [enqueueSnackbar]
  );

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (validate(f)) {
      setFile(f);
      setUploadedUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!selectedId) {
      enqueueSnackbar("Select a product first", { variant: "warning" });
      return;
    }
    if (!file) {
      enqueueSnackbar("Choose a file to upload", { variant: "warning" });
      return;
    }
    setUploading(true);
    try {
      const res = await productsService.uploadTechpack(selectedId, file);
      if (res.success && res.data?.techpackUrl) {
        setUploadedUrl(res.data.techpackUrl);
        enqueueSnackbar("Techpack uploaded successfully", { variant: "success" });
        setProducts((prev) =>
          prev.map((p) => (p.id === selectedId ? { ...p, techpackUrl: res.data!.techpackUrl } : p))
        );
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Upload failed";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setUploading(false);
    }
  };

  const resetFile = () => {
    setFile(null);
    setUploadedUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Box>
      <PageHeader
        title="Techpack Upload"
        subtitle="Attach technical packages to your products (PDF, PNG, JPG up to 10MB)"
      />

      <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 320px" }} gap={3}>
        <Card sx={{ p: 3 }}>
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel>Select Product</InputLabel>
            <Select
              value={selectedId}
              label="Select Product"
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={loadingProducts}
            >
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.sku} — {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            sx={{
              border: "2px dashed",
              borderColor: dragOver ? "primary.main" : "#CBD5E1",
              backgroundColor: dragOver ? "#EEF2FF" : "#F8FAFC",
              borderRadius: 2,
              p: 6,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { borderColor: "primary.main", backgroundColor: "#EEF2FF" },
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED.join(",")}
              style={{ display: "none" }}
              onChange={(e) => handleFiles(e.target.files)}
            />
            <CloudUploadIcon sx={{ fontSize: 56, color: "primary.main", mb: 1.5 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Drop your file here, or click to browse
            </Typography>
            <Typography variant="body2" color="text.secondary">
              PDF, PNG, JPG — max 10MB
            </Typography>
          </Box>

          {file && (
            <Card
              variant="outlined"
              sx={{ mt: 3, p: 2, display: "flex", alignItems: "center", gap: 2 }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1.5,
                  backgroundColor: "#EEF2FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <InsertDriveFileIcon sx={{ color: "primary.main" }} />
              </Box>
              <Box flex={1} minWidth={0}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatBytes(file.size)}
                </Typography>
                {uploading && <LinearProgress sx={{ mt: 1 }} />}
              </Box>
              {uploadedUrl ? (
                <CheckCircleIcon sx={{ color: "#10B981" }} />
              ) : (
                <IconButton size="small" onClick={resetFile} disabled={uploading}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Card>
          )}

          <Stack direction="row" spacing={1.5} mt={3} justifyContent="flex-end">
            <Button variant="outlined" onClick={resetFile} disabled={!file || uploading}>
              Clear
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!file || !selectedId || uploading}
              startIcon={<CloudUploadIcon />}
            >
              {uploading ? "Uploading..." : "Upload Techpack"}
            </Button>
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={2}>
            Current Techpack
          </Typography>
          {loadingProducts ? (
            <Skeleton variant="rectangular" height={120} />
          ) : !selectedProduct ? (
            <EmptyState title="No product selected" description="Choose a product to view its techpack." />
          ) : selectedProduct.techpackUrl ? (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Product
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {selectedProduct.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  SKU
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {selectedProduct.sku}
                </Typography>
              </Box>
              <Chip
                icon={<CheckCircleIcon />}
                label="Techpack attached"
                size="small"
                sx={{ backgroundColor: "#DCFCE7", color: "#166534", fontWeight: 600, width: "fit-content" }}
              />
              <Button
                variant="outlined"
                size="small"
                endIcon={<OpenInNewIcon />}
                href={selectedProduct.techpackUrl}
                target="_blank"
                rel="noopener"
              >
                View File
              </Button>
            </Stack>
          ) : (
            <EmptyState title="No techpack uploaded" description="Upload a file to attach it to this product." />
          )}
        </Card>
      </Box>
    </Box>
  );
}

export default function TechpackPage() {
  return (
    <AuthGuard allowedRoles={["super_admin", "vendor_admin", "vendor_user"]}>
      <TechpackPageInner />
    </AuthGuard>
  );
}
