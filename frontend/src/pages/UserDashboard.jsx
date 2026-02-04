import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

import { getUser, logout } from "@/utils/auth";

function StatusBadge({ status, className = "" }) {
  const variant =
    status === "PENDING" ? "secondary" :
    status === "IN_PROGRESS" ? "default" :
    status === "RESOLVED" ? "outline" :
    status === "CLOSED" ? "secondary" :
    "destructive";
  return <Badge variant={variant} className={className}>{status}</Badge>;
}

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("fr-FR");
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "OTHER",
  });
  const user = getUser();

  const initials = user?.firstName
    ? `${user.firstName[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : (user?.username?.slice(0, 2) || "U").toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get("/tickets/my");
      setTickets(response.data || []);
    } catch (err) {
      setError("Impossible de charger vos tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/tickets", {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
      });

      setFormData({ title: "", description: "", priority: "MEDIUM", category: "OTHER" });
      await loadTickets();
    } catch (err) {
      setError("Impossible de creer le ticket.");
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-white">
      <div className="flex flex-col w-full max-w-6xl gap-8 mx-auto">
        <div className="flex flex-col gap-4 pb-6 border-b md:flex-row md:items-end md:justify-between border-slate-200">
          <div>
            <p className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium border rounded-full border-slate-200 bg-slate-50 text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Espace utilisateur
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl text-slate-900">
              Mes tickets{" "}
              <span className="text-transparent bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text">
                incidents IT
              </span>
            </h1>
            <p className="max-w-xl mt-2 text-sm text-slate-600">
              Cree de nouveaux tickets, verifie l'etat de traitement et garde une trace de tous tes incidents IT.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="hidden md:inline text-slate-400">Vue publique ?</span>
            <Button asChild variant="outline" size="sm" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50">
              <Link to="/">Incidents publics</Link>
            </Button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center justify-center text-xs font-semibold bg-white border rounded-full shadow-sm h-9 w-9 border-slate-200 text-slate-700"
                aria-label="Menu profil"
              >
                {initials}
              </button>
              {profileOpen && (
                <div className="absolute right-0 z-20 w-56 mt-2 bg-white border shadow-lg rounded-xl border-slate-200">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">
                      {user?.firstName || user?.username || "Utilisateur"}
                    </p>
                    <p className="text-xs text-slate-500">{user?.email || ""}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/user/profile"
                      className="block px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50"
                    >
                      Profil
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-3 py-2 mt-1 text-sm text-left text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Se deconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-slate-900">
                <span>Nouveau ticket</span>
                <Badge variant="outline" className="text-xs border-cyan-500/40 text-cyan-700 bg-cyan-50">
                  POST /api/tickets
                </Badge>
              </CardTitle>
              <CardDescription className="text-slate-600">
                Decris ton incident le plus precisement possible pour que l'equipe IT puisse intervenir rapidement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-slate-700">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Probleme reseau etage 3"
                    required
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-slate-700">
                    Description detaillee *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Decrivez le probleme, l'impact, la localisation, l'heure d'apparition..."
                    rows={5}
                    required
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-slate-700">Priorite</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 text-slate-900">
                        <SelectItem value="LOW">Faible</SelectItem>
                        <SelectItem value="MEDIUM">Moyenne</SelectItem>
                        <SelectItem value="HIGH">Haute</SelectItem>
                        <SelectItem value="CRITICAL">Critique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-700">Categorie</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 text-slate-900">
                        <SelectItem value="HARDWARE">Materiel</SelectItem>
                        <SelectItem value="SOFTWARE">Logiciel</SelectItem>
                        <SelectItem value="NETWORK">Reseau</SelectItem>
                        <SelectItem value="ACCESS">Acces</SelectItem>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="ACCOUNT">Compte</SelectItem>
                        <SelectItem value="DATA_RECOVERY">Recuperation</SelectItem>
                        <SelectItem value="SECURITY">Securite</SelectItem>
                        <SelectItem value="INSTALLATION">Installation</SelectItem>
                        <SelectItem value="OTHER">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full mt-2 font-semibold text-white bg-cyan-600 hover:bg-cyan-500"
                >
                  Creer mon ticket
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    Mes tickets
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">
                      {tickets.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Tickets crees par toi (GET /api/tickets/my).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {loading && (
                <p className="text-sm text-slate-500">Chargement...</p>
              )}

              {!loading && tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col justify-between p-4 transition-all bg-white border group md:flex-row md:items-center border-slate-200 rounded-xl hover:border-cyan-300 hover:bg-slate-50"
                >
                  <div className="flex-1 space-y-2">
                    <div className="text-base font-semibold md:text-lg text-slate-900 group-hover:text-cyan-700">
                      <Link
                        to={`/user/ticket/${ticket.id}`}
                        className="hover:underline"
                      >
                        {ticket.title}
                      </Link>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {ticket.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>
                        Priorite:{" "}
                        <span className="font-semibold text-slate-700">
                          {ticket.priority}
                        </span>
                      </span>
                      <span></span>
                      <span>Cree le {formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>
                  <StatusBadge
                    status={ticket.status}
                    className="mt-3 md:mt-0 md:ml-4"
                  />
                </div>
              ))}

              {!loading && tickets.length === 0 && (
                <p className="text-sm text-slate-500">
                  Aucun ticket pour le moment. Cree ton premier incident via le formulaire a gauche.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
