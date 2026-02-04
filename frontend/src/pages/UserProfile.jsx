import { useState, useEffect } from "react";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";
import { User, Lock, Save, Mail, Phone, Shield } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // État pour les infos personnelles
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    role: ""
  });

  // État pour le changement de mot de passe
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // 1. Chargement des données de l'utilisateur connecté
  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        const id = decoded.userId || decoded.id || decoded.sub;
        setUserId(id);

        const res = await api.get(`/users/${id}`);
        setFormData({
          username: res.data.username,
          email: res.data.email,
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          phoneNumber: res.data.phoneNumber || "",
          role: res.data.role
        });
      } catch (err) {
        console.error(err);
        toast.error("Impossible de charger votre profil");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfile();
  }, []);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber
      };

      await api.put(`/users/me/${userId}`, dataToSend);
      
      toast.success("Informations mises à jour avec succès");
    } catch (err) {
      console.error(err);
      toast.error("Erreur : " + (err.response?.data?.message || "Accès refusé (403)"));
    }
  };

  // Mise à jour du Mot de passe
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passData.currentPassword) {
      toast.error("Veuillez entrer votre mot de passe actuel");
      return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (passData.newPassword.length < 6) {
      toast.error("Le nouveau mot de passe doit faire au moins 6 caractères");
      return;
    }

    try {
      await api.put(`/users/${userId}/password`, {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      
      // Reset du formulaire
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Mot de passe modifié avec succès !");
    } catch (err) {
      console.error(err);
      // Gestion des erreurs spécifiques (ex: ancien mot de passe incorrect)
      const message = err.response?.data?.message || "Erreur : Mot de passe actuel incorrect ou format invalide.";
      toast.error(message);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Chargement du profil...</div>;

  return (
    <div className="p-1 bg-slate-50 min-h-screen space-y-8">
      
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mon Profil</h1>
        <p className="text-slate-500">Gérez vos informations personnelles et votre sécurité.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : Informations */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Informations Personnelles
              </CardTitle>
              <CardDescription>Mettez à jour vos coordonnées.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateInfo} className="space-y-4">
                
                {/* Ligne Nom / Prénom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input 
                      id="firstName" 
                      value={formData.firstName} 
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input 
                      id="lastName" 
                      value={formData.lastName} 
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Email
                    </Label>
                    <Input 
                      value={formData.email} 
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Shield className="w-3 h-3" /> Username
                    </Label>
                    <Input 
                      value={formData.username} 
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Téléphone
                  </Label>
                  <Input 
                    id="phone" 
                    value={formData.phoneNumber} 
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                    placeholder="+33 6..."
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" /> Enregistrer les modifications
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* COLONNE DROITE : Sécurité */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-600" />
                Sécurité
              </CardTitle>
              <CardDescription>Changez votre mot de passe.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="currentPass" className="text-slate-700 font-semibold">
                    Mot de passe actuel
                  </Label>
                  <Input 
                    id="currentPass" 
                    type="password" 
                    value={passData.currentPassword}
                    onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <Separator className="my-2" />

                <div className="space-y-2">
                  <Label htmlFor="newPass">Nouveau mot de passe</Label>
                  <Input 
                    id="newPass" 
                    type="password" 
                    value={passData.newPassword}
                    onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPass">Confirmer le nouveau mot de passe</Label>
                  <Input 
                    id="confirmPass" 
                    type="password" 
                    value={passData.confirmPassword}
                    onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <Separator className="my-4" />

                <Button type="submit" variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800">
                  Mettre à jour le mot de passe
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Carte Rôle (Info seulement) */}
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Votre Rôle</p>
                <p className="text-lg font-bold text-slate-800">{formData.role}</p>
              </div>
              <Shield className="w-8 h-8 text-slate-300" />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}