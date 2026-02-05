import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Shield } from "lucide-react";

// 1) EDIT DIALOG - MATCHES CREATE FORM STYLE (NO PASSWORD FOR SECURITY)
export function UserEditDialog({ open, onOpenChange, selectedUser, setSelectedUser, onSubmit }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center shadow-lg w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Modifier l'utilisateur</h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">Mettez à jour les informations ci-dessous</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {selectedUser && (
          <form onSubmit={onSubmit} className="space-y-4 py-1.5">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-firstName" className="text-xs font-semibold text-slate-700">
                  Prénom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-firstName"
                  value={selectedUser.firstName || ""}
                  onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                  placeholder="Jean"
                  className="h-10 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-lastName" className="text-xs font-semibold text-slate-700">
                  Nom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-lastName"
                  value={selectedUser.lastName || ""}
                  onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                  placeholder="Dupont"
                  className="h-10 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>
            </div>

            {/* Username & Email */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-username" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-indigo-600" />
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-username"
                  value={selectedUser.username || ""}
                  onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                  placeholder="jdupont"
                  className="h-10 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-email" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-indigo-600" />
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedUser.email || ""}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  placeholder="jean.dupont@example.com"
                  className="h-10 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>
            </div>

            {/* Phone & Role */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-indigo-600" />
                  Téléphone <span className="text-xs font-normal text-slate-400">(optionnel)</span>
                </Label>
                <Input
                  id="edit-phone"
                  value={selectedUser.phoneNumber || ""}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
                  placeholder="+33 6 12 34 56 78"
                  className="h-10 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-role" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-indigo-600" />
                  Rôle <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedUser.role || "USER"}
                  onValueChange={(val) => setSelectedUser({ ...selectedUser, role: val })}
                >
                  <SelectTrigger id="edit-role" className="h-10 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200">
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

            {/* Security Note - Why no password field */}
            <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-900">Note de sécurité</p>
                  <p className="mt-1 text-xs text-blue-700">
                    Pour des raisons de sécurité, les administrateurs ne peuvent pas modifier les mots de passe. 
                    Les utilisateurs doivent changer leur mot de passe via leur profil.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-10 text-sm border-slate-200 hover:bg-slate-50"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1 h-10 text-sm font-semibold shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/30"
              >
                <User className="w-4 h-4 mr-2" />
                Mettre à jour
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// 2) DETAILS DIALOG - KEPT AS IS
export function UserDetailsDialog({ open, onOpenChange, selectedUser }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Détails du compte utilisateur</DialogTitle></DialogHeader>

        {selectedUser && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                  selectedUser.role === "ADMIN"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {(selectedUser.username || "").substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <p className="text-slate-500 text-sm">@{selectedUser.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-slate-500">ID Unique</Label>
                <p className="font-mono text-xs">{selectedUser.id}</p>
              </div>
              <div>
                <Label className="text-slate-500">Rôle</Label>
                <p className="font-medium">{selectedUser.role}</p>
              </div>
              <div>
                <Label className="text-slate-500">Email</Label>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <Label className="text-slate-500">Téléphone</Label>
                <p className="font-medium">{selectedUser.phoneNumber || "Non renseigné"}</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}