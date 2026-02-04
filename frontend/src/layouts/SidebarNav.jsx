import React from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Shield } from "lucide-react";

export default function SidebarNav({ navItems, variant, onClose, user }) {
  const location = useLocation();
  const pathname = location.pathname;
  const isMobile = variant === "mobile";

  const containerClass = isMobile
    ? "fixed inset-0 z-40 flex md:hidden"
    : "hidden md:flex md:w-64 md:flex-col bg-white border-r border-slate-200";

  return isMobile ? (
    <div className={containerClass}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Sidebar panel */}
      <aside className="relative z-50 w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-2xl">
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

function SidebarContent({ navItems, pathname, onLinkClick, showClose, user }) {
  const roleLabel = user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur';
  const userName = user?.sub || "Invité";

  return (
    <>
      {/* Header with logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-slate-900">IT Incidents</div>
            <div className="text-[10px] text-slate-500 font-medium">Gestion de tickets</div>
          </div>
        </div>
        {showClose && (
          <button 
            onClick={onLinkClick} 
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 text-sm overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          const isActive = item.to === "/admin" || item.to === "/user"
            ? pathname === item.to
            : pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onLinkClick}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                isActive
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-semibold shadow-sm border border-indigo-100"
                  : "text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-100"
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                isActive 
                  ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md" 
                  : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
              }`}>
                <Icon size={16} strokeWidth={2.5} />
              </div>
              <span className="flex-1">{item.label}</span>
              
              {/* Active indicator dot */}
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info footer */}
      <div className="border-t border-slate-200 p-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="text-sm font-semibold text-slate-900 truncate">{userName}</div>
            <div className="text-xs text-slate-500 truncate">{roleLabel}</div>
          </div>
        </div>
      </div>
    </>
  );
}