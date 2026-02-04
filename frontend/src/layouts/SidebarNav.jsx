import React from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";

export default function SidebarNav({ navItems, variant, onClose, user }) {
  const location = useLocation();
  const pathname = location.pathname;
  const isMobile = variant === "mobile";

  const containerClass = isMobile
    ? "fixed inset-0 z-40 flex md:hidden"
    : "hidden md:flex md:w-64 md:flex-col bg-white border-r border-zinc-200";

  return isMobile ? (
    <div className={containerClass}>
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      
      {/* Le menu lui-même */}
      <aside className="relative z-50 w-64 bg-white border-r border-zinc-200 flex flex-col h-full">
        <SidebarContent 
          navItems={navItems} 
          pathname={pathname} 
          onLinkClick={onClose} 
          showClose 
          user={user}
        />
      </aside>
    </div>
  ) : (
    <aside className={containerClass}>
      <SidebarContent navItems={navItems} pathname={pathname} user={user} />
    </aside>
  );
}

// Sous-composant pour le contenu interne (évite de dupliquer le code)
function SidebarContent({ navItems, pathname, onLinkClick, showClose, user }) {
  // Récupération sécurisée du rôle ou du nom
  const roleLabel = user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur';
  const userName = user?.sub || "Invité";

  return (
    <>
      {/* --- EN-TÊTE DU MENU (LOGO) --- */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200">
        <div>
          <div className="text-lg font-bold tracking-tight text-zinc-900">IT Incidents</div>
          <div className="text-xs text-zinc-500">Gestion de tickets</div>
        </div>
        {showClose && (
          <button onClick={onLinkClick} className="text-zinc-500 hover:text-zinc-800">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* --- LIENS DE NAVIGATION --- */}
      <nav className="flex-1 px-3 py-4 space-y-1 text-sm overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          // Vérification si le lien est actif
          // Si on est sur "/admin", on veut que seul "/admin" soit actif, pas "/admin/users"
          // Sinon, on vérifie si l'URL commence par le lien (ex: /admin/users/create active /admin/users)
          const isActive = item.to === "/admin" || item.to === "/user"
            ? pathname === item.to
            : pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onLinkClick}
              className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600"
                  : "text-zinc-700 hover:bg-zinc-100 border-l-4 border-transparent"
              }`}
            >
              <Icon size={18} strokeWidth={2} className={isActive ? "text-blue-700" : "text-zinc-500"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* --- PIED DU MENU (INFO USER) --- */}
      <div className="border-t border-zinc-200 px-4 py-4 bg-zinc-50">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
                <div className="text-sm font-medium text-zinc-900 truncate">{userName}</div>
                <div className="text-xs text-zinc-500 truncate">{roleLabel}</div>
            </div>
        </div>
      </div>
    </>
  );
}