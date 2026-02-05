import { useState, useEffect } from "react";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";
import { User, Lock, Save, Mail, Phone, Shield, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
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

  // État pour la visibilité des mots de passe
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <User className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600 animate-pulse" />
        </div>
        <p className="mt-4 text-slate-600 font-medium">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header with gradient */}
      {/* <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-8 shadow-xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
        
        <div className="relative flex items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Mon Profil</h1>
            <p className="text-indigo-100 mt-1">Gérez vos informations personnelles et votre sécurité</p>
          </div>
        </div>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN - Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2.5 text-slate-900">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-md">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    Informations Personnelles
                  </CardTitle>
                  <CardDescription className="mt-2">Mettez à jour vos coordonnées</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Rôle:</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${
                    formData.role === 'ADMIN' 
                      ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200' 
                      : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200'
                  }`}>
                    <Shield className="w-3.5 h-3.5" />
                    {formData.role}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpdateInfo} className="space-y-5">
                
                {/* First Name / Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                      Prénom
                    </Label>
                    <Input 
                      id="firstName" 
                      value={formData.firstName} 
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                      Nom
                    </Label>
                    <Input 
                      id="lastName" 
                      value={formData.lastName} 
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                </div>

                {/* Email / Username */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Mail className="w-4 h-4 text-indigo-600" /> Email
                    </Label>
                    <Input 
                      id="email"
                      value={formData.email} 
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      type="email"
                      className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Shield className="w-4 h-4 text-indigo-600" /> Nom d'utilisateur
                    </Label>
                    <Input 
                      id="username"
                      value={formData.username} 
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Phone className="w-4 h-4 text-indigo-600" /> Téléphone
                  </Label>
                  <Input 
                    id="phone" 
                    value={formData.phoneNumber} 
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                    placeholder="+33 6 12 34 56 78"
                    className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <div className="pt-4 flex justify-end border-t border-slate-100">
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/30 h-11 px-6"
                  >
                    <Save className="w-4 h-4 mr-2" /> Enregistrer les modifications
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - Security & Role */}
        <div className="space-y-6">
          {/* Security Card */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-white border-b border-orange-100">
              <CardTitle className="flex items-center gap-2.5 text-slate-900">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-md">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                Sécurité
              </CardTitle>
              <CardDescription className="mt-2">Changez votre mot de passe</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="currentPass" className="text-sm font-medium text-slate-700">
                    Mot de passe actuel
                  </Label>
                  <div className="relative">
                    <Input 
                      id="currentPass" 
                      type={showPasswords.current ? "text" : "password"}
                      value={passData.currentPassword}
                      onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                      placeholder="••••••••"
                      className="h-11 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Separator className="my-3 bg-slate-100" />

                <div className="space-y-2">
                  <Label htmlFor="newPass" className="text-sm font-medium text-slate-700">
                    Nouveau mot de passe
                  </Label>
                  <div className="relative">
                    <Input 
                      id="newPass" 
                      type={showPasswords.new ? "text" : "password"}
                      value={passData.newPassword}
                      onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                      placeholder="••••••••"
                      className="h-11 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPass" className="text-sm font-medium text-slate-700">
                    Confirmer le nouveau
                  </Label>
                  <div className="relative">
                    <Input 
                      id="confirmPass" 
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passData.confirmPassword}
                      onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                      placeholder="••••••••"
                      className="h-11 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/30 h-11"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Mettre à jour le mot de passe
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Tips Card */}
          <Card className="border-slate-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Conseils de sécurité</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Utilisez un mot de passe fort et unique
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>8+ caractères</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Lettres et chiffres</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Caractères spéciaux</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}