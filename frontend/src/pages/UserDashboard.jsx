import { useState } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge" 

// Données complètes (titre + description + priorité)
const FAKE_TICKETS = [
  { 
    id: 1, 
    title: "Problème réseau étage 3", 
    description: "Impossible d'accéder à internet depuis 10h",
    priority: "HAUTE",
    status: "OPEN", 
    date: "2026-01-30 10:15" 
  },
  { 
    id: 2, 
    title: "Imprimante HP bloquée", 
    description: "Erreur papier depuis hier",
    priority: "MOYENNE",
    status: "IN_PROGRESS", 
    date: "2026-01-29 14:22" 
  },
];

function StatusBadge({ status }) {
  return (
    <Badge className={`${
      status === 'OPEN' ? 'bg-green text-green-800' :
      status === 'IN_PROGRESS' ? 'bg-blue text-blue-800' :
      'bg-gray text-gray-800'
    }`}>
      {status}
    </Badge>
  );
}

export default function UserDashboard() {
  const [tickets, setTickets] = useState(FAKE_TICKETS);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MOYENNE"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTicket = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: "OPEN",
      date: new Date().toLocaleString("fr-FR")
    };
    setTickets([newTicket, ...tickets]);
    setFormData({ title: "", description: "", priority: "MOYENNE" });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* Header */}
      <div className="text-center mb-8 border-b pb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Mon Espace Utilisateur
        </h1>
        <p className="text-xl text-gray-600">Créer & suivre mes tickets</p>
      </div>

      {/* Formulaire NOUVEAU TICKET */}
      <Card className="shadow-xl mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 Nouveau ticket
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titre *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Imprimante bloquée étage 2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-32"
                placeholder="Décrivez précisément le problème..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Priorité</label>
              <select 
                value={formData.priority} 
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="FAIBLE">Faible</option>
                <option value="MOYENNE">Moyenne</option>
                <option value="HAUTE">Haute</option>
              </select>
            </div>
            
            <Button type="submit" className="w-full">📤 Créer mon ticket</Button>
          </form>
        </CardContent>
      </Card>

      {/* Liste MES TICKETS */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎫 Mes tickets ({tickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 pt-0">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium hover:text-indigo-600 cursor-pointer">
                  <Link to={`/user/ticket/${ticket.id}`}>
                    {ticket.title}
                  </Link>
                </CardTitle>
                <StatusBadge status={ticket.status} />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Priorité: <strong>{ticket.priority}</strong></span>
                  <span>• Créé le {ticket.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-4 justify-center pt-8 mt-8 border-t">
        <Button asChild variant="outline">
          <Link to="/">← Incidents publics</Link>
        </Button>
      </div>
    </div>
  );
}
