import { useState, useEffect } from "react";
import api from "../../services/api";
import { 
  Eye, 
  EyeOff,
  Pencil, 
  Trash2, 
  Plus, 
  Search,
  Filter,
  Shield, 
  ChevronDown,
  XCircle,
  User,
  UserX,
  Mail,
  Phone,
  Lock,
  AlertCircle
} from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
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
  const [openDropdown, setOpenDropdown] = useState(null);

  // États pour les Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newUser, setNewUser] = useState({ 
    username: "", email: "", password: "", confirmPassword: "", firstName: "", lastName:"", phoneNumber:"", role: "USER" 
  });

  // --- CONFIGURATION VISUELLE DES FILTRES ---
  const roleStyles = {
    ALL:   { label: "Tous Rôles", color: "bg-white text-slate-700 border-slate-200", icon: Filter },
    ADMIN: { label: "Administrateur", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Shield },
    USER:  { label: "Utilisateur", color: "bg-blue-100 text-blue-700 border-blue-200", icon: User }
  };

  const currentRoleStyle = roleStyles[roleFilter] || roleStyles.ALL;
  const RoleIcon = currentRoleStyle.icon;

  // --- 1. CHARGEMENT DES DONNÉES ---
  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      const baseUsers = res.data.content || res.data || [];
      setUsers(baseUsers);
    } catch (e) {
      console.error("Erreur users", e);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- 2. LOGIQUE DE FILTRAGE ---
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (user.username || "").toLowerCase().includes(searchLower) ||
      (user.email || "").toLowerCase().includes(searchLower) ||
      (user.firstName || "").toLowerCase().includes(searchLower) ||
      (user.lastName || "").toLowerCase().includes(searchLower);

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // --- 3. ACTIONS CRUD ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (newUser.password !== newUser.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    // Validate password length
    if (newUser.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      await api.post('/users', newUser);
      setIsCreateOpen(false);
      setNewUser({ username: "", email: "", password: "", confirmPassword: "", firstName: "", lastName:"", phoneNumber:"", role: "USER" });
      setShowPassword(false);
      setShowConfirmPassword(false);
      fetchUsers();
      toast.success("Utilisateur créé avec succès");
    } catch (err) {
      toast.error(err.response?.data?.message || "Impossible de créer l'utilisateur");
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
      toast.error(err.response?.data?.message || "Erreur lors de la modification");
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
      toast.success("Utilisateur supprimé avec succès");
    } catch (err) {
      toast.error(err.response?.data?.message || "Impossible de supprimer l'utilisateur");
    }
  };

  const openEditModal = (user) => { setSelectedUser(user); setIsEditOpen(true); };
  const openDetailModal = (user) => { setSelectedUser(user); setIsDetailOpen(true); };

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("ALL");
  };

  const activeFiltersCount = [roleFilter !== "ALL"].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      
      {/* Search & Filters Bar - Matching PublicIncidents style */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 backdrop-blur-sm relative z-20">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Search with icon */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <Input
              placeholder="Rechercher par nom, email, username..."
              className="pl-12 h-12 text-base border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Desktop filters */}
          <div className="flex gap-3">
            {/* Role Filter */}
            <div className="relative">
              <button 
                onClick={() => setOpenDropdown(openDropdown === 'ROLE' ? null : 'ROLE')}
                className={`flex h-12 w-[180px] items-center justify-between rounded-xl border px-4 py-2 text-sm font-medium ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all hover:bg-slate-50 ${currentRoleStyle.color}`}
              >
                <div className="flex items-center gap-2">
                  <RoleIcon className="h-4 w-4" />
                  <span>{currentRoleStyle.label}</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>

              {openDropdown === 'ROLE' && (
                <>
                  <div className="fixed inset-0 z-[9998]" onClick={() => setOpenDropdown(null)}></div>
                  <div className="absolute top-full mt-2 left-0 w-[180px] z-[9999] rounded-md border border-slate-200 bg-white shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                    {Object.entries(roleStyles).map(([key, style]) => {
                      const Icon = style.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setRoleFilter(key);
                            setOpenDropdown(null);
                          }}
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

            {/* Create User Button */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/30">
                  <Plus className="w-4 h-4 mr-2" /> Nouvel Utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b border-slate-100">
                  <DialogTitle className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Créer un utilisateur</h3>
                      <p className="text-xs text-slate-500 font-normal mt-0.5">Remplissez les informations ci-dessous</p>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleCreateUser} className="space-y-4 py-1.5">
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="create-firstName" className="text-xs font-semibold text-slate-700">
                        Prénom <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="create-firstName"
                        value={newUser.firstName} 
                        onChange={e => setNewUser({...newUser, firstName: e.target.value})} 
                        placeholder="Jean"
                        className="h-10 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        required 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="create-lastName" className="text-xs font-semibold text-slate-700">
                        Nom <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="create-lastName"
                        value={newUser.lastName} 
                        onChange={e => setNewUser({...newUser, lastName: e.target.value})} 
                        placeholder="Dupont"
                        className="h-10 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        required 
                      />
                    </div>
                  </div>

                  {/* Username & Email */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="create-username" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-indigo-600" />
                        Username <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="create-username"
                        value={newUser.username} 
                        onChange={e => setNewUser({...newUser, username: e.target.value})} 
                        placeholder="jdupont"
                        className="h-10 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        required 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="create-email" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-indigo-600" />
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="create-email"
                        type="email" 
                        value={newUser.email} 
                        onChange={e => setNewUser({...newUser, email: e.target.value})} 
                        placeholder="jean.dupont@example.com"
                        className="h-10 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        required 
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="create-password" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-indigo-600" />
                        Mot de passe <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input 
                          id="create-password"
                          type={showPassword ? "text" : "password"}
                          value={newUser.password} 
                          onChange={e => setNewUser({...newUser, password: e.target.value})} 
                          placeholder="••••••••"
                          className="h-10 pr-9 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          required 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="create-confirmPassword" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-indigo-600" />
                        Confirmer <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input 
                          id="create-confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={newUser.confirmPassword} 
                          onChange={e => setNewUser({...newUser, confirmPassword: e.target.value})} 
                          placeholder="••••••••"
                          className="h-10 pr-9 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          required 
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password hint */}
                  <p className="text-xs text-slate-500 flex items-center gap-1 -mt-2">
                    <AlertCircle className="w-3 h-3" />
                    Le mot de passe doit contenir au moins 6 caractères
                  </p>

                  {/* Phone & Role */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="create-phone" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-indigo-600" />
                        Téléphone <span className="text-slate-400 text-xs font-normal">(optionnel)</span>
                      </Label>
                      <Input 
                        id="create-phone"
                        value={newUser.phoneNumber} 
                        onChange={e => setNewUser({...newUser, phoneNumber: e.target.value})} 
                        placeholder="+33 6 12 34 56 78"
                        className="h-10 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="create-role" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-indigo-600" />
                        Rôle <span className="text-red-500">*</span>
                      </Label>
                      <Select onValueChange={val => setNewUser({...newUser, role: val})} defaultValue="USER">
                        <SelectTrigger id="create-role" className="h-10 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-sm">Utilisateur (USER)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="ADMIN">
                            <div className="flex items-center gap-2">
                              <Shield className="w-3.5 h-3.5 text-purple-600" />
                              <span className="text-sm">Administrateur (ADMIN)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-3 border-t border-slate-100">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => {
                        setIsCreateOpen(false);
                        setNewUser({ username: "", email: "", password: "", confirmPassword: "", firstName: "", lastName:"", phoneNumber:"", role: "USER" });
                        setShowPassword(false);
                        setShowConfirmPassword(false);
                      }}
                      className="flex-1 h-10 text-sm border-slate-200 hover:bg-slate-50"
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-10 text-sm font-semibold shadow-lg shadow-indigo-500/30"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Créer l'utilisateur
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Results info */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <User className="w-4 h-4 text-indigo-600" />
              <span className="text-indigo-600">{filteredUsers.length}</span>
              <span>utilisateur(s)</span>
            </div>
          </div>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <Card className="border-slate-200 shadow-lg relative z-10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                  <TableHead className="font-semibold text-slate-700">Identité</TableHead>
                  <TableHead className="font-semibold text-slate-700">Contact</TableHead>
                  <TableHead className="font-semibold text-slate-700">Rôle</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan="4" className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-slate-500 font-medium">Chargement des utilisateurs...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="4" className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full">
                          <UserX className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-medium">Aucun utilisateur trouvé</p>
                        {(searchTerm || roleFilter !== "ALL") && (
                          <Button variant="outline" size="sm" onClick={resetFilters}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Réinitialiser les filtres
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                      
                      {/* Identity */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg text-indigo-700 font-bold text-sm">
                            {u.firstName?.[0]}{u.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{u.firstName} {u.lastName}</div>
                            <div className="text-xs text-slate-500">@{u.username}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact */}
                      <TableCell className="text-slate-600">
                        <div className="text-sm">{u.email}</div>
                        <div className="text-xs text-slate-400">{u.phoneNumber || "-"}</div>
                      </TableCell>

                      {/* Role */}
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`font-semibold ${u.role === 'ADMIN' 
                            ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-purple-200' 
                            : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200'
                          }`}
                        >
                          {u.role === 'ADMIN' ? (
                            <Shield className="w-3 h-3 mr-1" />
                          ) : (
                            <User className="w-3 h-3 mr-1" />
                          )}
                          {u.role}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openDetailModal(u)} 
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-9 w-9 rounded-lg"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditModal(u)} 
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-9 w-9 rounded-lg"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openDeleteDialog(u)} 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 w-9 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <UserEditDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        onSubmit={handleUpdateUser}
      />

      {/* Details Dialog */}
      <UserDetailsDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        selectedUser={selectedUser}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Confirmer la suppression"
        description={
          <p>
            Voulez-vous vraiment supprimer l'utilisateur{" "}
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