import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Send, 
  User, 
  Clock, 
  Tag, 
  CheckCircle2, 
  PlayCircle, 
  ShieldAlert, 
  Undo2,
  MessageSquare,
  Calendar,
  Sparkles,
  Archive
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ConfirmArchiveDialog from "@/components/ticket/ConfirmArchiveDialog";

export default function AdminTicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false); 
  const [currentUser, setCurrentUser] = useState("");
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [resolutionText, setResolutionText] = useState("");
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

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
      toast.error("Impossible de charger le ticket");
      navigate("/admin/tickets");
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
      toast.success("Commentaire ajouté");
      fetchTicket(); 
    } catch (err) {
      toast.error("Erreur lors de l'envoi du commentaire");
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await api.put(`/tickets/${id}/status`, { status: newStatus });
      
      const actionMap = { 
        IN_PROGRESS: "pris en charge", 
        PENDING: "relâché (remis à traiter)", 
        CANCELLED: "annulé" 
      };
      
      await api.post(`/tickets/${id}/comments`, {
         content: `Ticket ${actionMap[newStatus] || newStatus} par ${currentUser}.`,
         isInternal: true
      });
      
      toast.success(`Ticket ${actionMap[newStatus] || newStatus}`);
      fetchTicket();
    } catch (err) { 
      toast.error("Erreur mise à jour statut"); 
    }
  };

  const handleArchive = async () => {
    try {
      await api.put(`/tickets/${id}/status`, { status: "CANCELLED" });
      
      await api.post(`/tickets/${id}/comments`, {
        content: `Ticket annulé par ${currentUser}.`,
        isInternal: true
      });
      
      toast.success("Ticket annulé");
      setIsArchiveDialogOpen(false);
      fetchTicket();
    } catch (err) {
      toast.error("Erreur lors de l'annulation");
    }
  };

  const confirmResolution = async () => {
    if (!resolutionText.trim()) {
      toast.error("Veuillez entrer une solution");
      return;
    }
    
    try {
      await api.put(`/tickets/${id}/status`, { 
        status: "RESOLVED", 
        resolution: resolutionText 
      });
      
      await api.post(`/tickets/${id}/comments`, {
         content: `Ticket résolu par ${currentUser}. Solution : ${resolutionText}`,
         isInternal: true
      });

      setIsResolveDialogOpen(false);
      setResolutionText("");
      toast.success("Ticket résolu avec succès");
      fetchTicket();
    } catch (err) { 
      toast.error("Erreur lors de la résolution"); 
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
      icon: PlayCircle
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
      icon: ShieldAlert
    }
  };

  const priorityConfig = {
    CRITICAL: { label: "Critique", color: "bg-red-600 hover:bg-red-600 text-white" },
    HIGH: { label: "Haute", color: "bg-orange-500 hover:bg-orange-500 text-white" },
    MEDIUM: { label: "Moyenne", color: "bg-blue-500 hover:bg-blue-500 text-white" },
    LOW: { label: "Basse", color: "bg-slate-500 hover:bg-slate-500 text-white" }
  };

  const currentStatus = statusConfig[ticket.status] || statusConfig.PENDING;
  const StatusIconComponent = currentStatus.icon;
  const currentPriority = priorityConfig[ticket.priority] || priorityConfig.MEDIUM;

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* BACK BUTTON & ACTION BUTTONS - Fixed at top */}
      <div className="sticky top-0 z-20 bg-slate-50 py-4 -mx-4 px-4 mb-6 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Button 
              variant="ghost" 
              className="pl-0 hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour au Board
            </Button>
            
            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-3">
              {ticket.status === 'PENDING' && (
                <>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30"
                    onClick={() => updateStatus("IN_PROGRESS")}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" /> M'assigner
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={() => setIsArchiveDialogOpen(true)}
                  >
                    <Archive className="w-4 h-4 mr-2" /> Annuler
                  </Button>
                </>
              )}
              
              {ticket.status === 'IN_PROGRESS' && (
                <>
                  <Button 
                    variant="outline" 
                    className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800" 
                    onClick={() => updateStatus("PENDING")}
                  >
                    <Undo2 className="w-4 h-4 mr-2" /> Relâcher
                  </Button>

                  <Button 
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={() => setIsArchiveDialogOpen(true)}
                  >
                    <Archive className="w-4 h-4 mr-2" /> Annuler
                  </Button>

                  <Button 
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30"
                    onClick={() => setIsResolveDialogOpen(true)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Résoudre
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* HEADER CARD */}
          <Card className="border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    {ticket.ticketNumber}
                  </span>
                  <Badge className={`${currentPriority.color} font-semibold`}>
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

          <Separator className="my-6" />

          {/* COMMENTS SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                Activité
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                  {ticket.comments?.length || 0}
                </Badge>
              </h3>
            </div>
            
            {ticket.comments?.length === 0 ? (
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
                {ticket.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-9 h-9 mt-1 border-2 border-white shadow-sm flex-shrink-0">
                      <AvatarFallback className={comment.isInternal 
                        ? "bg-amber-100 text-amber-700 font-semibold text-xs" 
                        : "bg-slate-100 text-slate-700 font-semibold text-xs"
                      }>
                        {comment.authorUsername?.substring(0,2).toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className={`p-4 rounded-2xl shadow-sm ${
                        comment.isInternal 
                          ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200" 
                          : "bg-white border border-slate-200"
                      }`}>
                        <div className="flex justify-between items-start mb-2 gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-800">
                              {comment.authorFullName || comment.authorUsername}
                            </span>
                            {comment.isInternal && (
                              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-[10px] px-1.5 py-0">
                                <ShieldAlert className="w-2.5 h-2.5 mr-1" /> INTERNE
                              </Badge>
                            )}
                          </div>
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
                ))}
              </div>
            )}
          </div>

          {/* COMMENT INPUT */}
          <Card className="border-slate-200 shadow-lg bg-gradient-to-r from-slate-50 to-white">
            <CardContent className="pt-6 space-y-4">
              <Label className="text-slate-700 font-semibold flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-600" />
                Ajouter un commentaire
              </Label>
              <Textarea 
                placeholder="Écrivez votre message ici..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-white min-h-[120px] border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none"
              />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="internal-mode" 
                    checked={isInternal} 
                    onCheckedChange={setIsInternal}
                  />
                  <Label htmlFor="internal-mode" className="text-sm text-slate-600 cursor-pointer select-none">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      Note interne (Admin uniquement)
                    </div>
                  </Label>
                </div>
                <Button 
                  onClick={handleAddComment} 
                  disabled={!newComment.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 w-full sm:w-auto"
                >
                  <Send className="w-4 h-4 mr-2" /> Envoyer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: STICKY SIDEBAR (1/3) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">
                  Méta-données
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
                    <User className="w-4 h-4 text-indigo-600" /> Auteur
                  </span>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">
                      {ticket.createdBy?.firstName} {ticket.createdBy?.lastName}
                    </div>
                    <div className="text-xs text-indigo-600">
                      {ticket.createdBy?.email}
                    </div>
                  </div>
                </div>
                
                {/* Resolution Display */}
                {ticket.resolution && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-bold text-green-800">Solution apportée</p>
                    </div>
                    <p className="text-xs text-green-700 leading-relaxed">
                      {ticket.resolution}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ARCHIVE DIALOG */}
      <ConfirmArchiveDialog
        open={isArchiveDialogOpen}
        onOpenChange={setIsArchiveDialogOpen}
        onConfirm={handleArchive}
        ticketNumber={ticket?.ticketNumber}
      />

      {/* RESOLUTION DIALOG */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
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
              onChange={(e) => setResolutionText(e.target.value)} 
              placeholder="Ex: Serveur redémarré, Clé USB remplacée..."
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