import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HeaderBar({ title, user, onToggleSidebar }) {
  const navigate = useNavigate();

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Calcul des initiales (ex: "Jean Dupont" -> "JD")
  const userName = user?.sub || "User";
  const initials = userName.substring(0, 2).toUpperCase();
  const roleLabel = user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur';

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-zinc-200 bg-white sticky top-0 z-30 shadow-sm">
      
      <div className="flex items-center gap-4">
        <button
          className="md:hidden p-2 rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition"
          onClick={onToggleSidebar}
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>
        
        <div>
            <h1 className="text-lg font-semibold text-zinc-800">{title}</h1>
        </div>
      </div>

      {/* --- DROITE : Menu Profil --- */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 pl-0 hover:bg-transparent focus:ring-0">
              {/* Infos texte (cachées sur mobile) */}
              <div className="hidden sm:block text-right mr-2">
                <div className="font-medium text-sm text-zinc-900 leading-tight">{userName}</div>
                <div className="text-xs text-zinc-500">{roleLabel}</div>
              </div>
              
              {/* Avatar rond */}
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold ring-2 ring-white shadow-sm hover:bg-blue-700 transition">
                {initials}
              </div>
            </Button>
          </DropdownMenuTrigger>

          {/* Contenu du menu déroulant */}
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/user/profile')}>
              <UserCircle className="mr-2 h-4 w-4 text-zinc-500" />
              Mon Profil
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}