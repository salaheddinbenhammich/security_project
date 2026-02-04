import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { jwtDecode } from "jwt-decode";
import { 
  ArrowLeft, Send, User, Clock, Tag, 
  CheckCircle2, ShieldAlert
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function UserTicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState("");

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data);
      
      const token = localStorage.getItem("token");
      if (token) {
          const decoded = jwtDecode(token);
          setCurrentUser(decoded.sub || "Moi");
      }
    } catch (err) {
      console.error(err);
      alert("Impossible de charger le ticket");
      navigate("/user/tickets");
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
        isInternal: false
      });
      setNewComment("");
      fetchTicket(); 
    } catch (err) {
      alert("Erreur lors de l'envoi du commentaire");
    }
  };

  if (loading) return <div className="p-10 text-center">Chargement des détails...</div>;
  if (!ticket) return null;

  const getPriorityBadge = (p) => {
    const colors = { CRITICAL: "bg-red-600", HIGH: "bg-orange-500", MEDIUM: "bg-blue-500", LOW: "bg-slate-500" };
    return <Badge className={`${colors[p]} hover:${colors[p]}`}>{p}</Badge>;
  };

  return (
    <div className="bg-slate-50 min-h-screen space-y-6 p-1">
      
      {/* HEADER NAVIGATION */}
      <Button variant="ghost" className="pl-0 hover:bg-transparent text-slate-600" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour à mes tickets
      </Button>

      {/* TITRE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <span className="font-mono text-slate-500 text-sm bg-slate-100 px-2 py-0.5 rounded border">{ticket.ticketNumber}</span>
             {getPriorityBadge(ticket.priority)}
             <Badge variant="outline" className="border-slate-300 text-slate-700">{ticket.status}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{ticket.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GAUCHE : CONVERSATION (2/3) */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Description du ticket */}
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
                <CardHeader className="bg-slate-50/50 pb-3 border-b">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                {ticket.createdBy?.username?.substring(0,2).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-semibold">{ticket.createdBy?.firstName} {ticket.createdBy?.lastName}</p>
                            <p className="text-xs text-slate-500">Ouvert le {new Date(ticket.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {ticket.description}
                </CardContent>
            </Card>

            {/* Fil de commentaires */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    Historique & Réponses <Badge variant="secondary">{ticket.comments?.filter(c => !c.isInternal).length || 0}</Badge>
                </h3>
                
                {ticket.comments?.map((comment) => {
                    if (comment.isInternal) return null;

                    const isMe = comment.authorUsername === currentUser; 

                    return (
                        <div key={comment.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                            <Avatar className="w-8 h-8 mt-1">
                                <AvatarFallback className={isMe ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}>
                                    {comment.authorUsername?.substring(0,2).toUpperCase() || "A"}
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className={`flex-1 p-3 rounded-lg border ${isMe ? "bg-blue-50 border-blue-100" : "bg-white border-slate-200"}`}>
                                <div className={`flex justify-between items-center mb-1 ${isMe ? "flex-row-reverse" : ""}`}>
                                    <span className="font-semibold text-sm text-slate-800">
                                        {comment.authorFullName || comment.authorUsername}
                                    </span>
                                    <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Zone de saisie (seulement si le ticket n'est pas fermé/archivé) */}
            {ticket.status !== 'CLOSED' && ticket.status !== 'CANCELLED' && (
                <Card className="mt-4 bg-slate-50 border-t-2 border-t-slate-200">
                    <CardContent className="pt-4 space-y-3">
                        <Label className="text-slate-600">Ajouter une réponse ou un complément d'information</Label>
                        <Textarea 
                            placeholder="Écrivez votre message ici..." 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="bg-white min-h-[100px]"
                        />
                        <div className="flex justify-end">
                            <Button onClick={handleAddComment} disabled={!newComment.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Send className="w-4 h-4 mr-2" /> Envoyer le message
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>

        {/* DROITE : INFOS CLeS (1/3) */}
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="text-base">Détails de la demande</CardTitle></CardHeader>
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
                        <span className="text-slate-500 flex gap-2"><User size={16}/> Demandeur</span>
                        <div className="text-right">
                             <div className="font-medium">{ticket.createdBy?.firstName} {ticket.createdBy?.lastName}</div>
                             <div className="text-xs text-blue-600">{ticket.createdBy?.email}</div>
                        </div>
                    </div>
                    
                    {/* Affichage de la solution si résolu */}
                    {ticket.resolution && (
                         <div className="bg-green-50 p-4 rounded-md border border-green-200 mt-4">
                            <p className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                                <CheckCircle2 size={16}/> Problème Résolu
                            </p>
                            <div className="text-green-900 text-sm">
                                <span className="font-semibold">Solution apportée :</span>
                                <p className="italic mt-1">{ticket.resolution}</p>
                            </div>
                         </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}