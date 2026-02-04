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


const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

// Vérifie si Admin (stricte)
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== 'ADMIN') return <Navigate to="/user" replace />;
    return children;
  } catch (e) { return <Navigate to="/login" replace />; }
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicIncidents />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<MainLayout />}> 
          
          <Route path="/user" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
          <Route path="/user/ticket/:id" element={<PrivateRoute><UserTicketDetail /></PrivateRoute>} />
          <Route path="/user/create" element={<PrivateRoute><div>Page Création (À faire)</div></PrivateRoute>} />
          <Route path="/user/profile" element={<PrivateRoute><div>Page Profil (À faire)</div></PrivateRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminTicketsBoard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/tickets/:id" element={<AdminRoute><AdminTicketDetails /></AdminRoute>} />
          <Route path="/admin/history" element={<AdminRoute><AdminHistory /></AdminRoute>} />
          <Route path="/admin/stats" element={<AdminRoute><div>Stats (À faire)</div></AdminRoute>} />
          
        </Route>

        <Route path="*" element={<PublicIncidents />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;