import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Ton fichier api.js
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

    // --- CODE TEMPORAIRE (MOCK) ---
    // On fait semblant que ça charge
    console.log("Tentative de connexion avec", username, password);
    
    // On simule un token admin ou user selon ce que tu tapes
    const fakeToken = "ey...fausse-cle-secrete...";
    localStorage.setItem('token', fakeToken);
    
    // On redirige direct vers le dashboard User
    navigate('/user');

    // --- QUAND LE BACKEND SERA PRÊT, DÉCOMMENTE ÇA : ---
    /*
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      navigate('/user');
    } catch (err) {
      setError("Erreur connexion");
    }
    */
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Entre tes identifiants pour accéder aux tickets.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username">Utilisateur</Label>
              <Input 
                id="username" 
                placeholder="Ex: admin" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
              />
            </div>
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            
            <Button type="submit" className="w-full mt-2">Se connecter</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <a href="/" className="text-xs text-gray-500 hover:underline">Retour à l'accueil</a>
        </CardFooter>
      </Card>
    </div>
  );
}