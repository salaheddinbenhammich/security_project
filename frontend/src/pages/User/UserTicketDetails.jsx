import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Send, 
  User, 
  Clock, 
  Tag, 
  CheckCircle2, 
  ThumbsUp, 
  ThumbsDown,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Calendar
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
      toast.error("Impossible de charger le ticket");
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
      toast.success("Commentaire ajouté");
      fetchTicket(); 
    } catch (err) {
      toast.error("Erreur lors de l'ajout du commentaire");
    }
  };

  const handleConfirmResolution = async () => {
    try {
      await api.post(`/tickets/${id}/confirm-resolution`, {
        confirmed: true,
        comment: "✅ L'utilisateur a confirmé la résolution. Ticket fermé."
      });
      
      toast.success("Merci ! Ticket fermé avec succès.");
      fetchTicket(); 
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la confirmation");
    }
  };

  const handleReopenTicket = async () => {
    try {
      await api.post(`/tickets/${id}/confirm-resolution`, {
        confirmed: false,
        comment: "L'utilisateur indique que le problème persiste. Ticket réouvert."
      });

      toast.info("Ticket réouvert. Un technicien va vous recontacter.");
      fetchTicket(); 
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la réouverture");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600 animate-pulse" />
        </div>
        <p className="mt-4 text-slate-600 font-medium">Chargement des détails...</p>
      </div>
    );
  }

  if (!ticket) return null;

  // Status & Priority Configurations
  const statusConfig = {
    PENDING: { 
      label: "À Traiter", 
      color: "bg-orange-100 text-orange-700 border-orange-200",
      icon: Clock
    },
    IN_PROGRESS: { 
      label: "En Cours", 
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: AlertCircle
    },
    RESOLVED: { 
      label: "Résolu", 
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle2
    },
    CLOSED: { 
      label: "Fermé", 
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: CheckCircle2
    },
    CANCELLED: { 
      label: "Annulé", 
      color: "bg-slate-100 text-slate-600 border-slate-200",
      icon: AlertCircle
    }
  };

  const priorityConfig = {
    CRITICAL: { label: "Critique", color: "bg-red-600 hover:bg-red-600" },
    HIGH: { label: "Haute", color: "bg-orange-500 hover:bg-orange-500" },
    MEDIUM: { label: "Moyenne", color: "bg-blue-500 hover:bg-blue-500" },
    LOW: { label: "Faible", color: "bg-slate-500 hover:bg-slate-500" }
  };

  const currentStatus = statusConfig[ticket.status] || statusConfig.PENDING;
  const StatusIconComponent = currentStatus.icon;
  const currentPriority = priorityConfig[ticket.priority] || priorityConfig.MEDIUM;

  const publicComments = ticket.comments?.filter(c => !c.isInternal) || [];
  const canInteract = ticket.status !== 'CLOSED' && ticket.status !== 'CANCELLED';

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* BACK BUTTON - Fixed at top */}
      <div className="sticky top-0 z-20 bg-slate-50 py-4 -mx-4 px-4 mb-6 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            className="pl-0 hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour à mes tickets
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT GRID - Contains everything */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* HEADER CARD */}
          <Card className="border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    {ticket.ticketNumber}
                  </span>
                  <Badge className={`${currentPriority.color} text-white font-semibold`}>
                    {currentPriority.label}
                  </Badge>
                  <Badge variant="outline" className={`${currentStatus.color} border font-semibold`}>
                    <StatusIconComponent className="w-3 h-3 mr-1" />
                    {currentStatus.label}
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                  {ticket.title}
                </h1>
              </div>
            </div>
          </Card>

          {/* VALIDATION ZONE (Only if RESOLVED) */}
          {ticket.status === 'RESOLVED' && (
            <Card className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-xl shadow-md">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-green-800">
                          Le support a marqué ce ticket comme résolu
                        </h3>
                        <p className="text-green-700 text-sm">
                          Merci de confirmer si la solution proposée fonctionne pour vous.
                        </p>
                      </div>
                    </div>
                    
                    {ticket.resolution && (
                      <div className="mt-3 p-4 bg-white rounded-xl border border-green-200 shadow-sm">
                        <div className="flex items-start gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="font-semibold text-green-900 text-sm">Solution technique :</span>
                        </div>
                        <p className="text-sm text-green-800 leading-relaxed pl-6">
                          {ticket.resolution}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* ACTION BUTTONS */}
                  <div className="flex flex-col gap-3 w-full md:w-auto">
                    <Button 
                      onClick={handleConfirmResolution}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30 w-full md:w-auto"
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" /> Oui, c'est résolu
                    </Button>
                    <Button 
                      onClick={handleReopenTicket}
                      variant="outline" 
                      className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 w-full md:w-auto"
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" /> Non, ça ne marche pas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* ORIGINAL MESSAGE */}
          <Card className="border-slate-200 shadow-lg border-l-4 border-l-indigo-500">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-white shadow-md">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-sm">
                    {ticket.createdBy?.username?.substring(0,2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {ticket.createdBy?.firstName} {ticket.createdBy?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(ticket.createdAt).toLocaleDateString('fr-FR')} à {new Date(ticket.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5 text-slate-700 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </CardContent>
          </Card>

          {/* COMMENTS SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                Conversation
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                  {publicComments.length}
                </Badge>
              </h3>
            </div>
            
            {publicComments.length === 0 ? (
              <Card className="border-slate-200 border-dashed">
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">Aucun commentaire pour le moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {publicComments.map((comment) => {
                  const isMe = comment.authorUsername === currentUser;

                  return (
                    <div key={comment.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                      <Avatar className="w-9 h-9 mt-1 border-2 border-white shadow-sm flex-shrink-0">
                        <AvatarFallback className={isMe 
                          ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-xs" 
                          : "bg-slate-100 text-slate-700 font-semibold text-xs"
                        }>
                          {comment.authorUsername?.substring(0,2).toUpperCase() || "A"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`flex-1 max-w-[85%] ${isMe ? "items-end" : "items-start"}`}>
                        <div className={`p-4 rounded-2xl shadow-sm ${
                          isMe 
                            ? "bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100" 
                            : "bg-white border border-slate-200"
                        }`}>
                          <div className={`flex justify-between items-center mb-2 gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                            <span className="font-semibold text-sm text-slate-800">
                              {comment.authorFullName || comment.authorUsername}
                            </span>
                            <span className="text-xs text-slate-400 whitespace-nowrap">
                              {new Date(comment.createdAt).toLocaleDateString('fr-FR')} • {new Date(comment.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* COMMENT INPUT (Disabled if CLOSED/CANCELLED) */}
          {canInteract && (
            <Card className="border-slate-200 shadow-lg bg-gradient-to-r from-slate-50 to-white">
              <CardContent className="pt-6 space-y-4">
                <Label className="text-slate-700 font-semibold flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-600" />
                  Ajouter une réponse
                </Label>
                <Textarea 
                  placeholder="Écrivez votre message ici..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-white min-h-[120px] border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleAddComment} 
                    disabled={!newComment.trim()} 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
                  >
                    <Send className="w-4 h-4 mr-2" /> Envoyer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!canInteract && (
            <Card className="border-slate-200 bg-slate-50">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-slate-200 rounded-full mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-slate-600 font-medium">Ce ticket est {ticket.status === 'CLOSED' ? 'fermé' : 'annulé'}</p>
                <p className="text-slate-500 text-sm mt-1">Vous ne pouvez plus ajouter de commentaires</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: STICKY SIDEBAR (1/3) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">
                  Détails de la demande
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Tag className="w-4 h-4 text-indigo-600" /> Catégorie
                  </span>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 font-semibold">
                    {ticket.category}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <Clock className="w-4 h-4 text-indigo-600" /> Créé le
                  </span>
                  <span className="font-semibold text-slate-900">
                    {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <User className="w-4 h-4 text-indigo-600" /> Créé par
                  </span>
                  <span className="font-semibold text-slate-900">
                    {ticket.createdBy?.firstName} {ticket.createdBy?.lastName}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500 flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-indigo-600" /> Statut
                  </span>
                  <Badge variant="outline" className={`${currentStatus.color} border font-semibold`}>
                    <StatusIconComponent className="w-3 h-3 mr-1" />
                    {currentStatus.label}
                  </Badge>
                </div>
                
                {/* Closed State Info */}
                {ticket.status === 'CLOSED' && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-bold text-green-800">Ticket Fermé</p>
                    </div>
                    <p className="text-xs text-green-700">
                      Vous avez confirmé la résolution de ce ticket.
                    </p>
                  </div>
                )}

                {ticket.status === 'CANCELLED' && (
                  <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-slate-600" />
                      <p className="text-sm font-bold text-slate-800">Ticket Annulé</p>
                    </div>
                    <p className="text-xs text-slate-600">
                      Ce ticket a été annulé.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}