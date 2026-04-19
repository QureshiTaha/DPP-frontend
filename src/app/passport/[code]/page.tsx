"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Chip,
  Card,
  Divider,
  LinearProgress,
  Stack,
  CircularProgress,
  Avatar,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FactoryIcon from "@mui/icons-material/Factory";
import PublicIcon from "@mui/icons-material/Public";
import LocalLaundryServiceIcon from "@mui/icons-material/LocalLaundryService";
import TimelineIcon from "@mui/icons-material/Timeline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import dayjs from "dayjs";
import { qrService } from "@/services/qr.service";
import type { Product, Material, SupplyChainStep } from "@/types";

function parseArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseObject<T>(val: unknown): T | null {
  if (val && typeof val === "object" && !Array.isArray(val)) return val as T;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return parsed && typeof parsed === "object" ? (parsed as T) : null;
    } catch {
      return null;
    }
  }
  return null;
}

const materialColors = ["#6366F1", "#10B981", "#F59E0B", "#EC4899", "#06B6D4", "#8B5CF6"];

export default function PassportPage() {
  const params = useParams();
  const code = params?.code as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    (async () => {
      setLoading(true);
      try {
        const res = await qrService.scan(code);
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          setError(res.message || "Product not found");
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Unable to verify this passport";
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ backgroundColor: "#F8FAFC" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
        <Container maxWidth="sm" sx={{ py: 10 }}>
          <Card sx={{ p: 5, textAlign: "center" }}>
            <ErrorOutlineIcon sx={{ fontSize: 64, color: "#EF4444", mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Passport Not Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {error || "This QR code is invalid or has been deactivated."}
            </Typography>
          </Card>
        </Container>
      </Box>
    );
  }

  const materials = parseArray<Material>(product.materials);
  const supplyChain = parseArray<SupplyChainStep>(product.supplyChain);
  const certifications = parseArray<string>(product.certifications);
  const careInstructions = parseArray<string>(product.careInstructions);
  const manufacturing = parseObject<{ facility?: string; country?: string; address?: string }>(
    product.manufacturing
  );

  return (
    <Box sx={{ backgroundColor: "#F8FAFC", minHeight: "100vh" }}>
      <Box sx={{ backgroundColor: "#0F172A", color: "white", pt: 5, pb: 8 }}>
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  background: "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                DPP
              </Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Digital Product Passport
              </Typography>
            </Stack>
            <Chip
              icon={<VerifiedIcon sx={{ color: "#10B981 !important" }} />}
              label="Verified"
              sx={{
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "#10B981",
                fontWeight: 700,
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            />
          </Stack>

          <Stack spacing={1.5}>
            {product.brand && (
              <Typography variant="overline" style={{ color: "#E2E8F0", letterSpacing: 1.5, fontSize: 11 }}>
                {product.brand}
              </Typography>
            )}
            <Typography variant="h3" fontWeight={700} sx={{ color: "#E2E8F0", fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
              {product.name}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={`SKU: ${product.sku}`}
                size="small"
                sx={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white", fontFamily: "monospace" }}
              />
              {product.season && (
                <Chip
                  label={product.season}
                  size="small"
                  sx={{ backgroundColor: "rgba(99,102,241,0.25)", color: "#C7D2FE", fontWeight: 600 }}
                />
              )}
              {product.colorway && (
                <Chip
                  label={product.colorway}
                  size="small"
                  sx={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}
                />
              )}
              {product.category && (
                <Chip
                  label={product.category}
                  size="small"
                  sx={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}
                />
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ mt: -5, pb: 6 }}>
        <Stack spacing={3}>
          {product.description && (
            <Card sx={{ p: 3 }}>
              <Typography variant="body1" color="text.primary" lineHeight={1.7}>
                {product.description}
              </Typography>
            </Card>
          )}

          {materials.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2.5}>
                Material Composition
              </Typography>
              <Stack spacing={2.5}>
                {materials.map((m, i) => {
                  const color = materialColors[i % materialColors.length];
                  return (
                    <Box key={i}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color }} />
                          <Typography variant="body2" fontWeight={600}>
                            {m.name}
                          </Typography>
                          {m.origin && (
                            <Typography variant="caption" color="text.secondary">
                              · {m.origin}
                            </Typography>
                          )}
                        </Stack>
                        <Typography variant="body2" fontWeight={700} sx={{ color }}>
                          {m.percentage}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(Number(m.percentage) || 0, 100)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#F1F5F9",
                          "& .MuiLinearProgress-bar": { backgroundColor: color, borderRadius: 4 },
                        }}
                      />
                      {m.certifications && (
                        <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                          Certification: {m.certifications}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </Card>
          )}

          {manufacturing && (manufacturing.facility || manufacturing.country) && (
            <Card sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <FactoryIcon sx={{ color: "primary.main" }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Manufacturing
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                {manufacturing.facility && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Facility
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {manufacturing.facility}
                    </Typography>
                  </Box>
                )}
                {manufacturing.country && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Country of origin
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PublicIcon fontSize="small" sx={{ color: "#64748B" }} />
                      <Typography variant="body2" fontWeight={600}>
                        {manufacturing.country}
                      </Typography>
                    </Stack>
                  </Box>
                )}
                {manufacturing.address && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body2">{manufacturing.address}</Typography>
                  </Box>
                )}
              </Stack>
            </Card>
          )}

          {certifications.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Certifications
              </Typography>
              <Stack spacing={1.25}>
                {certifications.map((c, i) => (
                  <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                    <CheckCircleIcon sx={{ color: "#10B981", fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={500}>
                      {c}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>
          )}

          {careInstructions.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <LocalLaundryServiceIcon sx={{ color: "primary.main" }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Care Instructions
                </Typography>
              </Stack>
              <Stack component="ul" spacing={1} sx={{ pl: 2, m: 0 }}>
                {careInstructions.map((c, i) => (
                  <Typography component="li" key={i} variant="body2" color="text.primary">
                    {c}
                  </Typography>
                ))}
              </Stack>
            </Card>
          )}

          {supplyChain.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                <TimelineIcon sx={{ color: "primary.main" }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Supply Chain Journey
                </Typography>
              </Stack>
              <Box sx={{ position: "relative", pl: 4 }}>
                <Box
                  sx={{
                    position: "absolute",
                    left: 15,
                    top: 12,
                    bottom: 12,
                    width: 2,
                    backgroundColor: "#E2E8F0",
                  }}
                />
                <Stack spacing={3}>
                  {supplyChain.map((s, i) => (
                    <Box key={i} sx={{ position: "relative" }}>
                      <Avatar
                        sx={{
                          position: "absolute",
                          left: -33,
                          top: 0,
                          width: 32,
                          height: 32,
                          backgroundColor: "primary.main",
                          color: "white",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {i + 1}
                      </Avatar>
                      <Typography variant="body2" ml={2} sx={{ fontSize: "0.875rem" }} fontWeight={700} color="text.primary">
                        {s.step}
                      </Typography>
                      {s.facility && (
                        <Typography variant="body2" ml={2} sx={{ fontSize: "0.875rem" }} color="text.primary" mt={0.25}>
                          {s.facility}
                        </Typography>
                      )}
                      <Stack direction="row" ml={2} spacing={1.5} mt={0.5} flexWrap="wrap">
                        {s.country && (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <PublicIcon fontSize="inherit" sx={{ color: "#94A3B8" }} />
                            <Typography variant="caption" color="text.secondary">
                              {s.country}
                            </Typography>
                          </Stack>
                        )}
                        {s.date && (
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(s.date).isValid() ? dayjs(s.date).format("MMM D, YYYY") : s.date}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Card>
          )}

          <Box textAlign="center" py={3}>
            <Divider sx={{ mb: 2.5 }} />
            <Typography variant="caption" color="text.secondary">
              Powered by{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "primary.main" }}>
                <a href="https://ptexsolutions.com" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
                  Ptex Solution
                </a>
              </Box>
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              Last updated {dayjs(product.updatedAt).format("MMM D, YYYY")} · v{product.version}
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
