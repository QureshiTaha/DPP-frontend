import apiClient from "@/lib/apiClient";
import type { ApiResponse, AuthTokens, User } from "@/types";

export const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<AuthTokens>> => {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data;
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    const { data } = await apiClient.post("/auth/refresh", { refreshToken });
    return data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.post("/auth/logout");
    return data;
  },

  me: async (): Promise<ApiResponse<User>> => {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return data;
  },
};
