import { useParams, Link } from "react-router-dom";

export default function UserTicketDetail() {
  const { id } = useParams();
  
  // Mock ticket spécifique (GET /api/tickets/{id})
  const ticket = {
    id: parseInt(id),
    title: "Problème réseau étage 3",
    description: "Impossible d'accéder à internet depuis 10h. Affecte toute l'équipe dev.",
    priority: "HAUTE",
    status: "OPEN",
    createdAt: "2026-01-30 10:15",
    category: "NETWORK",
    assignedTo: null
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header avec back */}
        <div className="flex items-center gap-4">
          <Link to="/user" className="text-indigo-600 hover:underline font-medium">
            ← Retour mes tickets
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex-1">
            Détail ticket #{ticket.id}
          </h1>
        </div>

        {/* Détail complet */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>{ticket.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <span className="text-sm font-medium text-gray-500">Description</span>
                <p className="mt-1 text-gray-900">{ticket.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Priorité:</span> {ticket.priority}</div>
                <div><span className="font-medium">Statut:</span> {ticket.status}</div>
                <div><span className="font-medium">Catégorie:</span> {ticket.category}</div>
                <div><span className="font-medium">Créé le:</span> {ticket.createdAt}</div>
                <div><span className="font-medium">Assigné:</span> {ticket.assignedTo || "Non"}</div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mes actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-4">
                  En tant qu'utilisateur, vous pouvez suivre l'évolution de votre ticket.
                </p>
                <div className="space-y-2">
                  <StatusBadge status={ticket.status} className="px-3 py-1" />
                  {ticket.assignedTo && (
                    <Badge variant="secondary">Assigné à {ticket.assignedTo}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
