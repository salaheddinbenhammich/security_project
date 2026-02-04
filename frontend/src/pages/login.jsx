import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/utils/auth";
import { 
  Shield, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Clock,
  TrendingUp,
  Sparkles
} from "lucide-react";

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Appel API pour authentification
      const response = await api.post("/auth/login", { usernameOrEmail, password });
      
      // Utilise l'utilitaire centralisé pour gérer la session
      login(response.data);
      
      // Redirection basée sur le rôle de l'utilisateur
      if (response.data.role === 'ADMIN') {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (err) {
      // Gestion des erreurs avec message approprié
      setError(err.response?.data?.message || "Identifiants incorrects");
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
          
          <div className="mb-8">
            <h1 className="text-5xl font-black mb-4 leading-tight">
              Gestion d'Incidents<br />
              <span className="text-indigo-200">Simplifiée</span>
            </h1>
            <p className="text-xl text-indigo-100 mb-12 leading-relaxed">
              Plateforme professionnelle pour suivre et résoudre vos incidents IT en temps réel
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-indigo-200" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Suivi en temps réel</h3>
                <p className="text-indigo-100 text-sm">Suivez l'état de vos tickets instantanément</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-indigo-200" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Support 24/7</h3>
                <p className="text-indigo-100 text-sm">Assistance disponible à tout moment</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-200" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Rapports détaillés</h3>
                <p className="text-indigo-100 text-sm">Analyses complètes de vos incidents</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/50 mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">IT Incidents Manager</h2>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              Bon retour !
            </h2>
            <p className="text-slate-600">
              Connectez-vous pour accéder à votre espace
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username/Email Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-slate-700">
                Identifiant
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <Input
                  id="username"
                  placeholder="admin ou admin@example.com"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="pl-10 h-12 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Mot de passe
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                  <span>Connexion...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Se connecter</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-center gap-4 text-sm">
              <Link
                to="/"
                className="text-slate-600 hover:text-indigo-600 font-medium transition-colors"
              >
                ← Accueil
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                Créer un compte
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 pt-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Sécurisé</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Rapide</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}