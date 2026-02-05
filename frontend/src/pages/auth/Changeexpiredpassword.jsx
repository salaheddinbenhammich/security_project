import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/utils/auth";
import { validatePassword } from "@/utils/auth";
import PasswordStrength from "@/components/PasswordStrength";
import { Shield, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function ChangeExpiredPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("=== ChangeExpiredPassword Component Mounted ===");
    
    // Check if we have the temporary session data
    const data = sessionStorage.getItem('expiredPasswordUser');
    
    console.log("SessionStorage data:", data);
    
    if (!data) {
      console.log("❌ No session data found - redirecting to login");
      // No data means user didn't come from login page
      // Redirect them back to login
      navigate('/login', { replace: true });
      return;
    }
    
    const parsedData = JSON.parse(data);
    console.log("✅ Session data found:", parsedData);
    setUserData(parsedData);
  }, []); // ✅ FIXED: Empty dependency array

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");

    console.log("=== Password Change Submitted ===");

    // Client-side validation
    if (newPassword !== confirmPassword) {
      console.log("❌ Passwords don't match");
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    // Check password strength using validation utility
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      console.log("❌ Password doesn't meet requirements");
      setError("Le mot de passe ne respecte pas les critères de sécurité requis");
      return;
    }

    console.log("✅ All validations passed - sending request to backend");
    setLoading(true);

    try {
      const requestData = {
        usernameOrEmail: userData.usernameOrEmail,
        currentPassword: userData.password,
        newPassword
      };
      
      console.log("Request payload:", { ...requestData, currentPassword: "***", newPassword: "***" });
      
      // Call the change expired password endpoint
      const response = await api.post("/auth/change-expired-password", requestData);

      console.log("✅ Password changed successfully");
      console.log("Response:", response.data);

      // Clear the temporary session data
      sessionStorage.removeItem('expiredPasswordUser');
      console.log("✅ Session data cleared");
      
      // Login with new credentials (backend returns JWT tokens)
      login(response.data);
      console.log("✅ User logged in with new tokens");
      
      // Redirect based on role
      if (response.data.role === 'ADMIN') {
        console.log("✅ Redirecting to /admin");
        navigate("/admin");
      } else {
        console.log("✅ Redirecting to /user");
        navigate("/user");
      }
    } catch (err) {
      console.log("❌ Password change failed");
      console.log("Error status:", err.response?.status);
      console.log("Error data:", err.response?.data);
      console.log("Error message:", err.response?.data?.message);
      
      setError(err.response?.data?.message || "Erreur lors du changement de mot de passe");
    } finally {
      setLoading(false);
    }
  };

  // Don't render until we verify we have session data
  if (!userData) {
    console.log("⏳ Waiting for userData to be set...");
    return null;
  }

  console.log("✅ Rendering ChangeExpiredPassword form");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 p-4">
      <div className="w-full max-w-md">
        {/* Header with Warning Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl shadow-lg shadow-orange-500/50 mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">
            Mot de passe expiré
          </h2>
          <p className="text-slate-600">
            Votre mot de passe a expiré après 90 jours. Veuillez le changer pour continuer.
          </p>
        </div>

        {/* Password Change Form */}
        <form onSubmit={handleChangePassword} className="space-y-5">
          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-semibold text-slate-700">
              Nouveau mot de passe
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-slate-400" />
              </div>
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setShowPasswordStrength(true)}
                onBlur={() => setShowPasswordStrength(false)}
                className="pl-10 pr-10 h-12 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>

              {/* Password Strength Popover - Comic Bubble Style */}
              {showPasswordStrength && newPassword && (
                <div className="absolute z-50 left-0 -top-2 -translate-y-full w-[280px] animate-in fade-in zoom-in-95 duration-200">
                  <div className="relative p-4 bg-white border-2 border-orange-300 rounded-xl shadow-xl">
                    {/* Comic-style tail pointing down */}
                    <div className="absolute left-8 -bottom-3 w-6 h-6">
                      <div className="w-4 h-4 bg-white border-r-2 border-b-2 border-orange-300 rotate-45 transform origin-center"></div>
                    </div>
                    
                    {/* Password strength content */}
                    <PasswordStrength password={newPassword} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
              Confirmer le mot de passe
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <CheckCircle className="w-5 h-5 text-slate-400" />
              </div>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10 h-12 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="group w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Changement...</span>
              </div>
            ) : (
              "Changer le mot de passe"
            )}
          </Button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              console.log("🔙 Back to login clicked - clearing session data");
              sessionStorage.removeItem('expiredPasswordUser');
              navigate('/login');
            }}
            className="text-sm text-slate-600 hover:text-indigo-600 font-medium transition-colors"
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}