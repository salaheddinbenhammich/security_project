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
import { logout } from "@/utils/auth";

export default function HeaderBar({ title, user, onToggleSidebar }) {
  const navigate = useNavigate();

  // Fonction de déconnexion
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Calcul des initiales (ex: "Jean Dupont" -> "JD")
  const userName = user?.sub || "User";
  const initials = userName.substring(0, 2).toUpperCase();
  const roleLabel = user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b shadow-sm md:px-8 border-zinc-200">
      
      <div className="flex items-center gap-4">
        <button
          className="p-2 transition border rounded-md md:hidden border-zinc-200 text-zinc-600 hover:bg-zinc-100"
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
              <div className="hidden mr-2 text-right sm:block">
                <div className="text-sm font-medium leading-tight text-zinc-900">{userName}</div>
                <div className="text-xs text-zinc-500">{roleLabel}</div>
              </div>
              
              {/* Avatar rond */}
              <div className="flex items-center justify-center text-sm font-semibold text-white transition bg-blue-600 rounded-full shadow-sm w-9 h-9 ring-2 ring-white hover:bg-blue-700">
                {initials}
              </div>
            </Button>
          </DropdownMenuTrigger>

          {/* Contenu du menu déroulant */}
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/user/profile')}>
              <UserCircle className="w-4 h-4 mr-2 text-zinc-500" />
              Mon Profil
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}