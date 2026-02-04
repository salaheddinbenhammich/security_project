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
import { login } from "@/utils/auth";

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
      setError("Registration failed.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-b from-violet-50 via-violet-100 to-violet-200">
      <div className="w-full max-w-2xl space-y-6 text-center">
        <div>
          <h1 className="text-3xl font-bold text-indigo-600 md:text-4xl">
            Mon Espace Utilisateur
          </h1>
          <p className="mt-2 text-sm text-slate-600">Creer & suivre mes tickets</p>
        </div>

        <Card className="w-full max-w-xl mx-auto shadow-xl border-slate-200 bg-white/90 shadow-violet-200/60 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">
              Creer un compte
            </CardTitle>
            <CardDescription className="text-slate-500">
              Remplissez les informations pour acceder a votre espace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  placeholder="votre.nom"
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

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="firstName">Prenom</Label>
                  <Input
                    id="firstName"
                    placeholder="Votre prenom"
                    value={form.firstName}
                    onChange={onChange("firstName")}
                    required
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    placeholder="Votre nom"
                    value={form.lastName}
                    onChange={onChange("lastName")}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="phone">Telephone</Label>
                <Input
                  id="phone"
                  placeholder="07..."
                  value={form.phoneNumber}
                  onChange={onChange("phoneNumber")}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={form.password}
                    onChange={onChange("password")}
                    required
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="confirmPassword">Confirmer</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="********"
                    value={form.confirmPassword}
                    onChange={onChange("confirmPassword")}
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="px-3 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-md bg-red-50">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full mt-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500"
              >
                Creer mon compte
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center gap-2 border-t border-slate-100 bg-white/70">
            <span className="text-xs text-slate-500">
              Deja un compte ?{" "}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 underline-offset-2 hover:underline"
              >
                Se connecter
              </Link>
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
