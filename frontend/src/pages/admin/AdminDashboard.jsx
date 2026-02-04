import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");

  const fetchTickets = async () => {
    try {
        const res = await api.get('/tickets'); 
        setTickets(res.data);
    } catch (err) {
        console.error("Erreur chargement tickets", err);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  // Changer le statut d'un ticket
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
        // PUT /api/tickets/{id}/status
        await api.put(`/tickets/${ticketId}/status`, { status: newStatus });
        fetchTickets(); 
    } catch (err) {
        alert("Erreur lors de la mise à jour");
    }
  };

  //Filtrage local
  const filteredTickets = tickets.filter(t => {
    return (filterStatus === "ALL" || t.status === filterStatus) &&
           (filterPriority === "ALL" || t.priority === filterPriority);
  });

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Supervision Admin</h1>
        <div className="space-x-4">
            <Link to="/admin/users">
                <Button variant="outline">👥 Gérer les Utilisateurs</Button>
            </Link>
            <Button variant="destructive" onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }}>Déconnexion</Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm">
        <Select onValueChange={setFilterStatus} defaultValue="ALL">
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="ALL">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente (Pending)</SelectItem>
                <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                <SelectItem value="RESOLVED">Résolu</SelectItem>
                <SelectItem value="CLOSED">Fermé</SelectItem>
            </SelectContent>
        </Select>

        <Select onValueChange={setFilterPriority} defaultValue="ALL">
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Priorité" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="ALL">Toutes priorités</SelectItem>
                <SelectItem value="LOW">Faible</SelectItem>
                <SelectItem value="MEDIUM">Moyenne</SelectItem>
                <SelectItem value="HIGH">Haute</SelectItem>
                <SelectItem value="CRITICAL">Critique</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader><CardTitle>Liste Globale ({filteredTickets.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Statut Actuel</TableHead>
                <TableHead>Changer Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.title}</TableCell>
                  <TableCell>{ticket.createdBy?.username || "N/A"}</TableCell>
                  <TableCell>
                    <Badge className={
                        ticket.priority === 'CRITICAL' ? 'bg-red-600' : 
                        ticket.priority === 'HIGH' ? 'bg-orange-500' : 'bg-slate-500'
                    }>
                        {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {/* Select rapide pour changer le statut */}
                    <Select 
                        defaultValue={ticket.status} 
                        onValueChange={(val) => handleStatusChange(ticket.id, val)}
                    >
                        <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}