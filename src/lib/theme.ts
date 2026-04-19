import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    border: { main: string };
  }
  interface PaletteOptions {
    border?: { main: string };
  }
}

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6366F1", contrastText: "#fff" },
    secondary: { main: "#64748B" },
    success: { main: "#10B981" },
    warning: { main: "#F59E0B" },
    error: { main: "#EF4444" },
    background: { default: "#F8FAFC", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#64748B" },
    border: { main: "#E2E8F0" },
    divider: "#E2E8F0",
  },
  typography: {
    fontFamily: '"Inter", "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontSize: "2rem", fontWeight: 700, color: "#0F172A" },
    h2: { fontSize: "1.5rem", fontWeight: 600, color: "#0F172A" },
    h3: { fontSize: "1.25rem", fontWeight: 600, color: "#0F172A" },
    h4: { fontSize: "1.125rem", fontWeight: 600, color: "#0F172A" },
    h5: { fontSize: "1rem", fontWeight: 600, color: "#0F172A" },
    h6: { fontSize: "0.875rem", fontWeight: 600, color: "#0F172A" },
    body1: { fontSize: "0.875rem", color: "#0F172A" },
    body2: { fontSize: "0.8125rem", color: "#64748B" },
    caption: { fontSize: "0.75rem", color: "#64748B" },
  },
  shape: { borderRadius: 10 },
  shadows: [
    "none",
    "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
    "0 2px 6px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
    "0 4px 12px rgba(0,0,0,0.06)",
    "0 6px 16px rgba(0,0,0,0.08)",
    "0 8px 24px rgba(0,0,0,0.08)",
    "0 12px 32px rgba(0,0,0,0.10)",
    "0 16px 48px rgba(0,0,0,0.10)",
    "0 20px 56px rgba(0,0,0,0.12)",
    "0 24px 64px rgba(0,0,0,0.12)",
    "0 28px 72px rgba(0,0,0,0.14)",
    "0 32px 80px rgba(0,0,0,0.14)",
    "0 36px 88px rgba(0,0,0,0.16)",
    "0 40px 96px rgba(0,0,0,0.16)",
    "0 44px 104px rgba(0,0,0,0.18)",
    "0 48px 112px rgba(0,0,0,0.18)",
    "0 52px 120px rgba(0,0,0,0.20)",
    "0 56px 128px rgba(0,0,0,0.20)",
    "0 60px 136px rgba(0,0,0,0.22)",
    "0 64px 144px rgba(0,0,0,0.22)",
    "0 68px 152px rgba(0,0,0,0.24)",
    "0 72px 160px rgba(0,0,0,0.24)",
    "0 76px 168px rgba(0,0,0,0.26)",
    "0 80px 176px rgba(0,0,0,0.26)",
    "0 84px 184px rgba(0,0,0,0.28)",
  ],
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: 8,
          fontSize: "0.875rem",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: "#F8FAFC",
            color: "#64748B",
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            borderBottom: "1px solid #E2E8F0",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #E2E8F0",
          fontSize: "0.875rem",
          padding: "12px 16px",
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "& fieldset": { borderColor: "#E2E8F0" },
            "&:hover fieldset": { borderColor: "#CBD5E1" },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500, fontSize: "0.75rem" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: "0.875rem" },
      },
    },
    MuiSelect: {
      defaultProps: { size: "small" },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 500, fontSize: "0.875rem" },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { border: "none" },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: 8, marginBottom: 2 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 12 },
      },
    },
  },
});

export default theme;
