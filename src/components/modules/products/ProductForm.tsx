"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Divider,
  IconButton,
  Chip,
  Grid,
  Alert,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import type { ProductFormData, Material, SupplyChainStep, ProductStatus } from "@/types";

const CATEGORIES = [
  "T-Shirts", "Shirts", "Pants", "Shorts", "Dresses", "Skirts",
  "Jackets", "Coats", "Sweaters", "Hoodies", "Underwear", "Socks",
  "Shoes", "Accessories", "Bags", "Other",
];

const SEASONS = ["SS24", "FW24", "SS25", "FW25", "SS26", "FW26", "Year-Round"];

const PRESET_CERTIFICATIONS = [
  "GOTS", "OEKO-TEX", "Fair Trade", "B-Corp",
  "Bluesign", "Recycled Content", "Cradle to Cradle",
];

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  loading?: boolean;
  submitLabel?: string;
}

const emptyMaterial = (): Material => ({
  name: "",
  percentage: 0,
  origin: "",
  certifications: "",
});

const emptyStep = (): SupplyChainStep => ({
  step: "",
  facility: "",
  country: "",
  date: "",
});

export default function ProductForm({
  initialData,
  onSubmit,
  loading,
  submitLabel = "Save Product",
}: ProductFormProps) {
  const safeArray = (val: any, fallback = []) => {
    if (!val) return fallback;

    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : fallback;
      } catch {
        return fallback;
      }
    }

    return Array.isArray(val) ? val : fallback;
  };
  const [form, setForm] = useState<ProductFormData>({
    sku: initialData?.sku || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    brand: initialData?.brand || "",
    season: initialData?.season || "",
    colorway: initialData?.colorway || "",
    status: initialData?.status || "draft",
    materials: safeArray(initialData?.materials, []) as Material[],
    supplyChain: safeArray(initialData?.supplyChain) as SupplyChainStep[],
    certifications: safeArray(initialData?.certifications) as string[],
    careInstructions: safeArray(initialData?.careInstructions) as string[],
    manufacturing: initialData?.manufacturing || { facility: "", country: "", address: "" },
  });
  const [careInput, setCareInput] = useState("");
  const [customCert, setCustomCert] = useState("");

  const set = (field: keyof ProductFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const totalMaterialPct = form.materials.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);

  const updateMaterial = (i: number, field: keyof Material, value: string | number) => {
    const updated = [...form.materials];
    updated[i] = { ...updated[i], [field]: value };
    set("materials", updated);
  };

  const addMaterial = () => set("materials", [...form.materials, emptyMaterial()]);

  const removeMaterial = (i: number) =>
    set("materials", form.materials.filter((_, idx) => idx !== i));

  const updateStep = (i: number, field: keyof SupplyChainStep, value: string) => {
    const updated = [...form.supplyChain];
    updated[i] = { ...updated[i], [field]: value };
    set("supplyChain", updated);
  };

  const addStep = () => set("supplyChain", [...form.supplyChain, emptyStep()]);

  const removeStep = (i: number) =>
    set("supplyChain", form.supplyChain.filter((_, idx) => idx !== i));

  const toggleCert = (cert: string) => {
    const certs = form.certifications.includes(cert)
      ? form.certifications.filter((c) => c !== cert)
      : [...form.certifications, cert];
    set("certifications", certs);
  };

  const addCare = () => {
    if (!careInput.trim()) return;
    set("careInstructions", [...form.careInstructions, careInput.trim()]);
    setCareInput("");
  };

  const addCustomCert = () => {
    if (!customCert.trim()) return;
    if (!form.certifications.includes(customCert.trim())) {
      set("certifications", [...form.certifications, customCert.trim()]);
    }
    setCustomCert("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };



  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Section 1: Basic Information */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2.5}>
          Basic Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Product Name *"
              fullWidth
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="SKU *"
              fullWidth
              required
              value={form.sku}
              onChange={(e) => set("sku", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Brand"
              fullWidth
              value={form.brand}
              onChange={(e) => set("brand", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Colorway"
              fullWidth
              value={form.colorway}
              onChange={(e) => set("colorway", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={form.category} label="Category" onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Season</InputLabel>
              <Select value={form.season} label="Season" onChange={(e) => set("season", e.target.value)}>
                {SEASONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={form.status} label="Status" onChange={(e) => set("status", e.target.value as ProductStatus)}>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Section 2: Material Composition */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
          <Box>
            <Typography variant="h6" fontWeight={600}>Material Composition</Typography>
            {totalMaterialPct !== 100 && (
              <Alert severity={totalMaterialPct > 100 ? "error" : "warning"} sx={{ mt: 0.5, py: 0, fontSize: "0.75rem" }}>
                Total: {totalMaterialPct}% (must equal 100%)
              </Alert>
            )}
          </Box>
          <Button startIcon={<AddIcon />} onClick={addMaterial} size="small" variant="outlined">
            Add Material
          </Button>
        </Box>
        {form.materials.map((mat, i) => (
          <Box key={i} display="flex" gap={1.5} alignItems="center" mb={1.5}>
            <TextField
              label="Material"
              size="small"
              sx={{ flex: 2 }}
              value={mat.name}
              onChange={(e) => updateMaterial(i, "name", e.target.value)}
              placeholder="e.g. Organic Cotton"
            />
            <TextField
              label="%"
              size="small"
              type="number"
              sx={{ width: 80 }}
              value={mat.percentage}
              onChange={(e) => updateMaterial(i, "percentage", Number(e.target.value))}
              inputProps={{ min: 0, max: 100 }}
            />
            <TextField
              label="Origin"
              size="small"
              sx={{ flex: 1.5 }}
              value={mat.origin}
              onChange={(e) => updateMaterial(i, "origin", e.target.value)}
              placeholder="e.g. India"
            />
            <TextField
              label="Certifications"
              size="small"
              sx={{ flex: 2 }}
              value={mat.certifications}
              onChange={(e) => updateMaterial(i, "certifications", e.target.value)}
              placeholder="GOTS, OEKO-TEX"
            />
            <IconButton size="small" onClick={() => removeMaterial(i)} sx={{ color: "#EF4444", flexShrink: 0 }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Paper>

      {/* Section 3: Manufacturing */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2.5}>Manufacturing</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Facility Name"
              fullWidth
              value={form.manufacturing.facility}
              onChange={(e) => set("manufacturing", { ...form.manufacturing, facility: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Country"
              fullWidth
              value={form.manufacturing.country}
              onChange={(e) => set("manufacturing", { ...form.manufacturing, country: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Address"
              fullWidth
              value={form.manufacturing.address}
              onChange={(e) => set("manufacturing", { ...form.manufacturing, address: e.target.value })}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Section 4: Supply Chain */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
          <Typography variant="h6" fontWeight={600}>Supply Chain Journey</Typography>
          <Button startIcon={<AddIcon />} onClick={addStep} size="small" variant="outlined">
            Add Step
          </Button>
        </Box>
        {form.supplyChain.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No supply chain steps added. Click "Add Step" to trace the journey.
          </Typography>
        )}
        {form.supplyChain.map((step, i) => (
          <Box key={i} display="flex" gap={1.5} alignItems="center" mb={1.5}>
            <TextField
              label="Step"
              size="small"
              sx={{ flex: 1.5 }}
              value={step.step}
              onChange={(e) => updateStep(i, "step", e.target.value)}
              placeholder="e.g. Raw Material"
            />
            <TextField
              label="Facility"
              size="small"
              sx={{ flex: 2 }}
              value={step.facility}
              onChange={(e) => updateStep(i, "facility", e.target.value)}
            />
            <TextField
              label="Country"
              size="small"
              sx={{ flex: 1 }}
              value={step.country}
              onChange={(e) => updateStep(i, "country", e.target.value)}
            />
            <TextField
              label="Date"
              size="small"
              type="date"
              sx={{ flex: 1.5 }}
              value={step.date}
              onChange={(e) => updateStep(i, "date", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <IconButton size="small" onClick={() => removeStep(i)} sx={{ color: "#EF4444", flexShrink: 0 }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Paper>

      {/* Section 5: Certifications */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>Certifications</Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          {PRESET_CERTIFICATIONS.map((cert) => (
            <Chip
              key={cert}
              label={cert}
              clickable
              onClick={() => toggleCert(cert)}
              color={form.certifications.includes(cert) ? "primary" : "default"}
              variant={form.certifications.includes(cert) ? "filled" : "outlined"}
              size="small"
            />
          ))}
        </Box>
        <Box display="flex" gap={1}>
          <TextField
            label="Custom certification"
            size="small"
            value={customCert}
            onChange={(e) => setCustomCert(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomCert(); } }}
            sx={{ flex: 1, maxWidth: 300 }}
          />
          <Button variant="outlined" size="small" onClick={addCustomCert}>
            Add
          </Button>
        </Box>
        {form.certifications.filter((c) => !PRESET_CERTIFICATIONS.includes(c)).map((c) => (
          <Chip
            key={c}
            label={c}
            onDelete={() => toggleCert(c)}
            size="small"
            sx={{ mt: 1, mr: 0.5 }}
          />
        ))}
      </Paper>

      {/* Section 6: Care Instructions */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>Care Instructions</Typography>
        <Box display="flex" gap={1} mb={2}>
          <TextField
            label="Add instruction"
            size="small"
            value={careInput}
            onChange={(e) => setCareInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCare(); } }}
            sx={{ flex: 1, maxWidth: 400 }}
            placeholder="e.g. Machine wash cold"
          />
          <Button variant="outlined" size="small" onClick={addCare}>
            Add
          </Button>
        </Box>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {form.careInstructions.map((ins, i) => (
            <Chip
              key={i}
              label={ins}
              size="small"
              onDelete={() =>
                set("careInstructions", form.careInstructions.filter((_, idx) => idx !== i))
              }
            />
          ))}
        </Box>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Box display="flex" justifyContent="flex-end" gap={1.5}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !form.name || !form.sku}
          size="medium"
        >
          {loading ? "Saving..." : submitLabel}
        </Button>
      </Box>
    </Box>
  );
}
