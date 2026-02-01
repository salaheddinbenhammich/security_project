import { Link } from "react-router-dom";
import { mockIncidents } from "@/lib/mockIncidents";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function StatusBadge({ status }) {
  const variant =
    status === "OPEN" ? "destructive" :
    status === "IN_PROGRESS" ? "secondary" : "default";
  return <Badge variant={variant}>{status}</Badge>;
}

export default function PublicIncidents() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-4 py-10">
      {/* Glow background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(129,140,248,0.22),_transparent_55%)]" />
      </div>

      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <header className="text-center space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Vue publique des incidents IT
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Incidents IT
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-300/80 max-w-md mx-auto">
            Liste publique des incidents en cours (titre, statut, priorité, date).
            Les détails sensibles restent réservés aux utilisateurs authentifiés.
          </p>
        </header>

        {/* Liste incidents */}
        <Card className="border-slate-800/80 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-slate-950/70">
          <CardHeader className="border-b border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-slate-50">
                  Incidents en cours
                  <Badge
                    variant="secondary"
                    className="bg-slate-800 text-slate-100 border-slate-700 text-xs"
                  >
                    {mockIncidents.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-slate-300/80">
                  Données publiques depuis GET&nbsp;/api/tickets/public.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-4">
            {mockIncidents.map((incident) => (
              <div
                key={incident.id}
                className="group flex items-center justify-between gap-4 p-4 border border-slate-800 rounded-xl bg-slate-900/80 hover:bg-slate-900 hover:border-cyan-500/60 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-semibold text-base md:text-lg text-slate-100 group-hover:text-cyan-300 mb-1">
                    {incident.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      Priorité&nbsp;:{" "}
                      <span className="font-semibold text-slate-100">
                        {incident.priority}
                      </span>
                    </span>
                    <span>•</span>
                    <span>Créé le {incident.createdAt}</span>
                  </div>
                </div>
                <StatusBadge status={incident.status} />
              </div>
            ))}

            {mockIncidents.length === 0 && (
              <p className="text-sm text-slate-400">
                Aucun incident public pour le moment.
              </p>
            )}
          </CardContent>
        </Card>

          {/* Footer avec lien fonctionnel */}
    <div className="text-center p-8 pt-12 border-t border-gray-200 bg-white/50 backdrop-blur-sm rounded-xl mt-8">
      <p className="text-sm text-gray-600 mb-3">
        Vous avez un problème informatique ?
      </p>
      <Link 
        to="/login" 
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        Se connecter
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
      </div>
    </div>
  );
}
