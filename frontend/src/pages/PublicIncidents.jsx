import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/services/api";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function StatusBadge({ status }) {
  const variant = status === "PENDING" ? "secondary" :
    status === "IN_PROGRESS" ? "default" :
    status === "RESOLVED" ? "outline" :
    status === "CLOSED" ? "secondary" : "destructive";
  return <Badge variant={variant}>{status}</Badge>;
}

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("fr-FR");
};

export default function PublicIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPublic = async () => {
      try {
        const response = await api.get("/tickets/public");
        setIncidents(response.data || []);
      } finally {
        setLoading(false);
      }
    };

    loadPublic();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-violet-100 to-violet-200 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="text-center space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-xs font-medium text-violet-600">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Vue publique des incidents IT
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-violet-700">
            Incidents IT
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-md mx-auto">
            Liste publique des incidents en cours (titre, statut, priorite, date).
            Les details sensibles restent reserves aux utilisateurs authentifies.
          </p>
        </header>

        <Card className="border-violet-200 bg-white/90 shadow-xl shadow-violet-200/60">
          <CardHeader className="border-b border-violet-100">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  Incidents en cours
                  <Badge
                    variant="secondary"
                    className="bg-violet-100 text-violet-700 border-violet-200 text-xs"
                  >
                    {incidents.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-slate-500">
                  Donnees publiques depuis GET /api/tickets/public.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-4">
            {loading && <p className="text-sm text-slate-500">Chargement...</p>}
            {!loading && incidents.map((incident) => (
              <div
                key={incident.id}
                className="group flex items-center justify-between gap-4 p-4 border border-violet-200 rounded-xl bg-white hover:bg-violet-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-semibold text-base md:text-lg text-slate-900 group-hover:text-violet-700 mb-1">
                    {incident.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                      Priorite :{" "}
                      <span className="font-semibold text-slate-800">
                        {incident.priority}
                      </span>
                    </span>
                    <span>•</span>
                    <span>Cree le {formatDate(incident.createdAt)}</span>
                  </div>
                </div>
                <StatusBadge status={incident.status} />
              </div>
            ))}

            {!loading && incidents.length === 0 && (
              <p className="text-sm text-slate-500">
                Aucun incident public pour le moment.
              </p>
            )}
          </CardContent>
        </Card>

        <footer className="text-center pt-8 border-t border-violet-200 mt-4">
          <p className="text-sm text-slate-600 mb-2">
            Tu rencontres un probleme et tu veux le declarer ?
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-colors"
          >
            Se connecter pour creer un ticket
            <span className="text-base">&rarr;</span>
          </Link>
        </footer>
      </div>
    </div>
  );
}
