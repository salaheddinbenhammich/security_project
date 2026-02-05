import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import PublicIncidents from "./pages/PublicIncidents";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainLayout from "./layouts/MainLayout";
import UserDashboard from "./pages/UserDashboard";
import UserTicketDetails from "./pages/User/UserTicketDetails";
import AdminTicketsBoard from "./pages/admin/AdminTicketsBoard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTicketDetails from "./pages/admin/AdminTicketDetails";
import AdminHistory from "./pages/admin/AdminHistory";
import UserProfile from "./pages/UserProfile";
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
      if (isAuthenticated() && isSessionInactive()) {
        clearSession();
        navigate("/login", { replace: true });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [navigate]);

  // update activity on navigation
  useEffect(() => {
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
        {/* Public */}
        <Route path="/" element={<PublicRoute><PublicIncidents /></PublicRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Layout */}
        <Route element={<MainLayout />}>

          {/* USER */}
          <Route path="/user" element={<UserRoute><UserTickets /></UserRoute>} />
          <Route path="/user/ticket/:id" element={<UserRoute><UserTicketDetails /></UserRoute>} />
          <Route path="/user/create" element={<UserRoute><CreateTicket /></UserRoute>} />
          <Route path="/user/profile" element={<UserRoute><UserProfile /></UserRoute>} />

          {/* ADMIN */}
          <Route path="/admin" element={<AdminRoute><AdminTicketsBoard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/users/:userId" element={<AdminRoute><UserDetails /></AdminRoute>} />
          <Route path="/admin/tickets/:id" element={<AdminRoute><AdminTicketDetails /></AdminRoute>} />
          <Route path="/admin/history" element={<AdminRoute><AdminHistory /></AdminRoute>} />
          <Route path="/admin/profile" element={<AdminRoute><UserProfile /></AdminRoute>} />
        </Route>

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
