import { useState, useEffect } from "react";
import api from "@/services/api";
import { User, Lock, Save, Mail, Phone, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { validatePassword } from "@/utils/auth";
import PasswordStrength from "@/components/PasswordStrength";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function UserProfile() {
  // ========== STATE MANAGEMENT ==========
  
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Personal information state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    role: ""
  });

  // Password change state
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Password visibility state
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Password strength popover state
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  // ========== LOAD USER PROFILE ==========
  
  /**
   * Fetch current user's profile data
   * Extracts user ID from JWT token and loads profile
   */
  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        // Fetch user profile data
        const res = await api.get(`/users/me`);

        // Extract user ID from response
        const currentUserId = res.data.id;
        setUserId(currentUserId);

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

  // ========== UPDATE PERSONAL INFO ==========
  
  /**
   * Update user's personal information
   * Allows updating: username, email, firstName, lastName, phoneNumber
   */
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

      await api.put(`/users/me`, dataToSend);
      
      toast.success("Informations mises à jour avec succès");
    } catch (err) {
      console.error(err);
      toast.error("Erreur : " + (err.response?.data?.message || "Accès refusé (403)"));
    }
  };

  // ========== UPDATE PASSWORD ==========
  
  /**
   * Update user's password with validation
   * 
   * SECURITY VALIDATIONS:
   * 1. Current password is required
   * 2. New passwords must match
   * 3. New password must meet strength requirements
   * 4. Cannot reuse current password
   */
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    // ========== CLIENT-SIDE VALIDATIONS ==========
    
    // VALIDATION 1: Current password is required
    if (!passData.currentPassword) {
      toast.error("Veuillez entrer votre mot de passe actuel");
      return;
    }

    // VALIDATION 2: New passwords must match
    if (passData.newPassword !== passData.confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    // VALIDATION 3: Validate password strength
    const passwordValidation = validatePassword(passData.newPassword);
    if (!passwordValidation.isValid) {
      toast.error("Le nouveau mot de passe ne respecte pas les critères de sécurité requis");
      return;
    }

    // ========== API CALL ==========
    try {
      await api.put(`/users/me/password`, {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      
      // ========== SUCCESS: RESET FORM ==========
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswords({ current: false, new: false, confirm: false });
      
      toast.success("Mot de passe modifié avec succès !");
      
    } catch (err) {
      console.error(err);
      // ========== ERROR HANDLING ==========
      // Server may return specific error messages
      const message = err.response?.data?.message || "Erreur lors de la modification du mot de passe";
      toast.error(message);
    }
  };

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin" />
          <User className="absolute w-5 h-5 text-indigo-600 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 animate-pulse" />
        </div>
        <p className="mt-4 font-medium text-slate-600">Chargement du profil...</p>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div className="mx-auto space-y-6 max-w-7xl">
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* ========== LEFT COLUMN - PERSONAL INFORMATION ========== */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white border-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2.5 text-slate-900">
                    <div className="flex items-center justify-center w-10 h-10 shadow-md bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                {/* Submit Button */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button 
                    type="submit" 
                    className="px-6 font-semibold text-white shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/30 h-11"
                  >
                    <Save className="w-4 h-4 mr-2" /> Enregistrer les modifications
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* ========== RIGHT COLUMN - SECURITY ========== */}
        <div className="space-y-6">
          
          {/* Password Change Card */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-white">
              <CardTitle className="flex items-center gap-2.5 text-slate-900">
                <div className="flex items-center justify-center w-10 h-10 shadow-md bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                Sécurité
              </CardTitle>
              <CardDescription className="mt-2">Changez votre mot de passe</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                
                {/* Current Password */}
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
                      className="pr-10 h-11 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-600"
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

                {/* New Password with Popover */}
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
                      onFocus={() => setShowPasswordStrength(true)}
                      onBlur={() => setShowPasswordStrength(false)}
                      placeholder="••••••••"
                      className="pr-10 h-11 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>

                    {/* Password Strength Popover - Comic Bubble Style */}
                    {showPasswordStrength && passData.newPassword && (
                      <div className="absolute z-50 left-0 -top-2 -translate-y-full w-[280px] animate-in fade-in zoom-in-95 duration-200">
                        <div className="relative p-4 bg-white border-2 border-orange-300 rounded-xl shadow-xl">
                          {/* Comic-style tail pointing down */}
                          <div className="absolute left-8 -bottom-3 w-6 h-6">
                            <div className="w-4 h-4 bg-white border-r-2 border-b-2 border-orange-300 rotate-45 transform origin-center"></div>
                          </div>
                          
                          {/* Password strength content */}
                          <PasswordStrength password={passData.newPassword} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm New Password */}
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
                      className="pr-10 h-11 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-1 border-t border-slate-100">
                  <Button 
                    type="submit" 
                    className="w-full font-semibold text-white shadow-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/30 h-11"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Mettre à jour le mot de passe
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}