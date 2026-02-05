import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import PublicIncidents from "./pages/PublicIncidents";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ChangeExpiredPassword from "./pages/auth/ChangeExpiredPassword";
import MainLayout from "./layouts/MainLayout";
import UserDashboard from "./pages/User/UserDashboard";
import UserTicketDetails from "./pages/User/UserTicketDetails";
import AdminTicketsBoard from "./pages/admin/AdminTicketsBoard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTicketDetails from "./pages/admin/AdminTicketDetails";
import AdminHistory from "./pages/admin/AdminHistory";
import UserProfile from "./pages/common/UserProfile";
import CreateTicket from "./pages/User/CreateTicket";
import UserTickets from "./pages/User/UserTickets";
import UserDetails from "./pages/admin/UserDetails";

import { getToken, isAuthenticated, isSessionInactive, clearSession, updateActivity } from "@/utils/auth";
import { Toaster } from "sonner";

/* =========================================================
   SESSION MONITOR
========================================================= */
function SessionMonitor() {
  const navigate = useNavigate();
  const location = useLocation();

  // check inactivity every minute
  useEffect(() => {
    const interval = setInterval(() => {
      // ✅ Skip inactivity check on password change page
      if (location.pathname === '/change-expired-password') {
        return;
      }
      
      if (isAuthenticated() && isSessionInactive()) {
        clearSession();
        navigate("/login", { replace: true });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []); // ✅ FIXED: Empty dependency array

  // update activity on navigation
  useEffect(() => {
    // ✅ Skip activity update on password change page
    if (location.pathname === '/change-expired-password') {
      return;
    }
    
    if (isAuthenticated()) updateActivity();
  }, [location.pathname]);

  return null;
}

/* =========================================================
   ROUTE GUARDS
========================================================= */

const PublicRoute = ({ children }) => children;

const UserRoute = ({ children }) => {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== "USER") {
      return <Navigate to="/admin" replace />;
    }
    return children;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

const AdminRoute = ({ children }) => {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== "ADMIN") {
      return <Navigate to="/user" replace />;
    }
    return children;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

/* =========================================================
   APP ROUTES WRAPPER (needed because SessionMonitor uses hooks)
========================================================= */

function AppRoutes() {
  return (
    <>
      <SessionMonitor />

      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}
        <Route path="/" element={<PublicRoute><PublicIncidents /></PublicRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* ========== PASSWORD EXPIRATION ROUTE ========== */}
        {/* 
          This route is public (no authentication required) because users 
          with expired passwords cannot login. They need to change their 
          password first before they can authenticate.
        */}
        <Route path="/change-expired-password" element={<ChangeExpiredPassword />} />

        {/* ========== AUTHENTICATED ROUTES (WITH LAYOUT) ========== */}
        <Route element={<MainLayout />}>

          {/* USER ROUTES */}
          <Route path="/user" element={<UserRoute><UserTickets /></UserRoute>} />
          <Route path="/user/ticket/:id" element={<UserRoute><UserTicketDetails /></UserRoute>} />
          <Route path="/user/create" element={<UserRoute><CreateTicket /></UserRoute>} />
          <Route path="/user/profile" element={<UserRoute><UserProfile /></UserRoute>} />

          {/* ADMIN ROUTES */}
          <Route path="/admin" element={<AdminRoute><AdminTicketsBoard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/users/:userId" element={<AdminRoute><UserDetails /></AdminRoute>} />
          <Route path="/admin/tickets/:id" element={<AdminRoute><AdminTicketDetails /></AdminRoute>} />
          <Route path="/admin/history" element={<AdminRoute><AdminHistory /></AdminRoute>} />
          <Route path="/admin/profile" element={<AdminRoute><UserProfile /></AdminRoute>} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<PublicIncidents />} />
      </Routes>
    </>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  return (
    <>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>

      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;