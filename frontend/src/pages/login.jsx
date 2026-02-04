import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { login } from "@/utils/auth";

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", { usernameOrEmail, password });
      
      // ✅ Use centralized auth utility (automatically clears old session)
      login(response.data);
      
      // Navigate based on role
      if (response.data.role === 'ADMIN') {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (err) {
      setError("Erreur connexion");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Entre tes identifiants pour acceder aux tickets.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid items-center w-full gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username">Utilisateur ou email</Label>
              <Input
                id="username"
                placeholder="Ex: admin"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}

            <Button type="submit" className="w-full mt-2">Se connecter</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between text-xs text-gray-500">
          <a href="/" className="hover:underline">Back to home</a>
          <a href="/register" className="hover:underline">Create account</a>
        </CardFooter>
      </Card>
    </div>
  );
}
