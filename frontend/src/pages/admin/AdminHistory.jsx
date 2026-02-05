import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  PlayCircle,
  XCircle,
  ArrowUpDown,
  ChevronDown,
  Archive,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminHistory() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FILTRES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortDesc, setSortDesc] = useState(true);
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

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error("Erreur chargement historique:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  // --- LOGIQUE DE FILTRAGE ---
  const filteredTickets = tickets.filter(ticket => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (ticket.title || "").toLowerCase().includes(searchLower) ||
      (ticket.ticketNumber || "").toLowerCase().includes(searchLower) ||
      (ticket.createdBy?.username || "").toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortDesc ? dateB - dateA : dateA - dateB;
  });

  // Pagination
  const totalPages = Math.ceil(sortedTickets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTickets = sortedTickets.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter, sortDesc]);

  // Export to CSV function
  const handleExportCSV = () => {
    try {
      // CSV headers
      const headers = ['Référence', 'Titre', 'Catégorie', 'Priorité', 'Statut', 'Date de création', 'Créé par'];
      
      // CSV rows
      const rows = sortedTickets.map(ticket => [
        ticket.ticketNumber || '',
        ticket.title || '',
        ticket.category || '',
        ticket.priority || '',
        ticket.status || '',
        new Date(ticket.createdAt).toLocaleDateString('fr-FR'),
        ticket.createdBy?.username || 'Inconnu'
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `historique_tickets_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export du fichier CSV');
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
  };

  const activeFiltersCount = [
    searchTerm !== "",
    statusFilter !== "ALL",
    priorityFilter !== "ALL"
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <Archive className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600 animate-pulse" />
        </div>
        <p className="mt-4 text-slate-600 font-medium">Chargement de l'historique...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* STANDARDIZED FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Search with icon */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <Input
              placeholder="Rechercher par référence, titre, utilisateur..."
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
        
        {/* Results info */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Archive className="w-4 h-4 text-indigo-600" />
              <span className="text-indigo-600">{filteredTickets.length}</span>
              <span>ticket(s)</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
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
            
            {/* Export Button */}
            <Button 
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="border-slate-200 hover:bg-slate-50 hover:border-indigo-300 transition-all"
            >
              <Download className="w-4 h-4 mr-2" /> 
              Exporter CSV
            </Button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <Card className="border-slate-200 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Référence</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Sujet</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Priorité</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Statut</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTickets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full">
                          <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-medium">Aucun ticket trouvé</p>
                        {activeFiltersCount > 0 && (
                          <Button variant="outline" size="sm" onClick={resetFilters}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Réinitialiser les filtres
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded">
                          {ticket.ticketNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[300px]">
                          <div className="font-semibold text-slate-900 truncate">{ticket.title}</div>
                          <div className="text-xs text-slate-400 truncate">{ticket.category}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant="outline" 
                          className={`${priorityStyles[ticket.priority]?.color || ''} border font-semibold`}
                        >
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant="outline" 
                          className={`${statusStyles[ticket.status]?.color || ''} border font-semibold`}
                        >
                          {statusStyles[ticket.status]?.label || ticket.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                          className="h-9 w-9 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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