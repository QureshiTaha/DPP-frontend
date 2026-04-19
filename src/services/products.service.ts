import apiClient from "@/lib/apiClient";
import type { ApiResponse, Product, ProductFormData, PaginationMeta } from "@/types";

export interface ProductListResponse {
  products: Product[];
  meta: PaginationMeta;
}

export const productsService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    vendorId?: string;
  }): Promise<ApiResponse<Product[]>> => {
    const { data } = await apiClient.get("/products", { params });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<Product>> => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },

  create: async (payload: ProductFormData): Promise<ApiResponse<Product>> => {
    const { data } = await apiClient.post("/products", payload);
    return data;
  },

  update: async (id: string, payload: Partial<ProductFormData>): Promise<ApiResponse<Product>> => {
    const { data } = await apiClient.put(`/products/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/products/${id}`);
    return data;
  },

  uploadTechpack: async (id: string, file: File): Promise<ApiResponse<{ techpackUrl: string }>> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post(`/products/${id}/techpack`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  importProducts: async (file: File): Promise<ApiResponse<{ count: number }>> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post("/products/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  exportProducts: async (): Promise<void> => {
    const response = await apiClient.get("/products/export/xlsx", {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "products.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
