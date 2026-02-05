import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserMinus,
  Unlock
} from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserEditDialog } from "@/components/UserModals/UserModals";
import ConfirmDeleteDialog from "@/components/UserModals/ConfirmDeleteDialog";

import { toast } from "sonner";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ÉTATS DES FILTRES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [openDropdown, setOpenDropdown] = useState(null);

  // États pour les Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newUser, setNewUser] = useState({ 
    username: "", email: "", password: "", confirmPassword: "", firstName: "", lastName:"", phoneNumber:"", role: "USER" 
  });
  
  // --- PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // --- CONFIGURATION VISUELLE DES FILTRES ---
  const roleStyles = {
    ALL:   { label: "Tous Rôles", color: "bg-white text-slate-700 border-slate-200", icon: Filter },
    ADMIN: { label: "Administrateur", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Shield },
    USER:  { label: "Utilisateur", color: "bg-blue-100 text-blue-700 border-blue-200", icon: User }
  };

  const statusStyles = {
    ALL: { label: "Tous Statuts", color: "bg-white text-slate-700 border-slate-200", icon: Filter },
    ACTIVE: { label: "Actif", color: "bg-green-100 text-green-700 border-green-200", icon: UserCheck },
    DISABLED: { label: "Désactivé", color: "bg-red-100 text-red-700 border-red-200", icon: UserMinus },
    LOCKED: { label: "Verrouillé", color: "bg-orange-100 text-orange-700 border-orange-200", icon: Lock },
    DELETED: { label: "Supprimé", color: "bg-rose-100 text-rose-700 border-rose-200", icon: Trash2 }
  };

  const currentRoleStyle = roleStyles[roleFilter] || roleStyles.ALL;
  const currentStatusStyle = statusStyles[statusFilter] || statusStyles.ALL;
  const RoleIcon = currentRoleStyle.icon;
  const StatusIcon = currentStatusStyle.icon;

  // --- 1. CHARGEMENT DES DONNÉES ---
  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      const baseUsers = res.data.content || res.data || [];
      console.log("Fetched users:", baseUsers); // Debug log
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

    let matchesStatus = true;
    if (statusFilter === "ACTIVE") {
      // Check if enabled is explicitly true and accountNonLocked is not false
      matchesStatus = (user.enabled === true || user.enabled === undefined) && 
                     (user.accountNonLocked === true || user.accountNonLocked === undefined);
    } else if (statusFilter === "DISABLED") {
      matchesStatus = user.enabled === false;
    } else if (statusFilter === "LOCKED") {
    } else if (statusFilter === "DELETED") {
      matchesStatus = user.deleted === true;
      matchesStatus = user.accountNonLocked === false;
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  // --- 3. ACTIONS CRUD ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (newUser.password !== newUser.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

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
      fetchUsers(); // refetch from server to get updated data
    toast.success("Utilisateur supprimé avec succès");
    } catch (err) {
      toast.error(err.response?.data?.message || "Impossible de supprimer l'utilisateur");
    }
  };

  // --- NEW ACCOUNT MANAGEMENT ACTIONS ---
  const handleEnableUser = async (userId) => {
    try {
      await api.put(`/users/${userId}/enable`);
      fetchUsers();
      toast.success("Compte activé avec succès");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'activation");
    }
  };

  const handleDisableUser = async (userId) => {
    try {
      await api.put(`/users/${userId}/disable`);
      fetchUsers();
      toast.success("Compte désactivé avec succès");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la désactivation");
    }
  };

  const handleUnlockUser = async (userId) => {
    try {
      await api.put(`/users/${userId}/unlock`);
      fetchUsers();
      toast.success("Compte déverrouillé avec succès");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors du déverrouillage");
    }
  };

  const openEditModal = (user) => { setSelectedUser(user); setIsEditOpen(true); };
  const openDetailModal = (user) => { 
    navigate(`/admin/users/${user.id}`);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
  };

  const activeFiltersCount = [roleFilter !== "ALL", statusFilter !== "ALL"].filter(Boolean).length;

  // Helper function to get user status
  const getUserStatus = (user) => {
    // Handle cases where fields might be undefined
    const isLocked = user.accountNonLocked === false;
    const isDisabled = user.enabled === false;
    
    if (isLocked) return "LOCKED";
    if (isDisabled) return "DISABLED";
    return "ACTIVE";
  };

  const getUserStatusBadge = (user) => {
    const status = getUserStatus(user);
    
    
    if (user.deleted === true) {
      return (
        <Badge variant="outline" className="font-semibold text-rose-700 bg-rose-100 border-rose-200">
          <Trash2 className="w-3 h-3 mr-1" />
          Supprimé
        </Badge>
      );
    }
    if (status === "LOCKED") {
      return (
        <Badge variant="outline" className="font-semibold text-orange-700 bg-orange-100 border-orange-200">
          <Lock className="w-3 h-3 mr-1" />
          Verrouillé
        </Badge>
      );
    }
    
    if (status === "DISABLED") {
      return (
        <Badge variant="outline" className="font-semibold text-red-700 bg-red-100 border-red-200">
          <UserMinus className="w-3 h-3 mr-1" />
          Désactivé
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="font-semibold text-green-700 bg-green-100 border-green-200">
        <UserCheck className="w-3 h-3 mr-1" />
        Actif
      </Badge>
    );
  };

  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return "-";
    
    try {
      return new Date(lastLogin).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "-";
    }
  };

  return (
    <div className="relative mx-auto space-y-6 max-w-7xl">
      
      {/* Search & Filters Bar */}
      <div className="relative z-20 p-6 bg-white border shadow-xl rounded-2xl border-slate-200 shadow-slate-200/50 backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          
          {/* Search with icon */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 flex items-center pointer-events-none left-4">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <Input
              placeholder="Rechercher par nom, email, username..."
              className="h-12 pl-12 text-base transition-all border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 flex items-center right-3 text-slate-400 hover:text-slate-600"
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
                  <RoleIcon className="w-4 h-4" />
                  <span>{currentRoleStyle.label}</span>
                </div>
                <ChevronDown className="w-4 h-4 opacity-50" />
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
                            <Icon className="w-3 h-3" />
                          </div>
                          <span className="text-slate-700">{style.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button 
                onClick={() => setOpenDropdown(openDropdown === 'STATUS' ? null : 'STATUS')}
                className={`flex h-12 w-[160px] items-center justify-between rounded-xl border px-4 py-2 text-sm font-medium ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all hover:bg-slate-50 ${currentStatusStyle.color}`}
              >
                <div className="flex items-center gap-2">
                  <StatusIcon className="w-4 h-4" />
                  <span>{currentStatusStyle.label}</span>
                </div>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </button>

              {openDropdown === 'STATUS' && (
                <>
                  <div className="fixed inset-0 z-[9998]" onClick={() => setOpenDropdown(null)}></div>
                  <div className="absolute top-full mt-2 left-0 w-[160px] z-[9999] rounded-md border border-slate-200 bg-white shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                    {Object.entries(statusStyles).map(([key, style]) => {
                      const Icon = style.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setStatusFilter(key);
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${statusFilter === key ? 'bg-slate-100 font-medium' : ''}`}
                        >
                          <div className={`p-1 rounded-full border ${key === 'ALL' ? 'bg-slate-100 border-slate-200' : style.color}`}>
                            <Icon className="w-3 h-3" />
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
                <Button className="h-12 font-semibold text-white shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/30">
                  <Plus className="w-4 h-4 mr-2" /> Nouvel Utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b border-slate-100">
                  <DialogTitle className="flex items-center gap-3">
                    <div className="flex items-center justify-center shadow-lg w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
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
                          className="h-10 text-sm pr-9 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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
                          className="h-10 text-sm pr-9 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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
                  <p className="flex items-center gap-1 -mt-2 text-xs text-slate-500">
                    <AlertCircle className="w-3 h-3" />
                    Le mot de passe doit contenir au moins 6 caractères
                  </p>

                  {/* Phone & Role */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="create-phone" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-indigo-600" />
                        Téléphone <span className="text-xs font-normal text-slate-400">(optionnel)</span>
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
                      className="flex-1 h-10 text-sm font-semibold shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/30"
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
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-700">
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
      <Card className="relative z-10 shadow-lg border-slate-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-gradient-to-r from-slate-50 to-white border-slate-200">
                  <TableHead className="font-semibold text-slate-700">Identité</TableHead>
                  <TableHead className="font-semibold text-slate-700">Contact</TableHead>
                  <TableHead className="font-semibold text-slate-700">Rôle</TableHead>
                  <TableHead className="font-semibold text-slate-700">Statut</TableHead>
                  <TableHead className="font-semibold text-slate-700">Dernière Connexion</TableHead>
                  <TableHead className="font-semibold text-right text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan="6" className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin" />
                        <p className="font-medium text-slate-500">Chargement des utilisateurs...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="6" className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100">
                          <UserX className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="font-medium text-slate-600">Aucun utilisateur trouvé</p>
                        {(searchTerm || roleFilter !== "ALL" || statusFilter !== "ALL") && (
                          <Button variant="outline" size="sm" onClick={resetFilters}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Réinitialiser les filtres
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((u) => (
                    <TableRow key={u.id} className="transition-colors border-b hover:bg-slate-50/50 border-slate-100">
                      
                      {/* Identity */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-indigo-700 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
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

                      {/* Status */}
                      <TableCell>
                        {getUserStatusBadge(u)}
                      </TableCell>

                      {/* Last Login */}
                      <TableCell className="text-sm text-slate-600">
                        {formatLastLogin(u.lastLogin)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Details */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openDetailModal(u)} 
                            className="text-blue-600 rounded-lg hover:text-blue-700 hover:bg-blue-50 h-9 w-9"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {/* Enable/Disable Toggle */}
                          {u.enabled === false ? (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEnableUser(u.id)} 
                              className="text-green-600 rounded-lg hover:text-green-700 hover:bg-green-50 h-9 w-9"
                              title="Activer le compte"
                            >
                              <UserCheck className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDisableUser(u.id)} 
                              className="text-orange-600 rounded-lg hover:text-orange-700 hover:bg-orange-50 h-9 w-9"
                              title="Désactiver le compte"
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          )}

                          {/* Unlock if locked */}
                          {u.accountNonLocked === false && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleUnlockUser(u.id)} 
                              className="text-purple-600 rounded-lg hover:text-purple-700 hover:bg-purple-50 h-9 w-9"
                              title="Déverrouiller le compte"
                            >
                              <Unlock className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {/* Edit */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditModal(u)} 
                            className="rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-9 w-9"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          {/* Delete */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openDeleteDialog(u)} 
                            className="text-red-600 rounded-lg hover:text-red-700 hover:bg-red-50 h-9 w-9"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Pagination - Same as before */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-6 mt-8">
          <div className="text-sm font-medium text-slate-600">
            Page <span className="font-bold text-indigo-600">{currentPage}</span> sur{" "}
            <span className="font-bold text-indigo-600">{totalPages}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative flex items-center justify-center w-10 h-10 transition-all duration-300 bg-white border group rounded-xl border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 hover:scale-110 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <ChevronLeft className="w-4 h-4 transition-colors text-slate-600 group-hover:text-indigo-600" />
            </button>
            
            {/* Page numbers logic here - keep as before */}
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative flex items-center justify-center w-10 h-10 transition-all duration-300 bg-white border group rounded-xl border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 hover:scale-110 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <ChevronRight className="w-4 h-4 transition-colors text-slate-600 group-hover:text-indigo-600" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <UserEditDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        onSubmit={handleUpdateUser}
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