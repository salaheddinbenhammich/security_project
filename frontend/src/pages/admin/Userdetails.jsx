import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Clock,
  Lock,
  UserCheck,
  UserMinus,
  Unlock,
  AlertCircle,
  Ticket,
  MessageSquare,
  Activity,
  Settings,
  Sparkles,
  Key
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchUserDetails();
    fetchUserTickets();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const res = await api.get(`/users/${userId}`);
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      toast.error("Erreur lors du chargement des détails utilisateur");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTickets = async () => {
    try {
      const res = await api.get(`/users/${userId}/tickets`);
      setTickets(res.data || []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      toast.error("Erreur lors du chargement des tickets");
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleEnableUser = async () => {
    try {
      await api.put(`/users/${userId}/enable`);
      fetchUserDetails();
      toast.success("Compte activé avec succès");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'activation");
    }
  };

  const handleDisableUser = async () => {
    try {
      await api.put(`/users/${userId}/disable`);
      fetchUserDetails();
      toast.success("Compte désactivé avec succès");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la désactivation");
    }
  };

  const handleUnlockUser = async () => {
    try {
      await api.put(`/users/${userId}/unlock`);
      fetchUserDetails();
      toast.success("Compte déverrouillé avec succès");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors du déverrouillage");
    }
  };

  const getUserStatus = () => {
    if (!user) return null;
    if (user.accountNonLocked === false) return "LOCKED";
    if (user.enabled === false) return "DISABLED";
    return "ACTIVE";
  };

  const getStatusBadge = () => {
    const status = getUserStatus();
    
    if (status === "LOCKED") {
      return (
        <Badge variant="outline" className="font-semibold text-orange-700 bg-orange-100 border-orange-200">
          <Lock className="w-4 h-4 mr-1.5" />
          Verrouillé
        </Badge>
      );
    }
    
    if (status === "DISABLED") {
      return (
        <Badge variant="outline" className="font-semibold text-red-700 bg-red-100 border-red-200">
          <UserMinus className="w-4 h-4 mr-1.5" />
          Désactivé
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="font-semibold text-green-700 bg-green-100 border-green-200">
        <UserCheck className="w-4 h-4 mr-1.5" />
        Actif
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTicketStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
      IN_PROGRESS: { label: "En cours", color: "bg-blue-100 text-blue-700 border-blue-200" },
      RESOLVED: { label: "Résolu", color: "bg-green-100 text-green-700 border-green-200" },
      CLOSED: { label: "Fermé", color: "bg-slate-100 text-slate-700 border-slate-200" }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <Badge variant="outline" className={`${config.color} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      LOW: { label: "Basse", color: "bg-slate-100 text-slate-700 border-slate-200" },
      MEDIUM: { label: "Moyenne", color: "bg-blue-100 text-blue-700 border-blue-200" },
      HIGH: { label: "Haute", color: "bg-orange-100 text-orange-700 border-orange-200" },
      CRITICAL: { label: "Critique", color: "bg-red-100 text-red-700 border-red-200" }
    };

    const config = priorityConfig[priority] || priorityConfig.MEDIUM;
    return (
      <Badge variant="outline" className={`${config.color} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin" />
          <Sparkles className="absolute w-5 h-5 text-indigo-600 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 animate-pulse" />
        </div>
        <p className="mt-4 font-medium text-slate-600">Chargement des détails...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-slate-900">Utilisateur non trouvé</h2>
          <Button onClick={() => navigate("/admin/users")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      
      {/* HEADER - Fixed at top */}
      <div className="sticky top-0 z-20 px-4 py-4 mb-6 -mx-4 border-b shadow-sm bg-slate-50 border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <Button 
              variant="ghost" 
              className="pl-0 transition-colors hover:bg-slate-50 text-slate-600 hover:text-indigo-600" 
              onClick={() => navigate("/admin/users")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux utilisateurs
            </Button>
            
            <div className="flex items-center gap-2">
              {user.enabled === false ? (
                <Button
                  onClick={handleEnableUser}
                  className="text-white bg-green-600 shadow-lg hover:bg-green-700 shadow-green-500/30"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activer le compte
                </Button>
              ) : (
                <Button
                  onClick={handleDisableUser}
                  variant="outline"
                  className="text-orange-700 border-orange-200 hover:bg-orange-50"
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  Désactiver le compte
                </Button>
              )}
              
              {user.accountNonLocked === false && (
                <Button
                  onClick={handleUnlockUser}
                  className="text-white bg-purple-600 shadow-lg hover:bg-purple-700 shadow-purple-500/30"
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  Déverrouiller
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* LEFT COLUMN (2/3) */}
        <div className="space-y-6 lg:col-span-2">

          {/* USER OVERVIEW CARD */}
          <Card className="overflow-hidden shadow-lg border-slate-200">
            <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-white border-slate-100">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                  <AvatarFallback className="text-2xl font-bold text-white bg-gradient-to-br from-indigo-600 to-purple-600">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {user.firstName} {user.lastName}
                      </h2>
                      <p className="mt-1 text-slate-500">@{user.username}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge()}
                      <Badge 
                        variant="outline" 
                        className={`font-semibold ${user.role === 'ADMIN' 
                          ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-purple-200' 
                          : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200'
                        }`}
                      >
                        {user.role === 'ADMIN' ? (
                          <Shield className="w-4 h-4 mr-1" />
                        ) : (
                          <User className="w-4 h-4 mr-1" />
                        )}
                        {user.role}
                      </Badge>
                    </div>
                  </div>

                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50">
                        <Mail className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">Email</p>
                        <p className="text-sm font-medium text-slate-900">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-50">
                        <Phone className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">Téléphone</p>
                        <p className="text-sm font-medium text-slate-900">{user.phoneNumber || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* TAB NAVIGATION */}
          <div className="flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "overview"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Settings className="inline-block w-4 h-4 mr-2" />
              Informations du Compte
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "security"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Shield className="inline-block w-4 h-4 mr-2" />
              Sécurité
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "tickets"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Ticket className="inline-block w-4 h-4 mr-2" />
              Tickets ({tickets.length})
            </button>
          </div>

          {/* TAB CONTENT */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <Card className="shadow-lg border-slate-200">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-indigo-600" />
                    Informations Personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="mb-1 text-xs font-semibold tracking-wide uppercase text-slate-500">Prénom</p>
                      <p className="text-base font-medium text-slate-900">{user.firstName}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold tracking-wide uppercase text-slate-500">Nom</p>
                      <p className="text-base font-medium text-slate-900">{user.lastName}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold tracking-wide uppercase text-slate-500">Nom d'utilisateur</p>
                      <p className="text-base font-medium text-slate-900">@{user.username}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold tracking-wide uppercase text-slate-500">Email</p>
                      <p className="text-base font-medium text-slate-900">{user.email}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold tracking-wide uppercase text-slate-500">Téléphone</p>
                      <p className="text-base font-medium text-slate-900">{user.phoneNumber || "-"}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold tracking-wide uppercase text-slate-500">Rôle</p>
                      <p className="text-base font-medium text-slate-900">{user.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-slate-200">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Activité du Compte
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="mb-1 text-xs font-semibold tracking-wide uppercase text-slate-500">Compte créé le</p>
                      <p className="text-base font-medium text-slate-900">{formatDate(user.createdAt)}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold tracking-wide uppercase text-slate-500">Dernière mise à jour</p>
                      <p className="text-base font-medium text-slate-900">{formatDate(user.updatedAt)}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold tracking-wide uppercase text-slate-500">Dernière connexion</p>
                      <p className="text-base font-medium text-slate-900">{formatDate(user.lastLogin)}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold tracking-wide uppercase text-slate-500">Mot de passe changé</p>
                      <p className="text-base font-medium text-slate-900">{formatDate(user.passwordChangedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "security" && (
            <Card className="shadow-lg border-slate-200">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="w-5 h-5 text-indigo-600" />
                  État de Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${user.enabled ? 'bg-green-100' : 'bg-red-100'}`}>
                        {user.enabled ? <UserCheck className="w-5 h-5 text-green-600" /> : <UserMinus className="w-5 h-5 text-red-600" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Compte Actif</p>
                        <p className="text-sm text-slate-500">Le compte peut se connecter</p>
                      </div>
                    </div>
                    <Badge className={user.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {user.enabled ? "Activé" : "Désactivé"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${user.accountNonLocked ? 'bg-green-100' : 'bg-orange-100'}`}>
                        {user.accountNonLocked ? <Unlock className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-orange-600" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Compte Non-Verrouillé</p>
                        <p className="text-sm text-slate-500">Pas de tentatives de connexion échouées</p>
                      </div>
                    </div>
                    <Badge className={user.accountNonLocked ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                      {user.accountNonLocked ? "Déverrouillé" : "Verrouillé"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${user.credentialsNonExpired ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        <Key className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Identifiants Valides</p>
                        <p className="text-sm text-slate-500">Les identifiants n'ont pas expiré</p>
                      </div>
                    </div>
                    <Badge className={user.credentialsNonExpired ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                      {user.credentialsNonExpired ? "Valide" : "Expiré"}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 mt-6 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Tentatives de connexion échouées</p>
                      <p className="mt-1 text-sm text-blue-700">
                        {user.failedLoginAttempts || 0} tentative(s) échouée(s)
                      </p>
                      {user.lockedUntil && (
                        <p className="mt-1 text-sm text-blue-700">
                          Verrouillé jusqu'à: {formatDate(user.lockedUntil)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "tickets" && (
            <Card className="shadow-lg border-slate-200">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Ticket className="w-5 h-5 text-indigo-600" />
                  Tickets Créés ({tickets.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {ticketsLoading ? (
                  <div className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin" />
                      <p className="font-medium text-slate-500">Chargement des tickets...</p>
                    </div>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="p-12 text-center">
                    <Ticket className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="font-medium text-slate-600">Aucun ticket créé</p>
                    <p className="mt-2 text-sm text-slate-500">Cet utilisateur n'a pas encore créé de tickets</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-semibold">N° Ticket</TableHead>
                          <TableHead className="font-semibold">Titre</TableHead>
                          <TableHead className="font-semibold">Priorité</TableHead>
                          <TableHead className="font-semibold">Statut</TableHead>
                          <TableHead className="font-semibold">Créé le</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tickets.map((ticket) => (
                          <TableRow 
                            key={ticket.id}
                            className="transition-colors cursor-pointer hover:bg-slate-50"
                            onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                          >
                            <TableCell className="font-mono text-sm font-semibold text-indigo-600">
                              {ticket.ticketNumber}
                            </TableCell>
                            <TableCell className="font-medium text-slate-900">
                              {ticket.title}
                            </TableCell>
                            <TableCell>
                              {getPriorityBadge(ticket.priority)}
                            </TableCell>
                            <TableCell>
                              {getTicketStatusBadge(ticket.status)}
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">
                              {formatDate(ticket.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: STICKY SIDEBAR (1/3) */}
        <div className="lg:col-span-1">
          <div className="sticky space-y-6 top-24">
            <Card className="shadow-lg border-slate-200">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="flex items-center gap-2 font-medium text-slate-500">
                    <Ticket className="w-4 h-4 text-indigo-600" /> Tickets créés
                  </span>
                  <Badge variant="secondary" className="font-semibold text-indigo-700 bg-indigo-100">
                    {tickets.length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="flex items-center gap-2 font-medium text-slate-500">
                    <Calendar className="w-4 h-4 text-indigo-600" /> Membre depuis
                  </span>
                  <span className="font-semibold text-slate-900">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="flex items-center gap-2 font-medium text-slate-500">
                    <Clock className="w-4 h-4 text-indigo-600" /> Dernière activité
                  </span>
                  <span className="font-semibold text-slate-900">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }) : "-"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}