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
  XCircle
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminTicketsBoard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState("Admin");

  // --- ÉTATS DES FILTRES ---
  const [searchTerm, setSearchTerm] = useState("");     // Recherche texte
  const [filterDate, setFilterDate] = useState("");     // Filtre date (YYYY-MM-DD)
  const [sortDesc, setSortDesc] = useState(true);       // Tri (true = plus récent en premier)

  // États actions
  const [resolutionText, setResolutionText] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);

  // 1. Chargement
  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
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

  // --- LOGIQUE DE FILTRAGE PUISSANTE ---
  const filteredTickets = tickets.filter(ticket => {
     // 1. Recherche Texte (Titre, Numéro, ou Auteur)
     const searchLower = searchTerm.toLowerCase();
     // Note: On utilise ?. pour éviter le crash si createdBy est null
     const titleMatch = (ticket.title || "").toLowerCase().includes(searchLower);
     const numberMatch = (ticket.ticketNumber || "").toLowerCase().includes(searchLower);
     const userMatch = (ticket.createdBy?.username || ticket.authorUsername || "").toLowerCase().includes(searchLower);
     
     const matchesSearch = titleMatch || numberMatch || userMatch;

     // 2. Filtre Date (Si une date est sélectionnée)
     let matchesDate = true;
     if (filterDate) {
         // On compare la partie YYYY-MM-DD
         const ticketDate = new Date(ticket.createdAt).toISOString().split('T')[0];
         matchesDate = ticketDate === filterDate;
     }

     return matchesSearch && matchesDate;
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

  // --- ACTIONS (Assigner, Résoudre...) ---
  const handleAssignToMe = async (ticketId) => {
    try {
      await api.put(`/tickets/${ticketId}/status`, { status: "IN_PROGRESS" });
      await api.post(`/tickets/${ticketId}/comments`, { 
         content: `Ticket pris en charge par ${currentUser}.`, 
         isInternal: true 
      });
      fetchTickets();
    } catch (err) { alert("Erreur lors de l'assignation"); }
  };

  const handleArchive = async (ticketId) => {
    if(!window.confirm("Archiver ce ticket ?")) return;
    try {
      await api.put(`/tickets/${ticketId}/status`, { status: "CANCELLED" });
      fetchTickets();
    } catch (err) { alert("Erreur archivage"); }
  };

  const confirmResolution = async () => {
    if (!selectedTicketId || !resolutionText) return;
    try {
      await api.put(`/tickets/${selectedTicketId}/status`, { 
        status: "RESOLVED", resolution: resolutionText 
      });
      setIsResolveDialogOpen(false);
      setResolutionText("");
      fetchTickets();
    } catch (err) { alert("Erreur résolution"); }
  };

  if (loading) return <div className="p-8 flex justify-center text-slate-500">Chargement...</div>;

  return (
    <div className="p-1 bg-slate-50/50 min-h-screen space-y-6">
      
      {/* --- BARRE D'OUTILS DE FILTRES --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pilotage Incidents</h1>
          <p className="text-slate-500 text-sm">
             {filteredTickets.length} ticket(s) affiché(s)
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          
          {/* 1. Recherche Texte */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Rechercher (titre, user...)" 
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
             {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    <XCircle className="h-4 w-4" />
                </button>
            )}
          </div>

          {/* 2. Filtre Date */}
          <div className="relative">
             <div className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none">
                <Calendar className="h-4 w-4" />
             </div>
             <input 
                type="date" 
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-9 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
             />
          </div>

          {/* 3. Tri (Date) */}
          <Button 
            variant="outline"
            onClick={() => setSortDesc(!sortDesc)}
            className="w-[160px] justify-between"
          >
            {sortDesc ? "Plus récents" : "Plus anciens"}
            <ArrowUpDown className="h-4 w-4 ml-2 opacity-50" />
          </Button>

          {/* Bouton Reset */}
          {(searchTerm || filterDate) && (
             <Button variant="ghost" onClick={() => { setSearchTerm(""); setFilterDate(""); }} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                Effacer filtres
             </Button>
          )}
        </div>
      </div>

      {/* --- LE BOARD (Colonnes) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLONNE 1 : À TRAITER */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2 border-orange-200">
            <h2 className="text-lg font-semibold text-orange-800 flex items-center gap-2">
              À Traiter <Badge className="bg-orange-600">{pendingTickets.length}</Badge>
            </h2>
          </div>
          
          <div className="space-y-3">
            {pendingTickets.map(ticket => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                type="PENDING"
                onAssign={() => handleAssignToMe(ticket.id)}
                onArchive={() => handleArchive(ticket.id)}
              />
            ))}
            {pendingTickets.length === 0 && <EmptyState text="Aucun ticket à traiter" />}
          </div>
        </div>

        {/* COLONNE 2 : EN COURS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2 border-blue-200">
            <h2 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              En Cours <Badge className="bg-blue-600">{progressTickets.length}</Badge>
            </h2>
          </div>

          <div className="space-y-3">
            {progressTickets.map(ticket => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                type="PROGRESS"
                onResolve={() => { setSelectedTicketId(ticket.id); setIsResolveDialogOpen(true); }}
                onArchive={() => handleArchive(ticket.id)}
              />
            ))}
             {progressTickets.length === 0 && <EmptyState text="Aucun ticket en cours" />}
          </div>
        </div>
      </div>

      {/* MODALE RESOLUTION */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Résolution du Ticket</DialogTitle></DialogHeader>
            <div className="py-4 space-y-2">
                <Label>Détails de la solution</Label>
                <Input value={resolutionText} onChange={e => setResolutionText(e.target.value)} placeholder="Ex: Serveur redémarré..." />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>Annuler</Button>
                <Button onClick={confirmResolution} className="bg-green-600">Valider</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- SOUS-COMPOSANT : CARTE TICKET (SÉCURISÉ) ---
function TicketCard({ ticket, type, onAssign, onArchive, onResolve }) {
    // SÉCURITÉ : On vérifie si createdBy existe, sinon on met "Inconnu"
    const creatorName = ticket.createdBy?.username || ticket.authorUsername || "Inconnu";
    const initials = creatorName.substring(0, 2).toUpperCase();
    
    // SÉCURITÉ : Description
    const description = ticket.description || "Pas de description disponible.";

    const priorityColor = {
        CRITICAL: "bg-red-100 text-red-700 border-red-200",
        HIGH: "bg-orange-100 text-orange-700 border-orange-200",
        MEDIUM: "bg-blue-100 text-blue-700 border-blue-200",
        LOW: "bg-slate-100 text-slate-700 border-slate-200"
    }[ticket.priority] || "bg-slate-100";

    const PriorityIcon = ticket.priority === 'CRITICAL' ? AlertCircle : Clock;

    return (
        <Card className={`border shadow-sm hover:shadow-md transition-all group ${type === 'PENDING' ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-blue-500'}`}>
            <CardHeader className="pb-2 pt-4 px-4 flex flex-row justify-between items-start space-y-0">
                <div className="flex gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                        {initials}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                             <p className="text-sm font-semibold text-slate-900">{creatorName}</p>
                             <span className="text-[10px] text-slate-400 font-mono">{ticket.ticketNumber}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                            {new Date(ticket.createdAt).toLocaleDateString()} à {new Date(ticket.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                </div>
                <Badge variant="outline" className={`${priorityColor} border flex items-center gap-1`}>
                    <PriorityIcon className="w-3 h-3" /> {ticket.priority}
                </Badge>
            </CardHeader>
            
            <CardContent className="px-4 py-2">
                <Link to={`/admin/tickets/${ticket.id}`}>
                    <h3 className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors mb-1">
                        {ticket.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {description}
                    </p>
                </Link>
                <div className="mt-3">
                    <Badge variant="secondary" className="text-sm font-semibold px-2 py-0.5">
                        {ticket.category || "General"}
                    </Badge>
                </div>
            </CardContent>

            <CardFooter className="px-4 pb-3 pt-2 border-t mt-1 gap-2">
                {type === 'PENDING' ? (
                    <>
                        <Button size="sm" variant="outline" className="w-full text-xs h-8 hover:bg-red-50 hover:text-red-600 border-dashed" onClick={onArchive}>
                            <Archive className="w-3 h-3 mr-2" /> Archiver
                        </Button>
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-xs h-8" onClick={onAssign}>
                            <PlayCircle className="w-3 h-3 mr-2" /> Assigner
                        </Button>
                    </>
                ) : (
                    <>
                         <Button size="sm" variant="outline" className="w-full text-xs h-8 hover:bg-slate-100" onClick={onArchive}>
                            <Archive className="w-3 h-3 mr-2" /> Annuler
                        </Button>
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-xs h-8" onClick={onResolve}>
                            <CheckCircle2 className="w-3 h-3 mr-2" /> Résoudre
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    );
}

function EmptyState({ text }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 bg-slate-50/50">
            <User className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">{text}</p>
        </div>
    );
}