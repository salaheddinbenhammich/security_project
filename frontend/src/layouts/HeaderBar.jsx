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

export default function HeaderBar({ title, icon: Icon, user, onToggleSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userName = user?.sub || "User";
  const initials = userName.substring(0, 2).toUpperCase();
  const roleLabel = user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur';

  const handleProfileClick = () => {
    if (user?.role === "ADMIN") {
      navigate('/admin/profile');
    } else {
      navigate('/user/profile'); 
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm md:px-6">
      
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          className="p-2 transition-all border rounded-lg md:hidden border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95"
          onClick={onToggleSidebar}
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>
        
        {/* Page title with icon */}
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-md">
              <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          )}
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          </div>
        </div>
      </div>

      {/* Right side - User menu */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2.5 pl-0 pr-2 hover:bg-slate-50 focus:ring-0 rounded-xl transition-all"
            >
              {/* User info (hidden on mobile) */}
              <div className="hidden mr-1 text-right sm:block">
                <div className="text-sm font-semibold leading-tight text-slate-900">{userName}</div>
                <div className="text-xs text-slate-500">{roleLabel}</div>
              </div>
              
              {/* Avatar with gradient */}
              <div className="relative flex items-center justify-center text-sm font-bold text-white transition-all bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-md w-10 h-10 ring-2 ring-white hover:shadow-lg hover:scale-105">
                {initials}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl" />
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 border-slate-200 shadow-lg">
            <DropdownMenuLabel className="font-semibold text-slate-900">
              Mon Compte
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            
            <DropdownMenuItem 
              className="cursor-pointer text-slate-700 focus:bg-indigo-50 focus:text-indigo-700 transition-colors" 
              onClick={handleProfileClick}
            >
              <UserCircle className="w-4 h-4 mr-2" />
              Mon Profil
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-slate-100" />
            
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50 transition-colors font-medium" 
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}