"use client";

import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Header from "./Header";

const SIDEBAR_WIDTH = 240;

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // ml: `${SIDEBAR_WIDTH}px`,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Header />
        <Box
          sx={{
            flex: 1,
            mt: "56px",
            p: 3,
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
