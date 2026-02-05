import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { jwtDecode } from "jwt-decode";
import { 
  Search, 
  Filter, 
  Archive, 
  PlayCircle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User,
  Calendar,
  ArrowUpDown,
  XCircle,
  ChevronDown,
  Ticket as TicketIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ConfirmArchiveDialog from "@/components/ticket/ConfirmArchiveDialog";
import { toast } from "sonner";

export default function AdminTicketsBoard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState("Admin");
  
  // --- ÉTATS DES FILTRES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  
  // États actions
  const [resolutionText, setResolutionText] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  
  // États pour annulation
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [ticketToArchive, setTicketToArchive] = useState(null);

  // États pour pagination
  const [pendingPage, setPendingPage] = useState(1);
  const [progressPage, setProgressPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const priorityStyles = {
    ALL:      { label: "Toutes Priorités", color: "bg-white border-slate-200 text-slate-700", icon: Filter },
    CRITICAL: { label: "Critique", color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
    HIGH:     { label: "Haute",    color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertCircle },
    MEDIUM:   { label: "Moyenne",  color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
    LOW:      { label: "Basse",    color: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock }
  };

  const currentPriorityStyle = priorityStyles[filterPriority] || priorityStyles.ALL;
  const CurrentIcon = currentPriorityStyle.icon;

  // 1. Chargement
  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets/admin');
      setTickets(res.data);
      
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded.sub || "Admin");
      }
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  // --- LOGIQUE DE FILTRAGE ---
  const filteredTickets = tickets.filter(ticket => {
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = (ticket.title || "").toLowerCase().includes(searchLower);
    const numberMatch = (ticket.ticketNumber || "").toLowerCase().includes(searchLower);
    const userMatch = (ticket.createdBy?.username || ticket.authorUsername || "").toLowerCase().includes(searchLower);
    
    const matchesSearch = titleMatch || numberMatch || userMatch;
    
    let matchesDate = true;
    if (filterDate) {
      const ticketDate = new Date(ticket.createdAt).toISOString().split('T')[0];
      matchesDate = ticketDate === filterDate;
    }
    
    let matchesPriority = true;
    if (filterPriority !== "ALL") {
      matchesPriority = ticket.priority === filterPriority;
    }
    
    return matchesSearch && matchesDate && matchesPriority;
  });
  
  // --- LOGIQUE DE TRI ---
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortDesc ? dateB - dateA : dateA - dateB;
  });

  // --- SÉPARATION PAR COLONNES ---
  const pendingTickets = sortedTickets.filter(t => t.status === 'PENDING');
  const progressTickets = sortedTickets.filter(t => t.status === 'IN_PROGRESS');

  // --- PAGINATION ---
  const totalPendingPages = Math.ceil(pendingTickets.length / ITEMS_PER_PAGE);
  const totalProgressPages = Math.ceil(progressTickets.length / ITEMS_PER_PAGE);

  const startPendingIndex = (pendingPage - 1) * ITEMS_PER_PAGE;
  const endPendingIndex = startPendingIndex + ITEMS_PER_PAGE;
  const paginatedPendingTickets = pendingTickets.slice(startPendingIndex, endPendingIndex);

  const startProgressIndex = (progressPage - 1) * ITEMS_PER_PAGE;
  const endProgressIndex = startProgressIndex + ITEMS_PER_PAGE;
  const paginatedProgressTickets = progressTickets.slice(startProgressIndex, endProgressIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPendingPage(1);
    setProgressPage(1);
  }, [searchTerm, filterDate, filterPriority, sortDesc]);

  // --- ACTIONS ---
  const handleAssignToMe = async (ticketId) => {
    try {
      await api.put(`/tickets/${ticketId}/status`, { status: "IN_PROGRESS" });
      await api.post(`/tickets/${ticketId}/comments`, { 
        content: `Ticket pris en charge par ${currentUser}.`, 
        isInternal: true 
      });
      toast.success("Ticket pris en charge");
      fetchTickets();
    } catch (err) { 
      toast.error("Erreur lors de l'assignation");
    }
  };

  const openArchiveDialog = (ticket) => {
    setTicketToArchive(ticket);
    setIsArchiveDialogOpen(true);
  };

  const handleArchive = async () => {
    if (!ticketToArchive) return;
    
    try {
      await api.put(`/tickets/${ticketToArchive.id}/status`, { status: "CANCELLED" });
      toast.success("Ticket annulé");
      fetchTickets();
    } catch (err) { 
      toast.error("Erreur lors de l'annulation");
    } finally {
      setIsArchiveDialogOpen(false);
      setTicketToArchive(null);
    }
  };

  const confirmResolution = async () => {
    if (!selectedTicketId || !resolutionText) return;
    try {
      await api.put(`/tickets/${selectedTicketId}/status`, { 
        status: "RESOLVED", 
        resolution: resolutionText 
      });
      setIsResolveDialogOpen(false);
      setResolutionText("");
      toast.success("Ticket résolu");
      fetchTickets();
    } catch (err) { 
      toast.error("Erreur lors de la résolution");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterDate("");
    setFilterPriority("ALL");
  };

  const activeFiltersCount = [
    searchTerm !== "",
    filterDate !== "",
    filterPriority !== "ALL"
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <TicketIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600 animate-pulse" />
        </div>
        <p className="mt-4 text-slate-600 font-medium">Chargement des tickets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* --- STANDARDIZED FILTER BAR --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Search with icon */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <Input
              placeholder="Rechercher par titre, numéro, utilisateur..."
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
            
            {/* Priority Filter */}
            <div className="relative">
              <button 
                onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                className={`flex h-12 w-[180px] items-center justify-between rounded-xl border px-4 py-2 text-sm font-medium ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all hover:bg-slate-50 ${currentPriorityStyle.color}`}
              >
                <div className="flex items-center gap-2">
                  <CurrentIcon className="h-4 w-4" />
                  <span>{currentPriorityStyle.label}</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>

              {isPriorityOpen && (
                <>
                  <div className="fixed inset-0 z-[9998]" onClick={() => setIsPriorityOpen(false)}></div>
                  <div className="absolute top-full mt-2 left-0 w-[180px] z-[9999] rounded-md border border-slate-200 bg-white shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                    {Object.entries(priorityStyles).map(([key, style]) => {
                      const Icon = style.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setFilterPriority(key);
                            setIsPriorityOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${filterPriority === key ? 'bg-slate-100 font-medium' : ''}`}
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
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
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

      {/* --- LE BOARD (Colonnes) --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* COLONNE 1 : À TRAITER */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-orange-200">
            <h2 className="flex items-center gap-2 text-lg font-bold text-orange-800">
              À Traiter 
              <Badge className="bg-orange-600 hover:bg-orange-600">{pendingTickets.length}</Badge>
            </h2>
          </div>
          
          <div className="space-y-3">
            {paginatedPendingTickets.map(ticket => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                type="PENDING"
                onAssign={() => handleAssignToMe(ticket.id)}
                onArchive={() => openArchiveDialog(ticket)}
              />
            ))}
            {paginatedPendingTickets.length === 0 && <EmptyState text="Aucun ticket à traiter" />}
          </div>

          {/* Pagination pour À TRAITER */}
          {totalPendingPages > 1 && (
            <Pagination
              currentPage={pendingPage}
              totalPages={totalPendingPages}
              onPageChange={setPendingPage}
            />
          )}
        </div>

        {/* COLONNE 2 : EN COURS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-blue-200">
            <h2 className="flex items-center gap-2 text-lg font-bold text-blue-800">
              En Cours 
              <Badge className="bg-blue-600 hover:bg-blue-600">{progressTickets.length}</Badge>
            </h2>
          </div>
          
          <div className="space-y-3">
            {paginatedProgressTickets.map(ticket => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                type="PROGRESS"
                onResolve={() => { setSelectedTicketId(ticket.id); setIsResolveDialogOpen(true); }}
                onArchive={() => openArchiveDialog(ticket)}
              />
            ))}
            {paginatedProgressTickets.length === 0 && <EmptyState text="Aucun ticket en cours" />}
          </div>

          {/* Pagination pour EN COURS */}
          {totalProgressPages > 1 && (
            <Pagination
              currentPage={progressPage}
              totalPages={totalProgressPages}
              onPageChange={setProgressPage}
            />
          )}
        </div>
      </div>

      {/* MODALE ANNULATION */}
      <ConfirmArchiveDialog
        open={isArchiveDialogOpen}
        onOpenChange={setIsArchiveDialogOpen}
        onConfirm={handleArchive}
        ticketNumber={ticketToArchive?.ticketNumber}
      />

      {/* MODALE RESOLUTION */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-md">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              Résolution du Ticket
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Label className="text-sm font-medium">Détails de la solution</Label>
            <Input 
              value={resolutionText} 
              onChange={e => setResolutionText(e.target.value)} 
              placeholder="Ex: Serveur redémarré, configuration mise à jour..."
              className="h-11 border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsResolveDialogOpen(false)}
              className="border-slate-200"
            >
              Annuler
            </Button>
            <Button 
              onClick={confirmResolution} 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Valider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- SOUS-COMPOSANT : CARTE TICKET ---
function TicketCard({ ticket, type, onAssign, onArchive, onResolve }) {
  const creatorName = ticket.createdByUsername || "Inconnu";
  const initials = creatorName.substring(0, 2).toUpperCase();
  const description = ticket.description || "Pas de description disponible.";
  
  const priorityConfig = {
    CRITICAL: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
    HIGH: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertCircle },
    MEDIUM: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
    LOW: { color: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock }
  };
  
  const priorityStyle = priorityConfig[ticket.priority] || priorityConfig.MEDIUM;
  const PriorityIcon = priorityStyle.icon;

  return (
    <Card className={`border shadow-sm hover:shadow-lg transition-all group ${type === 'PENDING' ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-blue-500'}`}>
      <CardHeader className="flex flex-row items-start justify-between px-4 pt-4 pb-2 space-y-0">
        <div className="flex gap-3">
          <div className="flex items-center justify-center text-xs font-bold rounded-lg h-10 w-10 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 shadow-sm">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{creatorName}</p>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded">{ticket.ticketNumber}</span>
            </div>
            <p className="text-xs text-slate-500">
              {new Date(ticket.createdAt).toLocaleDateString('fr-FR')} à {new Date(ticket.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={`${priorityStyle.color} border flex items-center gap-1 font-semibold`}>
          <PriorityIcon className="w-3 h-3" /> {ticket.priority}
        </Badge>
      </CardHeader>
      
      <CardContent className="px-4 py-2">
        <Link to={`/admin/tickets/${ticket.id}`}>
          <h3 className="mb-1.5 font-semibold transition-colors text-slate-800 group-hover:text-indigo-600 leading-snug">
            {ticket.title}
          </h3>
          <p className="text-sm leading-relaxed text-slate-500 line-clamp-2">
            {description}
          </p>
        </Link>
        <div className="mt-3">
          <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700">
            {ticket.category || "General"}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="gap-2 px-4 pt-2 pb-3 mt-1 border-t border-slate-100">
        {type === 'PENDING' ? (
          <Button 
            size="sm" 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs h-9 font-semibold shadow-md shadow-blue-500/30" 
            onClick={onAssign}
          >
            <PlayCircle className="w-3.5 h-3.5 mr-2" /> Prendre en charge
          </Button>
        ) : (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full h-9 text-xs hover:bg-slate-50 border-slate-200" 
              onClick={onArchive}
            >
              <Archive className="w-3.5 h-3.5 mr-2" /> Annuler
            </Button>
            <Button 
              size="sm" 
              className="w-full h-9 text-xs bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-semibold shadow-md shadow-green-500/30" 
              onClick={onResolve}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Résoudre
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

// --- PAGINATION COMPONENT ---
function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex flex-col items-center gap-3 mt-4">
      {/* Page info */}
      <div className="text-xs text-slate-600 font-medium">
        Page <span className="text-indigo-600 font-bold">{currentPage}</span> / <span className="text-indigo-600 font-bold">{totalPages}</span>
      </div>
      
      {/* Pagination controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="group relative flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
        >
          <ChevronLeft className="w-3 h-3 text-slate-600 group-hover:text-indigo-600 transition-colors" />
        </button>
        
        {(() => {
          const pages = [];
          const showPages = 3;
          
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
                onClick={() => onPageChange(1)}
                className={`relative flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg border font-semibold text-xs transition-all duration-200 hover:scale-105 ${
                  1 === currentPage
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                1
              </button>
            );
            if (startPage > 2) {
              pages.push(
                <span key="ellipsis1" className="flex items-center justify-center w-6 text-slate-400 font-bold text-xs">
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
                onClick={() => onPageChange(i)}
                className={`relative flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg border font-semibold text-xs transition-all duration-200 hover:scale-105 ${
                  i === currentPage
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {i}
              </button>
            );
          }
          
          // Ellipsis + last page
          if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
              pages.push(
                <span key="ellipsis2" className="flex items-center justify-center w-6 text-slate-400 font-bold text-xs">
                  ...
                </span>
              );
            }
            pages.push(
              <button
                key={totalPages}
                onClick={() => onPageChange(totalPages)}
                className={`relative flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg border font-semibold text-xs transition-all duration-200 hover:scale-105 ${
                  totalPages === currentPage
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {totalPages}
              </button>
            );
          }
          
          return pages;
        })()}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="group relative flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
        >
          <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-600 transition-colors" />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl border-slate-200 text-slate-400 bg-slate-50/50">
      <TicketIcon className="w-10 h-10 mb-3 opacity-20" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}