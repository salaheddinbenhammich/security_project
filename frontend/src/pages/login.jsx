import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; 
import { jwtDecode } from "jwt-decode"; 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { 
        usernameOrEmail: username, 
        password: password 
      });

      // 2. STOCKAGE DU TOKEN
      const token = response.data.token;
      localStorage.setItem('token', token);

      // 3. DÉCODAGE ET REDIRECTION INTELLIGENTE
      try {
        const decoded = jwtDecode(token);
        console.log("Connecté en tant que :", decoded.role);

        if (decoded.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/user');  
        }
      } catch (decodeError) {
        console.error("Erreur de décodage", decodeError);
        navigate('/user'); 
      }

    } catch (err) {
      console.error("Erreur login:", err);
      setError("Identifiants incorrects ou erreur serveur.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Accédez à la plateforme IT Incidents.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username">Utilisateur ou Email</Label>
              <Input 
                id="username" 
                placeholder="admin ou etudiant" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            
            <Button type="submit" className="w-full mt-2">Se connecter</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between text-xs text-gray-500">
          <Link to="/" className="hover:underline">Accueil</Link>
          <Link to="/register" className="hover:underline">Créer un compte</Link>
        </CardFooter>
      </Card>
    </div>
  );
}