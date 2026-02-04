import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  // État pour le formulaire de création
  const [newUser, setNewUser] = useState({ 
    username: "", email: "", password: "", firstName: "", lastName:"", phoneNumber:"", role: "USER" 
  });

  const fetchUsers = async () => {
    try {
        const res = await api.get('/users');
        // Ton backend retourne une Page, donc les users sont dans res.data.content
            const baseUsers = res.data.content || [];

        // enrichir avec enabled + lock flags
        const detailed = await Promise.all(
          baseUsers.map(async (u) => {
            const detail = await api.get(`/users/${u.id}`);
            return { ...u, ...detail.data };
          })
        );

        setUsers(detailed);
      } catch (e) {
        console.error("Erreur users", e);
      }
    };

  useEffect(() => { fetchUsers(); }, []);

  // Création
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
        await api.post('/users', newUser);
        setIsOpen(false);
        fetchUsers();
        alert("Utilisateur créé avec succès !");
    } catch (err) {
        alert("Erreur lors de la création : " + (err.response?.data?.message || "Erreur inconnue"));
    }
  };

  // Activation / Désactivation
  const toggleUserStatus = async (user) => {
    try {
        // On inverse le booléen enabled
        await api.put(`/users/${user.id}`, {
            ...user, 
            enabled: !user.enabled 
        });
        fetchUsers(); // On recharge pour voir le changement
    } catch (err) {
        alert("Impossible de modifier le statut");
    }
  };

  return (
    <div className="p-1 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
        <div className="flex gap-4">             
             {/* MODALE DE CRÉATION */}
             <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild><Button>+ Nouvel Utilisateur</Button></DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Créer un compte</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-3 py-4">
                    <div className="grid grid-cols-2 gap-2">
                        <div><Label>Prénom</Label><Input onChange={e => setNewUser({...newUser, firstName: e.target.value})} required /></div>
                        <div><Label>Nom</Label><Input onChange={e => setNewUser({...newUser, lastName: e.target.value})} required /></div>
                    </div>
                    <div><Label>Username</Label><Input onChange={e => setNewUser({...newUser, username: e.target.value})} required /></div>
                    <div><Label>Email</Label><Input type="email" onChange={e => setNewUser({...newUser, email: e.target.value})} required /></div>
                    <div><Label>Mot de passe</Label><Input type="password" onChange={e => setNewUser({...newUser, password: e.target.value})} required /></div>
                    <div><Label>Téléphone</Label><Input onChange={e => setNewUser({...newUser, phoneNumber: e.target.value})} /></div>
                    <div>
                        <Label>Rôle</Label>
                        <Select onValueChange={val => setNewUser({...newUser, role: val})} defaultValue="USER">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USER">Utilisateur (USER)</SelectItem>
                                <SelectItem value="ADMIN">Administrateur (ADMIN)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full mt-4">Confirmer la création</Button>
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Comptes enregistrés</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>État</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {u.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {u.enabled ? 
                        <span className="text-green-600 font-bold text-xs">ACTIF</span> : 
                        <span className="text-red-500 font-bold text-xs">DÉSACTIVÉ</span>
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Label className="text-xs text-slate-500">Activer/Désactiver</Label>
                        <Switch 
                            checked={u.enabled} 
                            onCheckedChange={() => toggleUserStatus(u)} 
                        />
                    </div>
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