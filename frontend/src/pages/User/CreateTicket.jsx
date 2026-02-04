import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
    Send, 
    ChevronDown,
    AlertCircle,
    Clock,
    Tag, 
    Laptop, 
    Globe, 
    Code, 
    Key, 
    Mail
} from "lucide-react";
import { toast } from "sonner";

export default function CreateTicket() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Gestion de l'ouverture des menus déroulants
  const [openDropdown, setOpenDropdown] = useState(null); // 'PRIORITY' ou 'CATEGORY'

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "OTHER",
  });

  // --- CONFIGURATION VISUELLE (Styles & Icônes) ---

  const priorityOptions = {
    LOW:      { label: "Faible",    color: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock },
    MEDIUM:   { label: "Moyenne",   color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
    HIGH:     { label: "Haute",     color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertCircle },
    CRITICAL: { label: "Critique",  color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle }
  };

  const categoryOptions = {
    HARDWARE: { label: "Matériel",      icon: Laptop },
    SOFTWARE: { label: "Logiciel",      icon: Code },
    NETWORK:  { label: "Réseau",        icon: Globe },
    ACCESS:   { label: "Accès / Login", icon: Key },
    EMAIL:    { label: "Messagerie",    icon: Mail },
    OTHER:    { label: "Autre",         icon: Tag }
  };

  // Récupération du style actuel pour l'affichage du bouton
  const currentPriorityStyle = priorityOptions[formData.priority] || priorityOptions.MEDIUM;
  const PriorityIcon = currentPriorityStyle.icon;

  const currentCategoryStyle = categoryOptions[formData.category] || categoryOptions.OTHER;
  const CategoryIcon = currentCategoryStyle.icon;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/tickets", formData);
      toast.success("Ticket créé avec succès !");
      navigate("/user");
    } catch (err) {
      setError("Impossible de créer le ticket. Veuillez réessayer.");
      toast.error("Erreur lors de la création du ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
        className="bg-slate-50 flex items-center justify-center" 
        onClick={() => setOpenDropdown(null)}
    >
      {/* Carte élargie (max-w-3xl) */}
      <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        
        <Card className="bg-white shadow-lg border-slate-200">
            <CardHeader className="space-y-1 border-b border-slate-100 ">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Déclarer un incident
              </CardTitle>
              <CardDescription className="text-slate-600">
                Remplissez le formulaire ci-dessous. Soyez précis pour une prise en charge rapide par le support.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Titre */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-700 font-medium">Sujet de la demande *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Écran noir au démarrage..."
                    required
                    className="bg-white h-11"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700 font-medium">
                    Description détaillée *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Expliquez le problème, les messages d'erreur, etc."
                    rows={5}
                    required
                    className="bg-white resize-none"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  
                  {/* SELECTEUR CUSTOM : PRIORITÉ */}
                  <div className="space-y-2 relative">
                    <Label className="text-slate-700 font-medium">Priorité (Urgence)</Label>
                    
                    <button
                        type="button"
                        onClick={() => setOpenDropdown(openDropdown === 'PRIORITY' ? null : 'PRIORITY')}
                        className={`flex w-full h-11 items-center justify-between rounded-md border px-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 ${currentPriorityStyle.color} border`}
                    >
                        <div className="flex items-center gap-2">
                            <PriorityIcon className="h-4 w-4" />
                            <span className="font-medium">{currentPriorityStyle.label}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>

                    {openDropdown === 'PRIORITY' && (
                        <div className="absolute bottom-full mt-1 w-full z-10 rounded-md border border-slate-200 bg-white shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100">
                            {Object.entries(priorityOptions).map(([key, style]) => {
                                const Icon = style.icon;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, priority: key });
                                            setOpenDropdown(null);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors ${formData.priority === key ? 'bg-slate-50 font-medium' : ''}`}
                                    >
                                        <div className={`p-1.5 rounded-full border ${style.color}`}>
                                            <Icon className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="text-slate-700">{style.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                  </div>

                  {/* SELECTEUR CUSTOM : CATÉGORIE */}
                  <div className="space-y-2 relative">
                    <Label className="text-slate-700 font-medium">Catégorie</Label>
                    
                    <button
                        type="button"
                        onClick={() => setOpenDropdown(openDropdown === 'CATEGORY' ? null : 'CATEGORY')}
                        className="flex w-full h-11 items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-950 text-slate-700 hover:bg-slate-50"
                    >
                        <div className="flex items-center gap-2">
                            <CategoryIcon className="h-4 w-4 text-slate-500" />
                            <span>{currentCategoryStyle.label}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>

                    {openDropdown === 'CATEGORY' && (
                        <div className="absolute bottom-full mb-1 w-full z-10 rounded-md border border-slate-200 bg-white shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100 max-h-[250px] overflow-y-auto">
                            {Object.entries(categoryOptions).map(([key, style]) => {
                                const Icon = style.icon;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, category: key });
                                            setOpenDropdown(null);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors ${formData.category === key ? 'bg-slate-50 font-medium' : ''}`}
                                    >
                                        <Icon className="h-4 w-4 text-slate-500" />
                                        <span className="text-slate-700">{style.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                  </div>

                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4"/> {error}
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                    {/* <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => navigate("/user/tickets")}
                        className="text-slate-500"
                    >
                        Annuler
                    </Button> */}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="min-w-[200px] font-semibold text-white bg-blue-600 hover:bg-blue-700 h-11"
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