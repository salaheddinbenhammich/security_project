import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { ArrowLeft, Send } from "lucide-react";

export default function CreateTicket() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "OTHER",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/tickets", {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
      });

      // Redirection vers la liste des tickets après succès
      navigate("/user/tickets");
    } catch (err) {
      setError("Impossible de créer le ticket. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-slate-50 flex justify-center">
      <div className="w-full max-w-2xl">
        
        {/* Bouton retour */}
        <div className="mb-6">
            <Button variant="ghost" className="pl-0 text-slate-500 hover:text-slate-900" onClick={() => navigate("/user/tickets")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour à mes tickets
            </Button>
        </div>

        <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Déclarer un incident
              </CardTitle>
              <CardDescription className="text-slate-600">
                Remplissez le formulaire ci-dessous. Soyez précis pour une prise en charge rapide.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Titre */}
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-slate-700 font-medium">Sujet de la demande *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Écran noir au démarrage..."
                    required
                    className="bg-white"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-slate-700 font-medium">
                    Description détaillée *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Expliquez le problème, les messages d'erreur, etc."
                    rows={6}
                    required
                    className="bg-white resize-none"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Priorité */}
                  <div className="space-y-1.5">
                    <Label className="text-slate-700 font-medium">Priorité (Urgence)</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Faible</SelectItem>
                        <SelectItem value="MEDIUM">Moyenne</SelectItem>
                        <SelectItem value="HIGH">Haute</SelectItem>
                        <SelectItem value="CRITICAL">Critique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Catégorie */}
                  <div className="space-y-1.5">
                    <Label className="text-slate-700 font-medium">Catégorie</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HARDWARE">Matériel</SelectItem>
                        <SelectItem value="SOFTWARE">Logiciel</SelectItem>
                        <SelectItem value="NETWORK">Réseau</SelectItem>
                        <SelectItem value="ACCESS">Accès / Login</SelectItem>
                        <SelectItem value="EMAIL">Messagerie</SelectItem>
                        <SelectItem value="OTHER">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
                    {error}
                  </div>
                )}

                <div className="pt-2">
                    <Button
                    type="submit"
                    disabled={loading}
                    className="w-full font-semibold text-white bg-cyan-600 hover:bg-cyan-700 h-11"
                    >
                    {loading ? "Envoi en cours..." : <><Send className="w-4 h-4 mr-2" /> Soumettre le ticket</>}
                    </Button>
                </div>
              </form>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}