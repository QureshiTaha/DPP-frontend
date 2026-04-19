"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { authService } from "@/services/auth.service";
import useAuthStore from "@/store/authStore";
import { useSnackbar } from "notistack";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError("");

    try {
      const res = await authService.login(email, password);
      if (res.success && res.data) {
        const { user, accessToken, refreshToken } = res.data;
        login(user, accessToken, refreshToken);
        enqueueSnackbar(`Welcome back, ${user.firstName}!`, { variant: "success" });
        router.replace("/dashboard");
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Invalid email or password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        background: "#F8FAFC",
      }}
    >
      {/* Left panel */}
      <Box
        sx={{
          width: { xs: 0, md: "50%" },
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#0F172A",
          px: 6,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
            top: -100,
            right: -100,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
            bottom: -50,
            left: -50,
          }}
        />
        <Box position="relative" zIndex={1} textAlign="center">
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 3,
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 4,
            }}
          >
            <QrCodeIcon sx={{ fontSize: 36, color: "#fff" }} />
          </Box>
          <Typography variant="h3" sx={{ color: "#fff", fontWeight: 700, mb: 2, fontSize: "2rem" }}>
            DPP Platform
          </Typography>
          <Typography variant="body1" sx={{ color: "#94A3B8", maxWidth: 380, lineHeight: 1.8 }}>
            Manage Digital Product Passports for your apparel products. Build transparency,
            trust, and sustainability traceability across your supply chain.
          </Typography>
          <Box mt={6} display="flex" flexDirection="column" gap={2} textAlign="left">
            {["Complete supply chain traceability", "QR-powered public passports", "Material composition tracking", "Certification management"].map((f) => (
              <Box key={f} display="flex" alignItems="center" gap={1.5}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#6366F1", flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: "#CBD5E1" }}>{f}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right panel */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: { xs: 2, sm: 6 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Box mb={4}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Sign in
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Enter your credentials to access the platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Email address"
              type="email"
              fullWidth
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || !email || !password}
              sx={{ mt: 1, py: 1.3, fontSize: "0.9rem" }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Sign In"}
            </Button>
          </Box>

          <Card sx={{ mt: 4, backgroundColor: "#F8FAFC" }} elevation={0}>
            <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={1} fontWeight={600}>
                Demo Credentials
              </Typography>
              {[
                { email: "superadmin@dpp.com", role: "Super Admin" },
                { email: "admin@acme.com", role: "Vendor Admin" },
                { email: "user@acme.com", role: "Vendor User" },
              ].map((cred) => (
                <Box
                  key={cred.email}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  py={0.5}
                  sx={{ cursor: "pointer", "&:hover": { opacity: 0.7 } }}
                  onClick={() => { setEmail(cred.email); setPassword("Admin@123"); }}
                >
                  <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#6366F1" }}>
                    {cred.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {cred.role}
                  </Typography>
                </Box>
              ))}
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Password: Admin@123 (click row to autofill)
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
