"use client";

import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { useSnackbar } from "notistack";
import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import ProductForm from "@/components/modules/products/ProductForm";
import { productsService } from "@/services/products.service";
import type { ProductFormData } from "@/types";

export default function NewProductPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      const res = await productsService.create(data);
      if (res.success && res.data) {
        enqueueSnackbar("Product created successfully", { variant: "success" });
        router.push(`/dashboard/products/${res.data.id}`);
      }
    } catch {
      enqueueSnackbar("Failed to create product", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={900}>
      <PageHeader title="New Product" subtitle="Create a new Digital Product Passport" />
      <ProductForm onSubmit={handleSubmit} loading={loading} submitLabel="Create Product" />
    </Box>
  );
}
