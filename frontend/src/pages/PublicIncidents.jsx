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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Incidents IT
          </h1>
          <p className="text-xl text-gray-600 max-w-md mx-auto">
            Liste publique des incidents (titre, statut, priorité, date)
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Incidents en cours
              <Badge variant="secondary" className="text-sm">
                {incidents.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Vue publique: GET /api/tickets/public (titre, statut, priorité, date)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <p className="text-sm text-gray-500">Chargement...</p>}
            {!loading && incidents.map((incident) => (
              <div
                key={incident.id}
                className="group flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all bg-white"
              >
                <div className="flex-1">
                  <div className="font-semibold text-lg group-hover:text-blue-600 mb-1">
                    {incident.title}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{incident.priority}</span>
                    <span>•</span>
                    <span>{formatDate(incident.createdAt)}</span>
                  </div>
                </div>
                <StatusBadge status={incident.status} />
              </div>
            ))}
          </CardContent>
        </Card>

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
