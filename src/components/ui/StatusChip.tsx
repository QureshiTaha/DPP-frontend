import { Chip } from "@mui/material";
import type { ProductStatus } from "@/types";

interface StatusChipProps {
  status: ProductStatus;
  size?: "small" | "medium";
}

const config: Record<ProductStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "#F59E0B", bg: "#FEF3C7" },
  active: { label: "Active", color: "#10B981", bg: "#D1FAE5" },
  archived: { label: "Archived", color: "#64748B", bg: "#F1F5F9" },
};

export default function StatusChip({ status, size = "small" }: StatusChipProps) {
  const { label, color, bg } = config[status] ?? config.draft;
  return (
    <Chip
      label={label}
      size={size}
      sx={{
        backgroundColor: bg,
        color,
        fontWeight: 600,
        fontSize: "0.72rem",
        borderRadius: 1.5,
        height: size === "small" ? 22 : 26,
      }}
    />
  );
}
