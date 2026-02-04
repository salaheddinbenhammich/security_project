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
  Calendar,
  ArrowUpDown,
  ChevronDown,
  Archive
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

  // État pour gérer quel menu est ouvert (null, 'STATUS', ou 'PRIORITY')
  const [openDropdown, setOpenDropdown] = useState(null);

  // --- CONFIGURATION VISUELLE (STYLES) ---

  const statusStyles = {
    ALL:         { label: "Tous Statuts", color: "bg-white text-slate-700", icon: Filter },
    PENDING:     { label: "À Traiter",    color: "bg-orange-100 text-orange-700 border-orange-200", icon: Clock },
    IN_PROGRESS: { label: "En Cours",     color: "bg-blue-100 text-blue-700 border-blue-200", icon: PlayCircle },
    RESOLVED:    { label: "Résolu",       color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
    CANCELLED:   { label: "Archivé",      color: "bg-slate-100 text-slate-600 border-slate-200", icon: Archive },
  };

  const priorityStyles = {
    ALL:      { label: "Toutes Priorités", color: "bg-white text-slate-700", icon: Filter },
    CRITICAL: { label: "Critique",         color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
    HIGH:     { label: "Haute",            color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertCircle },
    MEDIUM:   { label: "Moyenne",          color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
    LOW:      { label: "Basse",            color: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock }
  };

  // Helpers pour le style actuel
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

  return (
    <div className="p-1 bg-slate-50/50 min-h-screen space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historique Global</h1>
          <p className="text-slate-500 text-sm">{filteredTickets.length} ticket(s) trouvé(s)</p>
        </div>
        <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Exporter CSV
        </Button>
      </div>

      {/* BARRE D'OUTILS */}
      <Card>
        <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
                
                {/* 1. Recherche */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Rechercher (Ref, Titre, User)..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* 2. FILTRE STATUT (CUSTOM DROPDOWN) */}
                <div className="relative">
                    <button 
                        onClick={() => setOpenDropdown(openDropdown === 'STATUS' ? null : 'STATUS')}
                        className={`flex h-10 w-[180px] items-center justify-between rounded-md border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 ${currentStatusStyle.color} ${statusFilter === 'ALL' ? 'border-slate-200' : 'border'}`}
                    >
                        <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4" />
                            <span className="truncate">{currentStatusStyle.label}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>

                    {openDropdown === 'STATUS' && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)}></div>
                            <div className="absolute top-full mt-2 left-0 w-[180px] z-20 rounded-md border border-slate-200 bg-white shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                                {Object.entries(statusStyles).map(([key, style]) => {
                                    const Icon = style.icon;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => { setStatusFilter(key); setOpenDropdown(null); }}
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

                {/* 3. FILTRE PRIORITÉ (CUSTOM DROPDOWN) */}
                <div className="relative">
                    <button 
                        onClick={() => setOpenDropdown(openDropdown === 'PRIORITY' ? null : 'PRIORITY')}
                        className={`flex h-10 w-[180px] items-center justify-between rounded-md border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 ${currentPriorityStyle.color} ${priorityFilter === 'ALL' ? 'border-slate-200' : 'border'}`}
                    >
                        <div className="flex items-center gap-2">
                            <PriorityIcon className="h-4 w-4" />
                            <span className="truncate">{currentPriorityStyle.label}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>

                    {openDropdown === 'PRIORITY' && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)}></div>
                            <div className="absolute top-full mt-2 left-0 w-[180px] z-20 rounded-md border border-slate-200 bg-white shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                                {Object.entries(priorityStyles).map(([key, style]) => {
                                    const Icon = style.icon;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => { setPriorityFilter(key); setOpenDropdown(null); }}
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

                {/* Tri Date */}
                <Button variant="secondary" onClick={() => setSortDesc(!sortDesc)}>
                    <ArrowUpDown className="w-4 h-4 mr-2" /> 
                    {sortDesc ? "Plus récent" : "Plus ancien"}
                </Button>
            </div>
        </CardContent>
      </Card>

      {/* TABLEAU DES TICKETS */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                    <tr>
                        <th className="px-4 py-3">Référence</th>
                        <th className="px-4 py-3">Sujet</th>
                        <th className="px-4 py-3">Priorité</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-500">Chargement...</td></tr>
                    ) : sortedTickets.length === 0 ? (
                        <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-500">Aucun ticket trouvé.</td></tr>
                    ) : (
                        sortedTickets.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{ticket.ticketNumber}</td>
                                <td className="px-4 py-3 font-medium text-slate-900 max-w-[300px] truncate">
                                    {ticket.title}
                                    <div className="text-xs text-slate-400 font-normal truncate">{ticket.category}</div>
                                </td>
                                <td className="px-4 py-3">
                                    {/* Badge priorité tableau */}
                                    <Badge variant="outline" className={`${priorityStyles[ticket.priority]?.color || ''} border`}>
                                        {ticket.priority}
                                    </Badge>
                                </td>
                                
                                <td className="px-4 py-3 text-slate-500">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    {/* Badge statut tableau */}
                                    <Badge variant="outline" className={`${statusStyles[ticket.status]?.color || ''} border`}>
                                        {ticket.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                                    >
                                        <Eye className="w-4 h-4 text-slate-500 hover:text-blue-600" />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        <div className="px-4 py-3 border-t bg-slate-50 text-xs text-slate-500 flex justify-between">
            <span>{filteredTickets.length} résultat(s)</span>
        </div>
      </div>

    </div>
  );
}