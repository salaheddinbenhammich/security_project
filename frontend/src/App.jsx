import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import PublicIncidents from "./pages/PublicIncidents";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainLayout from "./layouts/MainLayout";
import UserDashboard from "./pages/UserDashboard";
import UserTicketDetail from "./pages/UserTicketDetail";

import AdminTicketsBoard from "./pages/admin/AdminTicketsBoard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTicketDetails from "./pages/admin/AdminTicketDetails";
import AdminHistory from "./pages/admin/AdminHistory";
import UserProfile from "./pages/UserProfile";
import CreateTicket from "./pages/User/CreateTicket";
import UserTickets from "./pages/User/UserTickets";
import { getToken } from "@/utils/auth";
import { Toaster } from "sonner";

// ────────────────────────────────────────────────
// Route Guards
// ────────────────────────────────────────────────

// 1. No authentication required (public content)
const PublicRoute = ({ children }) => {
  return children;
};

// 2. Must be logged in + ROLE_USER (admins are redirected to /admin)
const UserRoute = ({ children }) => {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== "USER") {
      return <Navigate to="/admin" replace />;
    }
    return children;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
};

// 3. Must be logged in + ROLE_ADMIN (users are redirected to /user)
const AdminRoute = ({ children }) => {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== "ADMIN") {
      return <Navigate to="/user" replace />;
    }
    return children;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        {/* Public routes – no login needed */}
        <Route path="/" element={<PublicRoute><PublicIncidents /></PublicRoute>} />

        {/* Authentication pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes with MainLayout (sidebar + header) */}
        <Route element={<MainLayout />}>
          {/* ─── USER AREA ─── only ROLE_USER allowed ─── */}
          {/* <Route path="/user" element={<UserRoute><UserDashboard /></UserRoute>} /> */}
          <Route path="/user/ticket/:id" element={<UserRoute><UserTicketDetail /></UserRoute>} />
          <Route path="/user/create" element={<UserRoute><CreateTicket /></UserRoute>} />
          <Route path="/user/profile" element={<UserRoute><UserProfile /></UserRoute>} />

          <Route path="/user" element={<UserRoute><UserTickets /></UserRoute>} />
          {/* <Route path="/user/tickets/new" element={<CreateTicket />} /> */}

          {/* ─── ADMIN AREA ─── only ROLE_ADMIN allowed ─── */}
          <Route path="/admin" element={<AdminRoute><AdminTicketsBoard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/tickets/:id" element={<AdminRoute><AdminTicketDetails /></AdminRoute>} />
          <Route path="/admin/history" element={<AdminRoute><AdminHistory /></AdminRoute>} />
          <Route path="/admin/profile" element={<AdminRoute><UserProfile /></AdminRoute>} />
          <Route path="/admin/stats" element={<AdminRoute><div>Stats (À faire)</div></AdminRoute>} />
        </Route>

        {/* Catch-all – redirect unknown paths to public home */}
        <Route path="*" element={<PublicIncidents />} />
      </Routes>
    </BrowserRouter>
    <Toaster richColors position="top-right" />
    </>
  );
}

export default App;