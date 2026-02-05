import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/utils/auth";
import { validatePassword } from "@/utils/auth";
import PasswordStrength from "@/components/PasswordStrength";
import {
  Shield,
  User,
  Mail,
  Lock,
  Phone,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  Clock,
  Users,
  Sparkles
} from "lucide-react";

export default function Register() {
  // ========== STATE MANAGEMENT ==========
  
  // Form data state
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  
  // UI state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  
  const navigate = useNavigate();

  // ========== AUTO-REDIRECT IF ALREADY AUTHENTICATED ==========
  // Prevent logged-in users from accessing registration page
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    }
    setAuthChecking(false);
  }, [navigate]);

  // ========== FORM HANDLERS ==========
  
  /**
   * Handle input field changes
   * Updates form state for the specified field
   */
  const onChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  /**
   * Handle form submission with validation
   * 
   * VALIDATION STEPS:
   * 1. Check password match
   * 2. Validate password strength
   * 3. Submit to API
   * 4. Handle response/errors
   */
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ========== CLIENT-SIDE VALIDATION ==========
    
    // VALIDATION 1: Check if passwords match
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    // VALIDATION 2: Check password strength
    // This provides immediate feedback before API call
    const passwordValidation = validatePassword(form.password);
    if (!passwordValidation.isValid) {
      setError("Le mot de passe ne respecte pas les critères de sécurité requis");
      setLoading(false);
      return;
    }

    // ========== API CALL ==========
    try {
      const response = await api.post("/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
      });

      // ========== SUCCESS: STORE TOKENS AND REDIRECT ==========
      // The login utility handles:
      // - Clearing old session
      // - Storing new tokens (access + refresh)
      // - Storing user info
      // - Setting token expiry
      login(response.data);
      
      // Redirect to user dashboard
      navigate("/user");
      
    } catch (err) {
      // ========== ERROR HANDLING ==========
      // Display server error message or generic error
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // ========== LOADING STATE ==========
  // Show loading spinner while checking authentication
  if (authChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin" />
            <Sparkles className="absolute w-6 h-6 text-indigo-600 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 animate-pulse" />
          </div>
          <p className="mt-6 text-base font-medium text-slate-600">Vérification...</p>
        </div>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div className="flex min-h-screen">
      
      {/* ========== LEFT SIDE - BRANDING & MARKETING ========== */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800">
        
        {/* Background patterns */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
        
        {/* Floating orbs for visual effect */}
        <div className="absolute rounded-full top-20 left-10 w-72 h-72 bg-purple-500/30 blur-3xl animate-pulse" />
        <div className="absolute rounded-full bottom-20 right-10 w-96 h-96 bg-indigo-500/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center w-full px-16 text-white">
          
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-5xl font-black leading-tight">
              Rejoignez-nous<br />
              <span className="text-indigo-200">Dès Maintenant</span>
            </h1>
            <p className="mb-12 text-xl leading-relaxed text-indigo-100">
              Créez votre compte gratuitement et gérez vos incidents IT comme un pro
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl">
                <Zap className="w-6 h-6 text-indigo-200" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-bold">Accès instantané</h3>
                <p className="text-sm text-indigo-100">Commencez à utiliser la plateforme immédiatement</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl">
                <Users className="w-6 h-6 text-indigo-200" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-bold">Collaboration d'équipe</h3>
                <p className="text-sm text-indigo-100">Travaillez efficacement avec votre équipe IT</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl">
                <Clock className="w-6 h-6 text-indigo-200" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-bold">Aucun engagement</h3>
                <p className="text-sm text-indigo-100">Gratuit et sans carte bancaire requise</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== RIGHT SIDE - REGISTRATION FORM ========== */}
      <div className="flex items-center justify-center w-full p-8 lg:w-1/2 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="mb-4 text-center lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-3 shadow-lg bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-indigo-500/50">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">IT Incidents Manager</h2>
          </div>

          {/* Header */}
          <div className="mb-4">
            <h2 className="text-3xl font-black text-slate-900 mb-1.5">
              Créez votre compte
            </h2>
            <p className="text-slate-600">
              Remplissez le formulaire pour commencer
            </p>
          </div>

          {/* ========== REGISTRATION FORM ========== */}
          <form onSubmit={onSubmit} className="space-y-3">
            
            {/* Username & Email */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-semibold text-slate-700">
                  Nom d'utilisateur
                </Label>
                <div className="relative">
                  <User className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                  <Input
                    id="username"
                    placeholder="jean_martin"
                    value={form.username}
                    onChange={onChange("username")}
                    className="text-sm pl-9 h-11 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={form.email}
                    onChange={onChange("email")}
                    className="text-sm pl-9 h-11 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>
              </div>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700">
                  Prénom
                </Label>
                <Input
                  id="firstName"
                  placeholder="Jean"
                  value={form.firstName}
                  onChange={onChange("firstName")}
                  className="text-sm h-11 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700">
                  Nom
                </Label>
                <Input
                  id="lastName"
                  placeholder="Martin"
                  value={form.lastName}
                  onChange={onChange("lastName")}
                  className="text-sm h-11 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                Téléphone <span className="font-normal text-slate-400">(optionnel)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                <Input
                  id="phone"
                  placeholder="07 12 34 56 78"
                  value={form.phoneNumber}
                  onChange={onChange("phoneNumber")}
                  className="text-sm pl-9 h-11 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={onChange("password")}
                    onFocus={() => setShowPasswordStrength(true)}
                    onBlur={() => setShowPasswordStrength(false)}
                    className="text-sm pl-9 pr-9 h-11 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  {/* Password Strength Popover - Comic Bubble Style */}
                  {showPasswordStrength && form.password && (
                    <div className="absolute z-50 left-0 -top-2 -translate-y-full w-[280px] animate-in fade-in zoom-in-95 duration-200">
                      <div className="relative p-4 bg-white border-2 border-indigo-300 rounded-xl shadow-xl">
                        {/* Comic-style tail pointing down */}
                        <div className="absolute left-8 -bottom-3 w-6 h-6">
                          <div className="w-4 h-4 bg-white border-r-2 border-b-2 border-indigo-300 rotate-45 transform origin-center"></div>
                        </div>
                        
                        {/* Password strength content */}
                        <PasswordStrength password={form.password} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700">
                  Confirmer
                </Label>
                <div className="relative">
                  <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={onChange("confirmPassword")}
                    className="text-sm pl-9 h-11 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ========== ERROR MESSAGE ========== */}
            {error && (
              <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* ========== SUBMIT BUTTON ========== */}
            <Button
              type="submit"
              disabled={loading}
              className="group w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                  <span className="text-sm">Création...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Créer mon compte</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </Button>
          </form>

          {/* ========== FOOTER ========== */}
          <div className="mt-3 space-y-2.5">
            
            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gratuit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sans engagement</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sécurisé</span>
              </div>
            </div>

            {/* Navigation links */}
            <div className="flex items-center justify-center gap-4 pt-2 text-sm border-t border-slate-200">
              <Link
                to="/"
                className="font-medium transition-colors text-slate-600 hover:text-indigo-600"
              >
                ← Accueil
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                to="/login"
                className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
              >
                Déjà un compte ?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}