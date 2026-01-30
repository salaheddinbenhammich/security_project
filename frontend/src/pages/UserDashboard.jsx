import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge" 

// Fausses données pour travailler sans Backend
const FAKE_TICKETS = [
  { id: 1, title: "Bug sur le Login", status: "OPEN", date: "2026-01-30" },
  { id: 2, title: "Erreur 404 page accueil", status: "IN_PROGRESS", date: "2026-01-29" },
  { id: 3, title: "Demande de compte", status: "CLOSED", date: "2026-01-28" },
];

export default function UserDashboard() {
  // Au début, on met les fake tickets dans l'état
  const [tickets, setTickets] = useState(FAKE_TICKETS);

  // Pour l'instant, pas de useEffect car on n'appelle pas l'API
  /*
  useEffect(() => {
    api.get('/tickets/my').then(res => setTickets(res.data));
  }, []);
  */

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mes Tickets</h1>
        <Button>+ Nouveau Ticket</Button>
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {ticket.title}
              </CardTitle>
              {/* Petite logique couleur pour le statut */}
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                ticket.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                ticket.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {ticket.status}
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Créé le : {ticket.date}</p>
              <div className="mt-4 flex gap-2">
                 <Button variant="outline" size="sm">Voir détails</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}