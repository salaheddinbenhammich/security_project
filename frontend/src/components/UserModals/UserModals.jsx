import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 1) EDIT DIALOG
export function UserEditDialog({ open, onOpenChange, selectedUser, setSelectedUser, onSubmit }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Modifier l'utilisateur</DialogTitle></DialogHeader>

        {selectedUser && (
          <form onSubmit={onSubmit} className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Prénom</Label>
                <Input
                  value={selectedUser.firstName}
                  onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label>Nom</Label>
                <Input
                  value={selectedUser.lastName}
                  onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
              />
            </div>

            <div>
              <Label>Téléphone</Label>
              <Input
                value={selectedUser.phoneNumber || ""}
                onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
              />
            </div>

            <div>
              <Label>Rôle</Label>
              <Select
                value={selectedUser.role}
                onValueChange={(val) => setSelectedUser({ ...selectedUser, role: val })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full mt-2 bg-amber-600 hover:bg-amber-700">
              Sauvegarder
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// 2) DETAILS DIALOG
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
