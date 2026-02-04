import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import SidebarNav from "../layouts/SidebarNav";
import HeaderBar from "../layouts/HeaderBar";
import { 
  LayoutDashboard, 
  Users, 
  Archive,  
  Ticket, 
  PlusCircle, 
  UserCircle 
} from "lucide-react";
import { getToken } from "@/utils/auth";

// Admin menu
const adminNavItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Utilisateurs", icon: Users },
  { to: "/admin/history", label: "Historique", icon: Archive },
  { to: "/admin/profile", label: "Profil", icon: UserCircle },
];

// User menu
const userNavItems = [
  { to: "/user", label: "Mes Tickets", icon: Ticket },
  { to: "/user/create", label: "Nouveau Ticket", icon: PlusCircle },
  { to: "/user/profile", label: "Mon Profil", icon: UserCircle },
];

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [navItems, setNavItems] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);

        if (decoded.role === 'ADMIN') {
          setNavItems(adminNavItems);
        } else {
          setNavItems(userNavItems);
        }
      } catch (e) {
        console.error("Token invalide");
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Dynamic page title
  const getPageTitle = () => {
    const currentItem = navItems.find(item => item.to === location.pathname);
    if (currentItem) return currentItem.label;
    
    if (location.pathname.includes("/ticket/")) return "Détails du Ticket";
    if (location.pathname === "/admin") return "Dashboard Admin";
    if (location.pathname === "/user") return "Mes Tickets";
    
    return "IT Incidents";
  };

  if (!user) return null; 

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/10">
      {/* Sidebar Desktop */}
      <SidebarNav 
        navItems={navItems} 
        variant="desktop" 
        user={user}
      />

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <SidebarNav
          navItems={navItems}
          variant="mobile"
          onClose={() => setSidebarOpen(false)}
          user={user}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 h-screen min-w-0 overflow-hidden">
        <HeaderBar 
          title={getPageTitle()} 
          user={user} 
          onToggleSidebar={() => setSidebarOpen(true)} 
        />

        {/* Scrollable content area */}
        <main className="flex-1 p-4 overflow-y-auto md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}