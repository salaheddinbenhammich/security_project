import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import SidebarNav from "../layouts/SidebarNav";
import HeaderBar from "../layouts/HeaderBar";
import { 
  LayoutDashboard, 
  Users, 
  Archive, 
  PieChart, 
  Ticket, 
  PlusCircle, 
  UserCircle 
} from "lucide-react";
import { getToken } from "@/utils/auth";

// --- 1. CONFIGURATION DES MENUS ---

// Menu pour les ADMINS
const adminNavItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Utilisateurs", icon: Users },
  { to: "/admin/history", label: "Historique", icon: Archive },
  { to: "/admin/stats", label: "Statistiques", icon: PieChart },
];

// Menu pour les USERS
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

  // Titre dynamique
  const getPageTitle = () => {
    // Cherche le label correspondant à l'URL actuelle
    const currentItem = navItems.find(item => item.to === location.pathname);
    if (currentItem) return currentItem.label;
    
    // Titres par défaut si pas dans le menu
    if (location.pathname.includes("/ticket/")) return "Détails du Ticket";
    if (location.pathname === "/admin") return "Dashboard Admin";
    if (location.pathname === "/user") return "Mes Tickets";
    
    return "IT Incidents";
  };

  if (!user) return null; // Évite un flash pendant le chargement

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
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

      {/* Contenu Principal */}
      <div className="flex flex-col flex-1 h-screen min-w-0 overflow-hidden">
        <HeaderBar 
          title={getPageTitle()} 
          user={user} 
          onToggleSidebar={() => setSidebarOpen(true)} 
        />

        {/* Zone de contenu scrollable */}
        <main className="flex-1 p-4 overflow-y-auto md:p-8 bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}