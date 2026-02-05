import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Calendar, 
  ArrowRight, 
  Filter, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  XCircle,
  Archive,
  ChevronDown,
  Ticket as TicketIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react"; 
import { Input } from "@/components/ui/input";

export default function UserTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FILTRES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 5;

  // --- CONFIGURATION VISUELLE ---
  const statusStyles = {
    ALL:         { label: "Tous Statuts", color: "bg-white text-slate-700 border-slate-200", icon: Filter },
    PENDING:     { label: "À Traiter",    color: "bg-orange-100 text-orange-700 border-orange-200", icon: Clock },
    IN_PROGRESS: { label: "En Cours",     color: "bg-blue-100 text-blue-700 border-blue-200", icon: PlayCircle },
    RESOLVED:    { label: "Résolu",       color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
    CLOSED:      { label: "Fermé",        color: "bg-gray-100 text-gray-800 border-gray-300", icon: XCircle },
    CANCELLED:   { label: "Archivé",      color: "bg-slate-100 text-slate-600 border-slate-200", icon: Archive },
  };

  const priorityStyles = {
    ALL:      { label: "Toutes Priorités", color: "bg-white text-slate-700 border-slate-200", icon: Filter },
    CRITICAL: { label: "Critique",         color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
    HIGH:     { label: "Haute",            color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertCircle },
    MEDIUM:   { label: "Moyenne",          color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
    LOW:      { label: "Basse",            color: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock }
  };

  const currentStatusStyle = statusStyles[statusFilter] || statusStyles.ALL;
  const StatusIcon = currentStatusStyle.icon;

  const currentPriorityStyle = priorityStyles[priorityFilter] || priorityStyles.ALL;
  const PriorityIcon = currentPriorityStyle.icon;

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get("/tickets/my");
      setTickets(response.data || []);
    } catch (err) {
      console.error("Erreur chargement tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // --- LOGIQUE DE FILTRAGE ---
  const filteredTickets = tickets.filter(ticket => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (ticket.title || "").toLowerCase().includes(searchLower) ||
      (ticket.ticketNumber || "").toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || ticket.priority === priorityFilter;

    let matchesDate = true;
    if (dateFilter) {
      const ticketDate = new Date(ticket.createdAt).toISOString().split('T')[0];
      matchesDate = ticketDate === dateFilter;
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesDate;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const totalPages = Math.ceil(sortedTickets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTickets = sortedTickets.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter, dateFilter]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setDateFilter("");
  };

  const activeFiltersCount = [
    searchTerm !== "",
    statusFilter !== "ALL",
    priorityFilter !== "ALL",
    dateFilter !== ""
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <TicketIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600 animate-pulse" />
        </div>
        <p className="mt-4 text-slate-600 font-medium">Chargement de vos tickets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* STANDARDIZED FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Search with icon */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <Input
              placeholder="Rechercher par titre, référence..."
              className="pl-12 h-12 text-base border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Desktop filters */}
          <div className="flex flex-wrap gap-3">
            
            {/* Status Filter */}
            <div className="relative">
              <button 
                onClick={() => setOpenDropdown(openDropdown === 'STATUS' ? null : 'STATUS')}
                className={`flex h-12 w-[180px] items-center justify-between rounded-xl border px-4 py-2 text-sm font-medium ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all hover:bg-slate-50 ${currentStatusStyle.color}`}
              >
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-4 w-4" />
                  <span>{currentStatusStyle.label}</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>

              {openDropdown === 'STATUS' && (
                <>
                  <div className="fixed inset-0 z-[9998]" onClick={() => setOpenDropdown(null)}></div>
                  <div className="absolute top-full mt-2 left-0 w-[180px] z-[9999] rounded-md border border-slate-200 bg-white shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                    {Object.entries(statusStyles).map(([key, style]) => {
                      const Icon = style.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setStatusFilter(key);
                            setOpenDropdown(null);
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
                </>
              )}
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <button 
                onClick={() => setOpenDropdown(openDropdown === 'PRIORITY' ? null : 'PRIORITY')}
                className={`flex h-12 w-[180px] items-center justify-between rounded-xl border px-4 py-2 text-sm font-medium ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all hover:bg-slate-50 ${currentPriorityStyle.color}`}
              >
                <div className="flex items-center gap-2">
                  <PriorityIcon className="h-4 w-4" />
                  <span>{currentPriorityStyle.label}</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>

              {openDropdown === 'PRIORITY' && (
                <>
                  <div className="fixed inset-0 z-[9998]" onClick={() => setOpenDropdown(null)}></div>
                  <div className="absolute top-full mt-2 left-0 w-[180px] z-[9999] rounded-md border border-slate-200 bg-white shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                    {Object.entries(priorityStyles).map(([key, style]) => {
                      const Icon = style.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setPriorityFilter(key);
                            setOpenDropdown(null);
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
                </>
              )}
            </div>

            {/* Date Filter */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Calendar className="w-4 h-4" />
              </div>
              <input 
                type="date" 
                className="flex h-12 w-full px-4 pl-11 text-sm bg-white border border-slate-200 rounded-xl ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Results info */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <TicketIcon className="w-4 h-4 text-indigo-600" />
              <span className="text-indigo-600">{filteredTickets.length}</span>
              <span>ticket(s)</span>
            </div>
          </div>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* LISTE DES TICKETS */}
      <Card className="border-slate-200 shadow-lg">
        <CardContent className="p-0">
          {paginatedTickets.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-900 font-semibold text-lg mb-1">Aucun ticket trouvé</p>
              <p className="text-slate-500 text-sm mb-6">
                {activeFiltersCount > 0 
                  ? "Essayez de modifier vos filtres ou créez une nouvelle demande."
                  : "Vous n'avez pas encore de tickets. Créez votre première demande."}
              </p>
              <Button 
                onClick={() => navigate("/user/create")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un ticket
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paginatedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 hover:bg-slate-50/50 transition-all duration-200 group cursor-pointer border-l-4 border-l-transparent hover:border-l-indigo-500"
                  onClick={() => navigate(`/user/ticket/${ticket.id}`)}
                >
                  <div className="flex-1 min-w-0 pr-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded">
                        {ticket.ticketNumber || "REF-..."}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`${statusStyles[ticket.status]?.color || 'bg-slate-100'} border text-xs font-semibold`}
                      >
                        {statusStyles[ticket.status]?.label || ticket.status}
                      </Badge>
                    </div>
                    
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors leading-snug">
                      {ticket.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${
                          ticket.priority === 'CRITICAL' ? 'bg-red-500' :
                          ticket.priority === 'HIGH' ? 'bg-orange-500' :
                          ticket.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-400'
                        }`} />
                        Priorité {ticket.priority}
                      </span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                        {ticket.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex items-center">
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-6 mt-8">
          {/* Page info */}
          <div className="text-sm text-slate-600 font-medium">
            Page <span className="text-indigo-600 font-bold">{currentPage}</span> sur{" "}
            <span className="text-indigo-600 font-bold">{totalPages}</span>
          </div>
          
          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="group relative flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all duration-300 hover:scale-110 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
            </button>
            
            {(() => {
              const pages = [];
              const showPages = 5;
              
              let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
              let endPage = Math.min(totalPages, startPage + showPages - 1);
              
              if (endPage - startPage < showPages - 1) {
                startPage = Math.max(1, endPage - showPages + 1);
              }
              
              // First page + ellipsis
              if (startPage > 1) {
                pages.push(
                  <button
                    key={1}
                    onClick={() => setCurrentPage(1)}
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
                );
                if (startPage > 2) {
                  pages.push(
                    <span key="ellipsis1" className="flex items-center justify-center w-8 text-slate-400 font-bold">
                      ...
                    </span>
                  );
                }
              }
              
              // Page buttons
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`relative flex items-center justify-center min-w-[40px] h-10 px-3 rounded-xl border font-semibold text-sm transition-all duration-300 hover:scale-110 ${
                      i === currentPage
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/50 scale-105'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md'
                    }`}
                  >
                    {i}
                    {i === currentPage && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-xl animate-pulse" />
                    )}
                  </button>
                );
              }
              
              // Ellipsis + last page
              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pages.push(
                    <span key="ellipsis2" className="flex items-center justify-center w-8 text-slate-400 font-bold">
                      ...
                    </span>
                  );
                }
                pages.push(
                  <button
                    key={totalPages}
                    onClick={() => setCurrentPage(totalPages)}
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
                );
              }
              
              return pages;
            })()}
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="group relative flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all duration-300 hover:scale-110 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}