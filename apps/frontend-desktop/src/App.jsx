import React, { useState, useEffect } from "react";
import Dashboard from "./Dashboard.jsx";
import DashboardMobile from "./DashboardMobile.jsx";

const MOBILE_BREAKPOINT = 768;

export default function App() {
  const [manualOverride, setManualOverride] = useState(null); // null = auto, "mobile" | "desktop" = forced
  const [isNarrowScreen, setIsNarrowScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsNarrowScreen(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showMobile = manualOverride ? manualOverride === "mobile" : isNarrowScreen;

  const toggleButtonStyle = {
    position: "fixed",
    bottom: 16,
    right: 16,
    zIndex: 999,
    background: "#12151c",
    border: "1px solid #e0a530",
    color: "#e0a530",
    borderRadius: 999,
    padding: "8px 14px",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "Inter, system-ui, sans-serif",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
  };

  return (
    <div>
      {showMobile ? <DashboardMobile /> : <Dashboard />}
      <button
        style={toggleButtonStyle}
        onClick={() => setManualOverride(showMobile ? "desktop" : "mobile")}
      >
        Switch to {showMobile ? "Desktop" : "Mobile"} view
      </button>
    </div>
  );
}
