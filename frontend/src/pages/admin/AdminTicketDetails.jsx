import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { jwtDecode } from "jwt-decode";
import { 
  ArrowLeft, Send, User, Clock, Tag, 
  CheckCircle2, PlayCircle, ShieldAlert, Undo2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// --- 1. IMPORTS AJOUTÉS POUR LE DIALOGUE ---
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function AdminTicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false); 
  const [currentUser, setCurrentUser] = useState("");

  // --- 2. ÉTATS AJOUTÉS POUR LA RÉSOLUTION ---
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [resolutionText, setResolutionText] = useState("");

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data);
      
      const token = localStorage.getItem("token");
      if (token) {
          const decoded = jwtDecode(token);
          setCurrentUser(decoded.sub || "Admin");
      }
    } catch (err) {
      console.error(err);
      alert("Impossible de charger le ticket");
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTicket(); }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.post(`/tickets/${id}/comments`, {
        content: newComment,
        isInternal: isInternal
      });
      setNewComment("");
      fetchTicket(); 
    } catch (err) {
      alert("Erreur lors de l'envoi du commentaire");
    }
  };

  // Mise à jour simple (pour Assigner ou Relâcher)
  const updateStatus = async (newStatus) => {
    try {
      await api.put(`/tickets/${id}/status`, { status: newStatus });
      
      const actionMap = { IN_PROGRESS: "pris en charge", PENDING: "relâché (remis à traiter)", CANCELLED: "annulé" };
      await api.post(`/tickets/${id}/comments`, {
         content: `Ticket ${actionMap[newStatus] || newStatus} par ${currentUser}.`,
         isInternal: true
      });
      
      fetchTicket();
    } catch (err) { alert("Erreur mise à jour statut"); }
  };

  // --- 3. FONCTION DE RÉSOLUTION ---
  const confirmResolution = async () => {
    if (!resolutionText.trim()) return;
    try {
      // On envoie le statut ET la resolution
      await api.put(`/tickets/${id}/status`, { 
        status: "RESOLVED", 
        resolution: resolutionText 
      });
      
      // Petit commentaire automatique
      await api.post(`/tickets/${id}/comments`, {
         content: `Ticket résolu par ${currentUser}. Solution : ${resolutionText}`,
         isInternal: true
      });

      // Reset et fermeture
      setIsResolveDialogOpen(false);
      setResolutionText("");
      fetchTicket();
    } catch (err) { alert("Erreur lors de la résolution"); }
  };

  if (loading) return <div className="p-10 text-center">Chargement des détails...</div>;
  if (!ticket) return null;

  const getPriorityBadge = (p) => {
    const colors = { CRITICAL: "bg-red-600", HIGH: "bg-orange-500", MEDIUM: "bg-blue-500", LOW: "bg-slate-500" };
    return <Badge className={`${colors[p]} hover:${colors[p]}`}>{p}</Badge>;
  };

  return (
    <div className="bg-slate-50 min-h-screen space-y-6">
      {/* HEADER NAVIGATION */}
      <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => navigate("/admin")}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour au Board
      </Button>

      {/* TITRE ET ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <span className="font-mono text-slate-500 text-sm">{ticket.ticketNumber}</span>
             {getPriorityBadge(ticket.priority)}
             <Badge variant="outline">{ticket.status}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{ticket.title}</h1>
        </div>
        
        {/* BARRE D'ACTIONS */}
        <div className="flex gap-2">
            {ticket.status === 'PENDING' && (
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => updateStatus("IN_PROGRESS")}>
                    <PlayCircle className="w-4 h-4 mr-2" /> M'assigner
                </Button>
            )}
            
            {ticket.status === 'IN_PROGRESS' && (
                <>
                    <Button 
                        variant="outline" 
                        className="text-orange-600 border-orange-200 hover:bg-orange-50" 
                        onClick={() => updateStatus("PENDING")}
                    >
                        <Undo2 className="w-4 h-4 mr-2" /> Relâcher
                    </Button>

                    {/* --- 4. LE BOUTON OUVRE LE DIALOGUE --- */}
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsResolveDialogOpen(true)}>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Résoudre
                    </Button>
                </>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GAUCHE : CONVERSATION (2/3) */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
                <CardHeader className="bg-slate-50/50 pb-3">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                {ticket.createdBy?.username?.substring(0,2).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-semibold">{ticket.createdBy?.firstName} {ticket.createdBy?.lastName}</p>
                            <p className="text-xs text-slate-500">A ouvert ce ticket le {new Date(ticket.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {ticket.description}
                </CardContent>
            </Card>

            <Separator />

            {/* Fil de commentaires */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    Activité <Badge variant="secondary">{ticket.comments?.length || 0}</Badge>
                </h3>
                
                {ticket.comments?.map((comment) => (
                    <div key={comment.id} className={`flex gap-3 ${comment.isInternal ? "opacity-80" : ""}`}>
                        <div className="flex flex-col items-center">
                            <Avatar className="w-8 h-8">
                                <AvatarFallback className={comment.isInternal ? "bg-amber-100 text-amber-700" : "bg-slate-100"}>
                                    {comment.authorUsername?.substring(0,2).toUpperCase() || "A"}
                                </AvatarFallback>
                            </Avatar>
                            {comment.isInternal && <div className="w-0.5 h-full bg-amber-200 mt-2"></div>}
                        </div>
                        <div className={`flex-1 p-3 rounded-lg ${comment.isInternal ? "bg-amber-50 border border-amber-100" : "bg-white border"}`}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-sm">
                                    {comment.authorFullName || comment.authorUsername}
                                    {comment.isInternal && <span className="ml-2 text-[10px] text-amber-600 border border-amber-200 px-1 rounded bg-amber-50 flex items-center inline-flex gap-1"><ShieldAlert size={10}/> INTERNE</span>}
                                </span>
                                <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Zone de saisie */}
            <Card className="mt-4 bg-slate-50 border-t-2 border-t-slate-200">
                <CardContent className="pt-3 space-y-3">
                    <Textarea 
                        placeholder="Écrire une réponse ou une note..." 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="bg-white"
                    />
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Switch id="internal-mode" checked={isInternal} onCheckedChange={setIsInternal} />
                            <Label htmlFor="internal-mode" className="text-sm text-slate-600 cursor-pointer select-none">
                                Note interne (Admin uniquement)
                            </Label>
                        </div>
                        <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                            <Send className="w-4 h-4 mr-2" /> Envoyer
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* DROITE : INFOS CLeS (1/3) */}
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="text-base">Méta-données</CardTitle></CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-slate-500 flex gap-2"><Tag size={16}/> Catégorie</span>
                        <span className="font-medium">{ticket.category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-slate-500 flex gap-2"><Clock size={16}/> Créé le</span>
                        <span className="font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-slate-500 flex gap-2"><User size={16}/> Auteur</span>
                        <div className="text-right">
                             <div className="font-medium">{ticket.createdBy?.firstName} {ticket.createdBy?.lastName}</div>
                             <div className="text-xs text-blue-600">{ticket.createdBy?.email}</div>
                        </div>
                    </div>
                    
                    {/* Affichage de la solution si résolu */}
                    {ticket.resolution && (
                         <div className="bg-green-50 p-3 rounded-md border border-green-200 mt-4">
                            <p className="text-xs font-bold text-green-800 mb-1 flex items-center gap-1">
                                <CheckCircle2 size={12}/> Solution apportée :
                            </p>
                            <p className="text-green-700 italic text-xs">{ticket.resolution}</p>
                         </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>

      {/* --- 5. LE DIALOGUE EN BAS DE PAGE --- */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Résolution du Ticket</DialogTitle></DialogHeader>
            <div className="py-4 space-y-2">
                <Label>Quelle solution a été apportée ?</Label>
                <Input 
                    value={resolutionText} 
                    onChange={(e) => setResolutionText(e.target.value)} 
                    placeholder="Ex: Serveur redémarré, Clé USB remplacée..." 
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>Annuler</Button>
                <Button onClick={confirmResolution} className="bg-green-600 hover:bg-green-700">Confirmer Résolution</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}