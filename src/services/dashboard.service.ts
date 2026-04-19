import apiClient from "@/lib/apiClient";
import type { ApiResponse, DashboardData } from "@/types";

export const dashboardService = {
  overview: async (vendorId?: string): Promise<ApiResponse<DashboardData>> => {
    const { data } = await apiClient.get("/dashboard/overview", {
      params: vendorId ? { vendorId } : undefined,
    });
    return data;
  },
};
