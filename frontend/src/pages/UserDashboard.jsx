import { useState } from "react";
import { Link } from "react-router-dom";
import { mockUserTickets } from "@/lib/mockUserTickets";
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
  const variant = status === "OPEN" ? "destructive" : 
          status === "IN_PROGRESS" ? "secondary" : "default";
  return <Badge variant={variant} className={className}>{status}</Badge>;
}

export default function UserDashboard() {
  const [tickets, setTickets] = useState(mockUserTickets);
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
      createdAt: new Date().toLocaleString("fr-FR")
    };
    
    setTickets([newTicket, ...tickets]);
    setFormData({ title: "", description: "", priority: "MOYENNE" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center border-b pb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Mon Espace Utilisateur
          </h1>
          <p className="text-xl text-gray-600">Créer & suivre mes tickets</p>
        </div>

        {/* 1️⃣ CRÉER TICKET (POST /api/tickets) */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📝 Nouveau ticket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Imprimante bloquée étage 2"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description détaillée *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Décrivez précisément le problème..."
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <Label>Priorité</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FAIBLE">Faible</SelectItem>
                    <SelectItem value="MOYENNE">Moyenne</SelectItem>
                    <SelectItem value="HAUTE">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full">
                📤 Créer mon ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 2️⃣ MES TICKETS AVEC LIENS DÉTAIL (GET /api/tickets/mytickets) */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎫 Mes tickets ({tickets.length})
            </CardTitle>
            <CardDescription>Tickets créés par moi (utilisateur connecté)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 border rounded-xl hover:shadow-lg transition-all bg-white">
                <div className="flex-1 space-y-2">
                  <div className="font-bold text-xl group-hover:text-indigo-600">
                    <Link to={`/user/ticket/${ticket.id}`} className="hover:underline">
                      {ticket.title}
                    </Link>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{ticket.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Priorité: <span className="font-semibold">{ticket.priority}</span></span>
                    <span>• Créé le {ticket.createdAt}</span>
                  </div>
                </div>
                <StatusBadge status={ticket.status} className="mt-2 md:mt-0" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4 justify-center pt-8 border-t">
          <Button asChild variant="outline" size="lg">
            <Link to="/">← Voir incidents publics</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
