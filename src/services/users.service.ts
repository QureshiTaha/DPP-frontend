import apiClient from "@/lib/apiClient";
import type { ApiResponse, User, UserRole } from "@/types";

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  vendorId?: string;
}

export const usersService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    vendorId?: string;
  }): Promise<ApiResponse<User[]>> => {
    const { data } = await apiClient.get("/users", { params });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },

  create: async (payload: CreateUserPayload): Promise<ApiResponse<User>> => {
    const { data } = await apiClient.post("/users", payload);
    return data;
  },

  update: async (
    id: string,
    payload: Partial<Pick<User, "firstName" | "lastName" | "role">>
  ): Promise<ApiResponse<User>> => {
    const { data } = await apiClient.put(`/users/${id}`, payload);
    return data;
  },

  toggleStatus: async (id: string): Promise<ApiResponse<User>> => {
    const { data } = await apiClient.patch(`/users/${id}/toggle-status`);
    return data;
  },
};
