import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    console.log("REGISTER MOCK:", form);
    navigate("/login");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder=""
                value={form.email}
                onChange={onChange("email")}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                placeholder=""
                value={form.fullName}
                onChange={onChange("fullName")}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder=""
                value={form.phone}
                onChange={onChange("phone")}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder=""
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
                placeholder=""
                value={form.confirmPassword}
                onChange={onChange("confirmPassword")}
                required
              />
            </div>

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
  );
}
