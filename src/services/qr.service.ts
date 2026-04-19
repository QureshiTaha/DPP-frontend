import apiClient from "@/lib/apiClient";
import type { ApiResponse, QRCode, Product } from "@/types";

export const qrService = {
  scan: async (code: string): Promise<ApiResponse<Product>> => {
    const { data } = await apiClient.get(`/qr/scan/${code}`);
    return data;
  },

  list: async (params?: {
    productId?: string;
    page?: number;
    limit?: number;
    vendorId?: string;
  }): Promise<ApiResponse<QRCode[]>> => {
    const { data } = await apiClient.get("/qr", { params });
    return data;
  },

  generate: async (productId: string): Promise<ApiResponse<QRCode>> => {
    const { data } = await apiClient.post("/qr/generate", { productId });
    return data;
  },

  deactivate: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/qr/${id}`);
    return data;
  },
};
