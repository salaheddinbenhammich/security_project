import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import api from "@/services/api";
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Activity,
  Search,
  ArrowRight,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  Server,
  AlertTriangle,
  Info,
  X,
  ArrowUpDown,
  ChevronDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatRelativeTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return formatDate(value);
};

// Status configuration
const statusConfig = {
  PENDING: { 
    label: "En attente", 
    color: "bg-amber-500/10 text-amber-700 border-amber-300/50", 
    icon: Clock,
    dotColor: "bg-amber-500",
    gradient: "from-amber-500/20 to-orange-500/20",
    ringColor: "ring-amber-500/20"
  },
  IN_PROGRESS: { 
    label: "En cours", 
    color: "bg-blue-500/10 text-blue-700 border-blue-300/50", 
    icon: Activity,
    dotColor: "bg-blue-500 animate-pulse",
    gradient: "from-blue-500/20 to-cyan-500/20",
    ringColor: "ring-blue-500/20"
  },
  RESOLVED: { 
    label: "Résolu", 
    color: "bg-emerald-500/10 text-emerald-700 border-emerald-300/50", 
    icon: CheckCircle,
    dotColor: "bg-emerald-500",
    gradient: "from-emerald-500/20 to-green-500/20",
    ringColor: "ring-emerald-500/20"
  },
  CLOSED: { 
    label: "Fermé", 
    color: "bg-slate-500/10 text-slate-700 border-slate-300/50", 
    icon: CheckCircle,
    dotColor: "bg-slate-500",
    gradient: "from-slate-500/20 to-gray-500/20",
    ringColor: "ring-slate-500/20"
  },
  CANCELLED: { 
    label: "Annulé", 
    color: "bg-red-500/10 text-red-700 border-red-300/50", 
    icon: XCircle,
    dotColor: "bg-red-500",
    gradient: "from-red-500/20 to-rose-500/20",
    ringColor: "ring-red-500/20"
  }
};

const priorityConfig = {
  CRITICAL: { 
    label: "Critique",
    color: "text-red-700", 
    bg: "bg-red-500/10", 
    border: "border-red-400/50",
    barColor: "bg-gradient-to-r from-red-500 via-red-600 to-orange-500",
    glowColor: "shadow-red-500/50"
  },
  HIGH: { 
    label: "Haute",
    color: "text-orange-700", 
    bg: "bg-orange-500/10", 
    border: "border-orange-400/50",
    barColor: "bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500",
    glowColor: "shadow-orange-500/50"
  },
  MEDIUM: { 
    label: "Moyenne",
    color: "text-blue-700", 
    bg: "bg-blue-500/10", 
    border: "border-blue-400/50",
    barColor: "bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500",
    glowColor: "shadow-blue-500/50"
  },
  LOW: { 
    label: "Faible",
    color: "text-slate-700", 
    bg: "bg-slate-500/10", 
    border: "border-slate-400/50",
    barColor: "bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600",
    glowColor: "shadow-slate-500/50"
  }
};

const priorityStyles = {
  ALL:      { label: "Toutes Priorités", color: "bg-white border-slate-200 text-slate-700", icon: Filter },
  CRITICAL: { label: "Critique", color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
  HIGH:     { label: "Haute",    color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertCircle },
  MEDIUM:   { label: "Moyenne",  color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
  LOW:      { label: "Basse",    color: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock }
};

const statusStyles = {
  ALL:         { label: "Tous les statuts", color: "bg-white border-slate-200 text-slate-700", icon: Filter },
  PENDING:     { label: "En attente", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  IN_PROGRESS: { label: "En cours", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Activity },
  RESOLVED:    { label: "Résolu", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
  CLOSED:      { label: "Fermé", color: "bg-slate-100 text-slate-700 border-slate-200", icon: CheckCircle }
};

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${config.color} font-semibold text-xs backdrop-blur-sm`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
}

function IncidentCard({ incident, index }) {
  const statusConf = statusConfig[incident.status] || statusConfig.PENDING;
  const priorityConf = priorityConfig[incident.priority] || priorityConfig.MEDIUM;
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="group relative overflow-hidden rounded-2xl border border-slate-200/60 hover:border-indigo-300/80 bg-white hover:shadow-2xl transition-all duration-500 h-full animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${priorityConf.barColor} transform origin-left transition-all duration-700 ${isHovered ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`} />
      
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${statusConf.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
      
      <CardContent className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className={`relative w-2.5 h-2.5 rounded-full ${statusConf.dotColor} flex-shrink-0`}>
              {incident.status === 'IN_PROGRESS' && (
                <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping opacity-75" />
              )}
            </div>
            <span className="text-xs font-mono text-slate-500 truncate bg-slate-50 px-2 py-1 rounded-md">
              {incident.ticketNumber || `#${incident.id}`}
            </span>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold flex-shrink-0 ${priorityConf.border} ${priorityConf.bg} ${priorityConf.color} transition-all group-hover:scale-105`}>
            <AlertCircle className="w-3.5 h-3.5" />
            {priorityConf.label}
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 mb-4 line-clamp-2 leading-snug group-hover:text-indigo-700 transition-colors">
          {incident.title}
        </h3>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium">{formatRelativeTime(incident.createdAt)}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {formatDate(incident.createdAt)} • {formatTime(incident.createdAt)}
            </div>
          </div>
          <StatusBadge status={incident.status} />
        </div>
      </CardContent>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  const showPages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  let endPage = Math.min(totalPages, startPage + showPages - 1);
  
  if (endPage - startPage < showPages - 1) {
    startPage = Math.max(1, endPage - showPages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return (
    <div className="flex flex-col items-center gap-6 mt-12">
      {/* Page info */}
      <div className="text-sm text-slate-600 font-medium">
        Page <span className="text-indigo-600 font-bold">{currentPage}</span> sur{" "}
        <span className="text-indigo-600 font-bold">{totalPages}</span>
      </div>
      
      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="group relative flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all duration-300 hover:scale-110 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`relative flex items-center justify-center min-w-[40px] h-10 px-3 rounded-xl border font-semibold text-sm transition-all duration-300 hover:scale-110 ${
                1 === currentPage
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/50 scale-105'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md'
              }`}
            >
              1
              {1 === currentPage && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-xl animate-pulse" />
              )}
            </button>
            {startPage > 2 && (
              <span className="flex items-center justify-center w-8 text-slate-400 font-bold">
                ...
              </span>
            )}
          </>
        )}
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`relative flex items-center justify-center min-w-[40px] h-10 px-3 rounded-xl border font-semibold text-sm transition-all duration-300 hover:scale-110 ${
              page === currentPage
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/50 scale-105'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md'
            }`}
          >
            {page}
            {page === currentPage && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-xl animate-pulse" />
            )}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="flex items-center justify-center w-8 text-slate-400 font-bold">
                ...
              </span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`relative flex items-center justify-center min-w-[40px] h-10 px-3 rounded-xl border font-semibold text-sm transition-all duration-300 hover:scale-110 ${
                totalPages === currentPage
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/50 scale-105'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md'
              }`}
            >
              {totalPages}
              {totalPages === currentPage && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-xl animate-pulse" />
              )}
            </button>
          </>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="group relative flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all duration-300 hover:scale-110 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color, trend }) {
  return (
    <div className="group relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className={`text-3xl font-bold ${color} mb-1 tabular-nums`}>{value}</div>
          <div className="text-sm text-white/80 font-medium flex items-center gap-1.5">
            <Icon className="w-4 h-4" />
            {label}
          </div>
        </div>
        {trend && (
          <div className="px-2 py-1 bg-white/20 rounded-lg text-xs font-semibold text-white">
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PublicIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0, critical: 0 });
  const [showFilters, setShowFilters] = useState(false);
  
  // Refs for dropdown positioning
  const statusButtonRef = useRef(null);
  const priorityButtonRef = useRef(null);
  const statusButtonMobileRef = useRef(null);
  const priorityButtonMobileRef = useRef(null);
  
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const loadPublic = async () => {
      try {
        const response = await api.get("/tickets");
        const data = response.data || [];
        setIncidents(data);
        
        setStats({
          total: data.length,
          active: data.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length,
          resolved: data.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
          critical: data.filter(t => t.priority === 'CRITICAL').length
        });
      } finally {
        setLoading(false);
      }
    };

    loadPublic();
  }, []);

  const filteredIncidents = incidents.filter(incident => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (incident.title || "").toLowerCase().includes(searchLower) ||
      (incident.ticketNumber || "").toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === "ALL" || incident.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || incident.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort the filtered incidents
  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortDesc ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(sortedIncidents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedIncidents = sortedIncidents.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter, sortDesc]);

  const activeFiltersCount = [statusFilter !== "ALL", priorityFilter !== "ALL"].filter(Boolean).length;

  const currentPriorityStyle = priorityStyles[priorityFilter] || priorityStyles.ALL;
  const CurrentPriorityIcon = currentPriorityStyle.icon;

  const currentStatusStyle = statusStyles[statusFilter] || statusStyles.ALL;
  const CurrentStatusIcon = currentStatusStyle.icon;

  // Helper function to get dropdown position
  const getDropdownPosition = (buttonRef) => {
    if (!buttonRef.current) return { top: 0, left: 0 };
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      left: rect.left
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800">
        {/* Animated background patterns */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/50 via-transparent to-transparent" />
        </div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Status indicator */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-semibold mb-8 shadow-lg hover:bg-white/15 transition-all">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              </div>
              Système opérationnel • Mises à jour en temps réel
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-6 tracking-tight">
              Statut des
              <span className="block mt-2 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Incidents IT
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-indigo-100 mb-12 max-w-2xl mx-auto leading-relaxed">
              Transparence totale sur nos opérations. Suivez en temps réel l'état de nos services et la résolution des incidents.
            </p>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <StatCard 
                icon={Activity} 
                value={stats.total} 
                label="Total" 
                color="text-white"
              />
              <StatCard 
                icon={Clock} 
                value={stats.active} 
                label="Actifs" 
                color="text-amber-300"
              />
              <StatCard 
                icon={CheckCircle} 
                value={stats.resolved} 
                label="Résolus" 
                color="text-emerald-300"
              />
              <StatCard 
                icon={AlertTriangle} 
                value={stats.critical} 
                label="Critiques" 
                color="text-red-300"
              />
            </div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-auto" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,80 350,20 600,60 C850,100 1050,40 1200,80 L1200,120 L0,120 Z" fill="white" opacity="0.1" />
            <path d="M0,20 C200,100 400,40 600,80 C800,120 1000,60 1200,100 L1200,120 L0,120 Z" fill="white" opacity="0.1" />
            <path d="M0,40 C250,120 450,60 600,100 C750,140 950,80 1200,120 L1200,120 L0,120 Z" fill="rgb(248, 250, 252)" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 -mt-8 relative z-10">
        {/* Premium Search & Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 mb-8 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search with icon */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <Input
                placeholder="Rechercher par titre, référence, description..."
                className="pl-12 h-12 text-base border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Filter toggle button - mobile */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden h-12 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-indigo-600">{activeFiltersCount}</Badge>
              )}
            </Button>
            
            {/* Desktop filters */}
            <div className="hidden lg:flex gap-3">
              {/* Status Filter - Custom Dropdown */}
              <div className="relative">
                <button 
                  ref={statusButtonRef}
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className={`flex h-12 w-[180px] items-center justify-between rounded-xl border px-4 py-2 text-sm font-medium ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all hover:bg-slate-50 ${currentStatusStyle.color} ${statusFilter === 'ALL' ? 'border-slate-200' : 'border'}`}
                >
                  <div className="flex items-center gap-2">
                    <CurrentStatusIcon className="h-4 w-4" />
                    <span>{currentStatusStyle.label}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>

                {isStatusOpen && createPortal(
                  <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setIsStatusOpen(false)}></div>
                    
                    <div 
                      className="fixed z-[9999] w-[180px] rounded-md border border-slate-200 bg-white shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100"
                      style={{
                        top: `${getDropdownPosition(statusButtonRef).top}px`,
                        left: `${getDropdownPosition(statusButtonRef).left}px`
                      }}
                    >
                      {Object.entries(statusStyles).map(([key, style]) => {
                        const Icon = style.icon;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setStatusFilter(key);
                              setIsStatusOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${statusFilter === key ? 'bg-slate-100 font-medium' : ''}`}
                          >
                            <div className={`p-1 rounded-full border ${key === 'ALL' ? 'bg-slate-100 border-slate-200' : style.color}`}>
                              <Icon className="h-3 w-3" />
                            </div>
                            <span className="text-slate-700">{style.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>,
                  document.body
                )}
              </div>
              
              {/* Priority Filter - Custom Dropdown */}
              <div className="relative">
                <button 
                  ref={priorityButtonRef}
                  onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                  className={`flex h-12 w-[180px] items-center justify-between rounded-xl border px-4 py-2 text-sm font-medium ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all hover:bg-slate-50 ${currentPriorityStyle.color} ${priorityFilter === 'ALL' ? 'border-slate-200' : 'border'}`}
                >
                  <div className="flex items-center gap-2">
                    <CurrentPriorityIcon className="h-4 w-4" />
                    <span>{currentPriorityStyle.label}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>

                {isPriorityOpen && createPortal(
                  <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setIsPriorityOpen(false)}></div>
                    
                    <div 
                      className="fixed z-[9999] w-[180px] rounded-md border border-slate-200 bg-white shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100"
                      style={{
                        top: `${getDropdownPosition(priorityButtonRef).top}px`,
                        left: `${getDropdownPosition(priorityButtonRef).left}px`
                      }}
                    >
                      {Object.entries(priorityStyles).map(([key, style]) => {
                        const Icon = style.icon;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setPriorityFilter(key);
                              setIsPriorityOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${priorityFilter === key ? 'bg-slate-100 font-medium' : ''}`}
                          >
                            <div className={`p-1 rounded-full border ${key === 'ALL' ? 'bg-slate-100 border-slate-200' : style.color}`}>
                              <Icon className="h-3 w-3" />
                            </div>
                            <span className="text-slate-700">{style.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>,
                  document.body
                )}
              </div>

              {/* Sort Button */}
              <Button 
                variant="outline"
                onClick={() => setSortDesc(!sortDesc)}
                className="h-12 w-[160px] justify-between border-slate-200 hover:bg-slate-50 hover:border-indigo-300 transition-all"
              >
                {sortDesc ? "Plus récents" : "Plus anciens"}
                <ArrowUpDown className="w-4 h-4 ml-2 opacity-50" />
              </Button>
            </div>
          </div>
          
          {/* Mobile filters */}
          {showFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t border-slate-200 space-y-3 animate-in slide-in-from-top-2">
              {/* Status Filter Mobile */}
              <div className="relative">
                <button 
                  ref={statusButtonMobileRef}
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className={`flex w-full h-12 items-center justify-between rounded-xl border px-4 py-2 text-sm font-medium ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all ${currentStatusStyle.color} ${statusFilter === 'ALL' ? 'border-slate-200' : 'border'}`}
                >
                  <div className="flex items-center gap-2">
                    <CurrentStatusIcon className="h-4 w-4" />
                    <span>{currentStatusStyle.label}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>

                {isStatusOpen && createPortal(
                  <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setIsStatusOpen(false)}></div>
                    
                    <div 
                      className="fixed z-[9999] rounded-md border border-slate-200 bg-white shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100"
                      style={{
                        top: `${getDropdownPosition(statusButtonMobileRef).top}px`,
                        left: `${getDropdownPosition(statusButtonMobileRef).left}px`,
                        width: statusButtonMobileRef.current ? `${statusButtonMobileRef.current.offsetWidth}px` : '100%'
                      }}
                    >
                      {Object.entries(statusStyles).map(([key, style]) => {
                        const Icon = style.icon;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setStatusFilter(key);
                              setIsStatusOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${statusFilter === key ? 'bg-slate-100 font-medium' : ''}`}
                          >
                            <div className={`p-1 rounded-full border ${key === 'ALL' ? 'bg-slate-100 border-slate-200' : style.color}`}>
                              <Icon className="h-3 w-3" />
                            </div>
                            <span className="text-slate-700">{style.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>,
                  document.body
                )}
              </div>
              
              {/* Priority Filter Mobile */}
              <div className="relative">
                <button 
                  ref={priorityButtonMobileRef}
                  onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                  className={`flex w-full h-12 items-center justify-between rounded-xl border px-4 py-2 text-sm font-medium ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all ${currentPriorityStyle.color} ${priorityFilter === 'ALL' ? 'border-slate-200' : 'border'}`}
                >
                  <div className="flex items-center gap-2">
                    <CurrentPriorityIcon className="h-4 w-4" />
                    <span>{currentPriorityStyle.label}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>

                {isPriorityOpen && createPortal(
                  <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setIsPriorityOpen(false)}></div>
                    
                    <div 
                      className="fixed z-[9999] rounded-md border border-slate-200 bg-white shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100"
                      style={{
                        top: `${getDropdownPosition(priorityButtonMobileRef).top}px`,
                        left: `${getDropdownPosition(priorityButtonMobileRef).left}px`,
                        width: priorityButtonMobileRef.current ? `${priorityButtonMobileRef.current.offsetWidth}px` : '100%'
                      }}
                    >
                      {Object.entries(priorityStyles).map(([key, style]) => {
                        const Icon = style.icon;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setPriorityFilter(key);
                              setIsPriorityOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${priorityFilter === key ? 'bg-slate-100 font-medium' : ''}`}
                          >
                            <div className={`p-1 rounded-full border ${key === 'ALL' ? 'bg-slate-100 border-slate-200' : style.color}`}>
                              <Icon className="h-3 w-3" />
                            </div>
                            <span className="text-slate-700">{style.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>,
                  document.body
                )}
              </div>

              {/* Sort Button Mobile */}
              <Button 
                variant="outline"
                onClick={() => setSortDesc(!sortDesc)}
                className="w-full h-12 justify-between border-slate-200 hover:bg-slate-50"
              >
                {sortDesc ? "Plus récents" : "Plus anciens"}
                <ArrowUpDown className="w-4 h-4 ml-2 opacity-50" />
              </Button>
            </div>
          )}
          
          {/* Results info */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Server className="w-4 h-4 text-indigo-600" />
                <span className="text-indigo-600">{filteredIncidents.length}</span>
                <span>incident(s)</span>
              </div>
            </div>
            
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("ALL");
                  setPriorityFilter("ALL");
                  setSearchTerm("");
                }}
                className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
              >
                <X className="w-4 h-4 mr-1" />
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        {/* Incidents Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
            <p className="mt-6 text-base text-slate-600 font-medium">Chargement des incidents...</p>
            <p className="mt-1 text-sm text-slate-500">Récupération des données en temps réel</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {searchTerm || statusFilter !== "ALL" || priorityFilter !== "ALL" 
                ? "Aucun incident trouvé" 
                : "Aucun incident actif"}
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== "ALL" || priorityFilter !== "ALL"
                ? "Essayez de modifier vos critères de recherche ou vos filtres"
                : "Tous nos systèmes fonctionnent normalement"}
            </p>
            {(searchTerm || statusFilter !== "ALL" || priorityFilter !== "ALL") && (
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter("ALL");
                  setPriorityFilter("ALL");
                  setSearchTerm("");
                }}
                className="hover:bg-indigo-50 hover:border-indigo-300"
              >
                <X className="w-4 h-4 mr-2" />
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedIncidents.map((incident, index) => (
                <IncidentCard key={incident.id} incident={incident} index={index} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}

        {/* Premium CTA Section */}
        <div className="mt-16 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-10 sm:p-16 text-center shadow-2xl">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl mb-6 shadow-xl">
              <Zap className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Besoin d'assistance ?
            </h3>
            <p className="text-lg text-indigo-100 mb-8 max-w-xl mx-auto leading-relaxed">
              Notre équipe IT est à votre disposition. Créez un ticket et suivez sa résolution en temps réel.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl shadow-2xl hover:shadow-white/20 transition-all hover:scale-105 hover:-translate-y-1"
              >
                <Shield className="w-5 h-5" />
                Créer un ticket
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold rounded-xl border-2 border-white/30 transition-all hover:scale-105 hover:-translate-y-1"
              >
                <Sparkles className="w-5 h-5" />
                Créer un compte
              </Link>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-indigo-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Suivi en temps réel</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Support 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Footer */}
      <footer className="border-t border-slate-200 mt-5 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-slate-900">IT Incidents Manager</div>
                <div className="text-sm text-slate-600">Gestion professionnelle des incidents</div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="font-medium">Système opérationnel</span>
              </div>
              <span className="text-slate-300">•</span>
              <span>© 2026 Tous droits réservés</span>
              <span className="text-slate-300">•</span>
              <span>Données en temps réel</span>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                Connexion
              </Link>
              <span className="text-slate-300">•</span>
              <Link to="/register" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}