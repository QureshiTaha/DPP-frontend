export type UserRole = "super_admin" | "vendor_admin" | "vendor_user";
export type ProductStatus = "draft" | "active" | "archived";
export type VendorPlan = "starter" | "professional" | "enterprise";

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  logo?: string;
  plan: VendorPlan;
  isActive: boolean;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  vendorId: string | null;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  name: string;
  percentage: number;
  origin: string;
  certifications: string;
}

export interface SupplyChainStep {
  step: string;
  facility: string;
  country: string;
  date: string;
}

export interface ManufacturingInfo {
  facility: string;
  country: string;
  address: string;
}

export interface Product {
  id: string;
  vendorId: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  season?: string;
  colorway?: string;
  status: ProductStatus;
  materials: Material[];
  manufacturing: ManufacturingInfo;
  sustainability: Record<string, unknown>;
  careInstructions: string[];
  endOfLife: Record<string, unknown>;
  supplyChain: SupplyChainStep[];
  certifications: string[];
  images: string[];
  techpackUrl?: string;
  version: number;
  publishedAt?: string;
  qrCodes?: QRCode[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  season?: string;
  colorway?: string;
  status: ProductStatus;
  materials: Material[];
  manufacturing: ManufacturingInfo;
  supplyChain: SupplyChainStep[];
  certifications: string[];
  careInstructions: string[];
}

export interface QRCode {
  id: string;
  productId: string;
  vendorId: string;
  code: string;
  url: string;
  imageDataUrl: string;
  scanCount: number;
  lastScannedAt?: string;
  isActive: boolean;
  product?: Pick<Product, "id" | "name" | "sku">;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  vendorId?: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  ipAddress?: string;
  createdAt: string;
  user?: Pick<User, "firstName" | "lastName" | "email">;
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  totalQRCodes: number;
  totalScans: number;
  totalUsers: number;
}

export interface ChartDataPoint {
  month: string;
  count: number | string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: ActivityLog[];
  charts: {
    productTrend: ChartDataPoint[];
    scanTrend: ChartDataPoint[];
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  error: { message: string; stack?: string } | null;
  meta: PaginationMeta | null;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}
