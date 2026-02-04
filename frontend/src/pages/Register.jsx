import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/utils/auth";
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
  // État du formulaire
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const navigate = useNavigate();

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

  // Mise à jour des champs
  const onChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  // Soumission du formulaire
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation des mots de passe
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
      });

      login(response.data);
      navigate("/user");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600 animate-pulse" />
          </div>
          <p className="mt-6 text-base text-slate-600 font-medium">Vérification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE - Branding & Marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white w-full">
          {/* Centered Shield Logo */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-black mb-4 leading-tight">
              Rejoignez-nous<br />
              <span className="text-indigo-200">Dès Maintenant</span>
            </h1>
            <p className="text-xl text-indigo-100 mb-12 leading-relaxed">
              Créez votre compte gratuitement et gérez vos incidents IT comme un pro
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-indigo-200" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Accès instantané</h3>
                <p className="text-indigo-100 text-sm">Commencez à utiliser la plateforme immédiatement</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-200" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Collaboration d'équipe</h3>
                <p className="text-indigo-100 text-sm">Travaillez efficacement avec votre équipe IT</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-indigo-200" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Aucun engagement</h3>
                <p className="text-indigo-100 text-sm">Gratuit et sans carte bancaire requise</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/50 mb-3">
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

          {/* Register Form */}
          <form onSubmit={onSubmit} className="space-y-3">
            {/* Username & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-semibold text-slate-700">
                  Nom d'utilisateur
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="username"
                    placeholder="jeanmartin"
                    value={form.username}
                    onChange={onChange("username")}
                    className="pl-9 h-11 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={form.email}
                    onChange={onChange("email")}
                    className="pl-9 h-11 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>
              </div>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700">
                  Prénom
                </Label>
                <Input
                  id="firstName"
                  placeholder="Jean"
                  value={form.firstName}
                  onChange={onChange("firstName")}
                  className="h-11 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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
                  className="h-11 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                Téléphone <span className="text-slate-400 font-normal">(optionnel)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="phone"
                  placeholder="07 12 34 56 78"
                  value={form.phoneNumber}
                  onChange={onChange("phoneNumber")}
                  className="pl-9 h-11 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={onChange("password")}
                    className="pl-9 pr-9 h-11 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700">
                  Confirmer
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={onChange("confirmPassword")}
                    className="pl-9 h-11 text-sm border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="group w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm">Création...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Créer mon compte</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
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

            {/* Links */}
            <div className="flex items-center justify-center gap-4 text-sm pt-2 border-t border-slate-200">
              <Link
                to="/"
                className="text-slate-600 hover:text-indigo-600 font-medium transition-colors"
              >
                ← Accueil
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
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