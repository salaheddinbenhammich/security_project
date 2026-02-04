import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import {
  Card, CardContent
} from "@/components/ui/card";
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
    ChevronDown // Important pour le menu
} from "lucide-react"; 
import { Input } from "@/components/ui/input"; 
import FilterDropdown from "@/components/common/FilterDropdown";
import { STATUS_STYLES, PRIORITY_STYLES } from "@/components/common/filterOptions";


// Helper pour le badge statut dans la liste (utilise les mm styles)
function StatusBadge({ status, className = "" }) {
    const styles = {
      PENDING: "bg-orange-100 text-orange-700 border-orange-200",
      IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
      RESOLVED: "bg-green-100 text-green-700 border-green-200",
      CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
      CLOSED: "bg-gray-100 text-gray-800 border-gray-300"
    };
    
    const labelMap = {
        PENDING: "À Traiter",
        IN_PROGRESS: "En Cours",
        RESOLVED: "Résolu",
        CANCELLED: "Archivé",
        CLOSED: "Fermé"
    };

    return (
        <Badge variant="outline" className={`${styles[status] || "bg-slate-100"} border ${className}`}>
            {labelMap[status] || status}
        </Badge>
    );
}

export default function UserTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FILTRES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  // État pour gérer quel menu est ouvert
  const [openDropdown, setOpenDropdown] = useState(null);

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

  const resetFilters = () => {
      setSearchTerm("");
      setStatusFilter("ALL");
      setPriorityFilter("ALL");
      setDateFilter("");
  };

  return (
    <div className="min-h-screen p-1 bg-slate-50/50">
      <div className="flex flex-col w-full max-w-5xl gap-6 mx-auto">
        
        {/* EN-TÊTE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Mes Tickets
            </h1>
            <p className="text-sm text-slate-500">
              {filteredTickets.length} ticket(s) affiché(s)
            </p>
          </div>
          
          {/* <Button onClick={() => navigate("/user/tickets/new")} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Nouveau Ticket
          </Button> */}
        </div>

        {/* BARRE DE FILTRES */}
        <Card className="bg-white shadow-sm border-slate-200">
            <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                    
                    {/* 1. Recherche */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Rechercher (Titre, Réf)..." 
                            className="pl-9 bg-white" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                                <XCircle className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* 2. FILTRE STATUT (CUSTOM) */}
                    <FilterDropdown
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={STATUS_STYLES}
                        openKey={openDropdown}
                        setOpenKey={setOpenDropdown}
                        dropdownKey="STATUS"
                        widthClass="w-[180px]"
                        />

                    {/* 3. FILTRE PRIORITÉ (CUSTOM) */}
                    <FilterDropdown
                        value={priorityFilter}
                        onChange={setPriorityFilter}
                        options={PRIORITY_STYLES}
                        openKey={openDropdown}
                        setOpenKey={setOpenDropdown}
                        dropdownKey="PRIORITY"
                        widthClass="w-[180px]"
                        />

                    {/* 4. Filtre Date */}
                    <div className="relative w-[160px]">
                        <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                            <Calendar className="h-4 w-4" />
                        </div>
                        <input 
                            type="date" 
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>

                    {/* Reset */}
                    {(searchTerm || statusFilter !== "ALL" || priorityFilter !== "ALL" || dateFilter) && (
                        <Button variant="ghost" onClick={resetFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3">
                            Effacer
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>

        {/* LISTE DES TICKETS */}
        <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
            <CardContent className="p-0">
              {loading && <div className="p-12 text-center text-slate-500">Chargement de vos tickets...</div>}

              {!loading && sortedTickets.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center">
                    <div className="bg-slate-100 p-4 rounded-full mb-3">
                        <Search className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-slate-900 font-medium">Aucun ticket trouvé</p>
                    <p className="text-slate-500 text-sm mt-1 mb-4">Essayez de modifier vos filtres ou créez une nouvelle demande.</p>
                    <Button variant="outline" onClick={() => navigate("/user/create")}>
                        Créer un ticket
                    </Button>
                </div>
              )}

              {!loading && sortedTickets.length > 0 && (
                  <div className="divide-y divide-slate-100">
                    {sortedTickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 hover:bg-slate-50 transition-all duration-200 group cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500"
                            onClick={() => navigate(`/user/ticket/${ticket.id}`)}
                        >
                            <div className="flex-1 min-w-0 pr-4 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                        {ticket.ticketNumber || "REF-..."}
                                    </span>
                                    <StatusBadge status={ticket.status} className="text-[10px] h-5 px-2" />
                                </div>
                                
                                <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                                    {ticket.title}
                                </h3>
                                
                                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        {new Date(ticket.createdAt).toLocaleDateString()}
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
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    ))}
                  </div>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}