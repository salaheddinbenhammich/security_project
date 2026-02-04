import { useState, useEffect } from "react";
import api from "../../services/api";
import { 
  Eye, 
  Pencil, 
  Trash2, 
  Plus, 
  Search,
  Filter,
  Shield, 
  ChevronDown,
  XCircle,
  User
} from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserEditDialog, UserDetailsDialog } from "@/components/UserModals/UserModals";
import ConfirmDeleteDialog from "@/components/UserModals/ConfirmDeleteDialog";

import { toast } from "sonner";



export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ÉTATS DES FILTRES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [openDropdown, setOpenDropdown] = useState(null); // Pour gérer l'ouverture des menus

  // États pour les Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ 
    username: "", email: "", password: "", firstName: "", lastName:"", phoneNumber:"", role: "USER" 
  });

  // --- CONFIGURATION VISUELLE DES FILTRES ---
  const roleStyles = {
    ALL:   { label: "Tous Rôles", color: "bg-white text-slate-700", icon: Filter },
    ADMIN: { label: "Administrateur", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Shield },
    USER:  { label: "Utilisateur", color: "bg-blue-100 text-blue-700 border-blue-200", icon: User }
  };


  const currentRoleStyle = roleStyles[roleFilter] || roleStyles.ALL;
  const RoleIcon = currentRoleStyle.icon;

  // --- 1. CHARGEMENT DES DONNÉES ---
  const fetchUsers = async () => {
    try {
        const res = await api.get('/users');
        // On récupère la liste (parfois dans 'content' si paginé, sinon direct)
        const baseUsers = res.data.content || res.data || [];
        setUsers(baseUsers);
      } catch (e) {
        console.error("Erreur users", e);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => { fetchUsers(); }, []);

  // --- 2. LOGIQUE DE FILTRAGE ---
  const filteredUsers = users.filter(user => {
      // Filtre Recherche (Nom, Email, Username)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
          (user.username || "").toLowerCase().includes(searchLower) ||
          (user.email || "").toLowerCase().includes(searchLower) ||
          (user.firstName || "").toLowerCase().includes(searchLower) ||
          (user.lastName || "").toLowerCase().includes(searchLower);

      // Filtre Rôle
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      

      return matchesSearch && matchesRole;
  });

  // --- 3. ACTIONS CRUD ---

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
        await api.post('/users', newUser);
        setIsCreateOpen(false);
        setNewUser({ username: "", email: "", password: "", firstName: "", lastName:"", phoneNumber:"", role: "USER" });
        fetchUsers();
         toast.success("Utilisateur créé avec succès");
    } catch (err) {
        toast.error(
          err.response?.data?.message || "Impossible de créer l'utilisateur"
        );

    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
        await api.put(`/users/${selectedUser.id}`, selectedUser);
        setIsEditOpen(false);
        fetchUsers();
        toast.success("Utilisateur mis à jour avec succès");
    } catch (err) {
        toast.error(
          err.response?.data?.message || "Erreur lors de la modification"
        );
    }
  };

  const openDeleteDialog = (user) => {
    setUserToDelete(user);
    setIsDeleteOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/users/${userToDelete.id}`);
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setIsDeleteOpen(false);
      setUserToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || "Impossible de supprimer l'utilisateur");
    }
  };

  // Helpers pour ouvrir les modales
  const openEditModal = (user) => { setSelectedUser(user); setIsEditOpen(true); };
  const openDetailModal = (user) => { setSelectedUser(user); setIsDetailOpen(true); };

  const resetFilters = () => {
      setSearchTerm("");
      setRoleFilter("ALL");
      setStatusFilter("ALL");
  };

  return (
    <div className="p-1 bg-slate-50 min-h-screen space-y-6">
      
      {/* EN-TÊTE */}
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestion des Utilisateurs</h1>
            <p className="text-slate-500 text-sm">{filteredUsers.length} utilisateurs affichés</p>
        </div>
        
        {/* MODALE CRÉATION */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> Nouvel Utilisateur
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Créer un compte</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-3 py-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div><Label>Prénom</Label><Input value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} required /></div>
                        <div><Label>Nom</Label><Input value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} required /></div>
                    </div>
                    <div><Label>Username</Label><Input value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} required /></div>
                    <div><Label>Email</Label><Input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required /></div>
                    <div><Label>Mot de passe</Label><Input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required /></div>
                    <div><Label>Téléphone</Label><Input value={newUser.phoneNumber} onChange={e => setNewUser({...newUser, phoneNumber: e.target.value})} /></div>
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

      {/* --- BARRE DE FILTRES (Style identique aux tickets) --- */}
      <Card>
        <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
                
                {/* 1. Recherche */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Rechercher (Nom, Email, Username)..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                            <XCircle className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* 2. FILTRE RÔLE */}
                <div className="relative">
                    <button 
                        onClick={() => setOpenDropdown(openDropdown === 'ROLE' ? null : 'ROLE')}
                        className={`flex h-10 w-[180px] items-center justify-between rounded-md border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 ${currentRoleStyle.color} ${roleFilter === 'ALL' ? 'border-slate-200' : 'border'}`}
                    >
                        <div className="flex items-center gap-2">
                            <RoleIcon className="h-4 w-4" />
                            <span className="truncate">{currentRoleStyle.label}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>

                    {openDropdown === 'ROLE' && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)}></div>
                            <div className="absolute top-full mt-2 left-0 w-[180px] z-20 rounded-md border border-slate-200 bg-white shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                                {Object.entries(roleStyles).map(([key, style]) => {
                                    const Icon = style.icon;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => { setRoleFilter(key); setOpenDropdown(null); }}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${roleFilter === key ? 'bg-slate-100 font-medium' : ''}`}
                                        >
                                            <div className={`p-1 rounded-full border ${key === 'ALL' ? 'bg-slate-100 border-slate-200' : style.color}`}>
                                                <Icon className="h-3 w-3" />
                                            </div>
                                            <span className="text-slate-700">{style.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

              

                {/* Reset Filters */}
                {(searchTerm || roleFilter !== "ALL" ) && (
                    <Button variant="ghost" onClick={resetFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        Effacer filtres
                    </Button>
                )}
            </div>
        </CardContent>
      </Card>

      {/* TABLEAU DES UTILISATEURS */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Identité</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-slate-500">Chargement...</td></tr>
              ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-slate-500">Aucun utilisateur trouvé.</td></tr>
              ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id} className="hover:bg-slate-50/50">
                      
                      {/* Identité */}
                      <TableCell>
                        <div className="font-medium text-slate-900">{u.firstName} {u.lastName}</div>
                        <div className="text-xs text-slate-500">@{u.username}</div>
                      </TableCell>

                      {/* Contact */}
                      <TableCell className="text-slate-600">
                        <div className="text-sm">{u.email}</div>
                        <div className="text-xs text-slate-400">{u.phoneNumber || "-"}</div>
                      </TableCell>

                      {/* Rôle */}
                      <TableCell>
                        <Badge variant="outline" className={u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
                            {u.role}
                        </Badge>
                      </TableCell>
                      {/* ACTIONS */}
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openDetailModal(u)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8">
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(u)} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-8 w-8">
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(u)} className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- MODALE D'ÉDITION --- */}
      <UserEditDialog
      open={isEditOpen}
      onOpenChange={setIsEditOpen}
      selectedUser={selectedUser}
      setSelectedUser={setSelectedUser}
      onSubmit={handleUpdateUser}
    />

      {/* --- MODALE DE DÉTAILS (CORRIGÉE) --- */}
      <UserDetailsDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        selectedUser={selectedUser}
      />

    <ConfirmDeleteDialog
      open={isDeleteOpen}
      onOpenChange={setIsDeleteOpen}
      title="Confirmer la suppression"
      description={
        <p>
          Voulez-vous vraiment supprimer l’utilisateur{" "}
          <span className="font-semibold">
            {userToDelete?.firstName} {userToDelete?.lastName}
          </span>{" "}
          ?
        </p>
      }
      onConfirm={confirmDeleteUser}
    />

    </div>
  );
}