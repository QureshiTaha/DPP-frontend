"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Button, Skeleton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSnackbar } from "notistack";
import PageHeader from "@/components/ui/PageHeader";
import ProductForm from "@/components/modules/products/ProductForm";
import { productsService } from "@/services/products.service";
import type { Product, ProductFormData } from "@/types";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    productsService.getById(id).then((res) => {
      if (res.data) setProduct(res.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: ProductFormData) => {
    setSaving(true);
    try {
      const res = await productsService.update(id, data);
      if (res.success) {
        enqueueSnackbar("Product updated", { variant: "success" });
        router.push(`/dashboard/products/${id}`);
      }
    } catch {
      enqueueSnackbar("Failed to update product", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton variant="rectangular" height={400} />;
  if (!product) return <Box>Product not found</Box>;

  return (
    <Box maxWidth={900}>
      <Box mb={2}>
        <Button startIcon={<ArrowBackIcon />} size="small" variant="text" sx={{ color: "text.secondary" }}
          onClick={() => router.push(`/dashboard/products/${id}`)}>
          Back to Product
        </Button>
      </Box>
      <PageHeader title={`Edit: ${product.name}`} subtitle={`SKU: ${product.sku} · Version ${product.version}`} />
      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel="Update Product"
      />
    </Box>
  );
}
