import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Register() {
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
  const navigate = useNavigate();

  const onChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

<<<<<<< Updated upstream
    console.log("REGISTER MOCK:", form);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center px-4">
      {/* Glow background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(129,140,248,0.22),_transparent_55%)]" />
      </div>

      <div className="mx-auto flex w-full max-w-5xl items-center gap-10">
        {/* Left side text / branding */}
        <div className="hidden md:flex flex-1 flex-col text-slate-100 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/50 px-3 py-1 text-xs font-medium text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            IT Incident Manager
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Crée ton compte et{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              déclare tes incidents
            </span>
          </h1>
          <p className="text-sm text-slate-300/80 max-w-md">
            Accède à ton espace utilisateur pour créer, suivre et consulter
            l’historique de tous tes tickets IT en quelques clics.
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-300/80">
            <li>• Création rapide de tickets avec priorités</li>
            <li>• Suivi temps réel du statut de tes incidents</li>
            <li>• Interface moderne basée sur shadcn/ui</li>
          </ul>
        </div>

        {/* Register card */}
        <div className="flex-1">
          <Card className="w-full max-w-md mx-auto border-slate-800/70 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-slate-950/70">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-slate-50">
                Créer un compte
              </CardTitle>
              <CardDescription className="text-slate-300/80">
                UI uniquement pour l’instant – le backend sera branché plus tard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="email" className="text-slate-200">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={onChange("email")}
                    required
                    className="bg-slate-900/60 border-slate-700/80 text-slate-50 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="fullName" className="text-slate-200">
                    Nom complet
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Votre nom"
                    value={form.fullName}
                    onChange={onChange("fullName")}
                    className="bg-slate-900/60 border-slate-700/80 text-slate-50 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="phone" className="text-slate-200">
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="07..."
                    value={form.phone}
                    onChange={onChange("phone")}
                    className="bg-slate-900/60 border-slate-700/80 text-slate-50 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                  />
                </div>
=======
    try {
      const response = await api.post("/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify({
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        role: response.data.role,
      }));

      navigate("/user");
    } catch (err) {
      setError("Registration failed.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-[420px]">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Create your account to submit and track incidents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="your.username"
                value={form.username}
                onChange={onChange("username")}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={onChange("email")}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                placeholder="Your first name"
                value={form.firstName}
                onChange={onChange("firstName")}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                placeholder="Your last name"
                value={form.lastName}
                onChange={onChange("lastName")}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="07..."
                value={form.phoneNumber}
                onChange={onChange("phoneNumber")}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="��������"
                value={form.password}
                onChange={onChange("password")}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="��������"
                value={form.confirmPassword}
                onChange={onChange("confirmPassword")}
                required
              />
            </div>
>>>>>>> Stashed changes

                <div className="grid gap-1.5">
                  <Label htmlFor="password" className="text-slate-200">
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={onChange("password")}
                    required
                    className="bg-slate-900/60 border-slate-700/80 text-slate-50 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="confirmPassword" className="text-slate-200">
                    Confirmation du mot de passe
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={onChange("confirmPassword")}
                    required
                    className="bg-slate-900/60 border-slate-700/80 text-slate-50 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                  />
                </div>

                {error && (
                  <p className="text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full mt-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-lg shadow-cyan-500/30"
                >
                  Créer mon compte
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 items-center justify-center border-t border-slate-800/80 bg-slate-900/70">
              <span className="text-xs text-slate-400">
                Déjà un compte ?{" "}
                <Link
                  to="/login"
                  className="font-medium text-cyan-400 hover:text-cyan-300 underline-offset-2 hover:underline"
                >
                  Se connecter
                </Link>
              </span>
              <span className="text-[10px] text-slate-500">
                En continuant, vous acceptez notre politique de sécurité IT.
              </span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
