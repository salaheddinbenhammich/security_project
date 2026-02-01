import { useParams, Link } from "react-router-dom";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card"; 
import { Button } from "@/components/ui/button";    
import { Badge } from "@/components/ui/badge";      

export default function UserTicketDetail() {
  const { id } = useParams();
  
  const ticket = {
    id: parseInt(id || "1"),
    title: "Problème réseau étage 3",
    description: "Impossible d'accéder à internet depuis 10h. Affecte toute l'équipe dev.",
    priority: "HAUTE",
    status: "OPEN",
    category: "NETWORK",
    createdAt: "2026-01-30 10:15",
    assignedTo: null
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header + Back */}
        <div className="flex items-center gap-4">
          <Button asChild variant="outline">
            <Link to="/user">← Retour mes tickets</Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex-1">
            Ticket #{ticket.id}
          </h1>
        </div>

        {/* Détails */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{ticket.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-900 leading-relaxed">{ticket.description}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="text-gray-500 block">Priorité</span><div className="font-semibold">{ticket.priority}</div></div>
              <div><span className="text-gray-500 block">Statut</span><Badge variant="destructive">{ticket.status}</Badge></div>
              <div><span className="text-gray-500 block">Catégorie</span><div>{ticket.category}</div></div>
              <div><span className="text-gray-500 block">Créé le</span><div>{ticket.createdAt}</div></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mes actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-4">Suivez l'évolution de votre ticket.</p>
            <Button asChild>
              <Link to="/user">← Voir tous mes tickets</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
