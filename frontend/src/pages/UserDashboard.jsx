import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "OTHER",
  });

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-4 py-10">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(129,140,248,0.22),_transparent_55%)]" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Espace utilisateur
            </p>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-slate-50">
              Mes tickets{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                incidents IT
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-300/80 max-w-xl">
              Cree de nouveaux tickets, verifie l'etat de traitement et garde une trace de tous tes incidents IT.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300/80">
            <span className="hidden md:inline text-slate-400">Vue publique ?</span>
            <Button asChild variant="outline" size="sm" className="border-slate-600 text-slate-100 bg-slate-900/70 hover:bg-slate-800">
              <Link to="/">Incidents publics</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <Card className="border-slate-800/80 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-slate-950/60">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-slate-50">
                <span>Nouveau ticket</span>
                <Badge variant="outline" className="border-cyan-500/60 text-cyan-300 bg-cyan-500/10 text-xs">
                  POST /api/tickets
                </Badge>
              </CardTitle>
              <CardDescription className="text-slate-300/80">
                Decris ton incident le plus precisement possible pour que l'equipe IT puisse intervenir rapidement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-slate-200">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Probleme reseau etage 3"
                    required
                    className="bg-slate-900/70 border-slate-700/80 text-slate-50 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-slate-200">
                    Description detaillee *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Decrivez le probleme, l'impact, la localisation, l'heure d'apparition..."
                    rows={5}
                    required
                    className="bg-slate-900/70 border-slate-700/80 text-slate-50 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-slate-200">Priorite</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger className="bg-slate-900/70 border-slate-700/80 text-slate-50 focus-visible:ring-cyan-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700 text-slate-50">
                        <SelectItem value="LOW">Faible</SelectItem>
                        <SelectItem value="MEDIUM">Moyenne</SelectItem>
                        <SelectItem value="HIGH">Haute</SelectItem>
                        <SelectItem value="CRITICAL">Critique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-200">Categorie</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="bg-slate-900/70 border-slate-700/80 text-slate-50 focus-visible:ring-cyan-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700 text-slate-50">
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
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full mt-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-lg shadow-cyan-500/30"
                >
                  Creer mon ticket
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-slate-800/80 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-slate-950/60">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-slate-50">
                    Mes tickets
                    <Badge variant="secondary" className="bg-slate-800 text-slate-100 border-slate-700">
                      {tickets.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-slate-300/80">
                    Tickets crees par toi (GET /api/tickets/my).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {loading && (
                <p className="text-sm text-slate-400">Chargement...</p>
              )}

              {!loading && tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="group flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-800 rounded-xl bg-slate-900/80 hover:border-cyan-500/60 hover:bg-slate-900 transition-all"
                >
                  <div className="flex-1 space-y-2">
                    <div className="font-semibold text-base md:text-lg text-slate-100 group-hover:text-cyan-300">
                      <Link
                        to={`/user/ticket/${ticket.id}`}
                        className="hover:underline"
                      >
                        {ticket.title}
                      </Link>
                    </div>
                    <p className="text-sm text-slate-300/85 leading-relaxed">
                      {ticket.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>
                        Priorite:{" "}
                        <span className="font-semibold text-slate-200">
                          {ticket.priority}
                        </span>
                      </span>
                      <span>•</span>
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
                <p className="text-sm text-slate-400">
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
