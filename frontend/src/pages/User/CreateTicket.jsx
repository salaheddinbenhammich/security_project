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
    Mail,
    FileText,
    Zap
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
    <div className="max-w-4xl mx-auto space-y-6">


      {/* Form Card */}
      <div onClick={() => setOpenDropdown(null)}>
        <Card className="border-slate-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
            <CardTitle className="flex items-center gap-2.5 text-slate-900 text-xl">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-md">
                <Zap className="w-5 h-5 text-white" />
              </div>
              Détails de l'incident
            </CardTitle>
            <CardDescription className="mt-2">
              Remplissez le formulaire ci-dessous. Soyez précis pour une prise en charge rapide par le support.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                  Sujet de la demande *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Écran noir au démarrage de l'ordinateur..."
                  required
                  className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                  Description détaillée *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Expliquez le problème rencontré, les messages d'erreur affichés, les étapes pour reproduire le problème..."
                  rows={6}
                  required
                  className="resize-none border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                
                {/* CUSTOM SELECT: PRIORITY */}
                <div className="space-y-2 relative">
                  <Label className="text-sm font-medium text-slate-700">Priorité (Urgence) *</Label>
                  
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'PRIORITY' ? null : 'PRIORITY')}
                    className={`flex w-full h-11 items-center justify-between rounded-lg border px-3.5 text-sm font-medium transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${currentPriorityStyle.color} border`}
                  >
                    <div className="flex items-center gap-2">
                      <PriorityIcon className="h-4 w-4" />
                      <span>{currentPriorityStyle.label}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>

                  {openDropdown === 'PRIORITY' && (
                    <div className="absolute top-full mt-1 w-full z-20 rounded-lg border border-slate-200 bg-white shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100">
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
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors ${formData.priority === key ? 'bg-slate-100 font-semibold' : ''}`}
                          >
                            <div className={`p-1.5 rounded-lg border ${style.color}`}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-slate-700">{style.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* CUSTOM SELECT: CATEGORY */}
                <div className="space-y-2 relative">
                  <Label className="text-sm font-medium text-slate-700">Catégorie *</Label>
                  
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'CATEGORY' ? null : 'CATEGORY')}
                    className="flex w-full h-11 items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="h-4 w-4 text-indigo-600" />
                      <span>{currentCategoryStyle.label}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>

                  {openDropdown === 'CATEGORY' && (
                    <div className="absolute top-full mt-1 w-full z-20 rounded-lg border border-slate-200 bg-white shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100 max-h-[280px] overflow-y-auto">
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
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors ${formData.category === key ? 'bg-slate-100 font-semibold' : ''}`}
                          >
                            <Icon className="h-4 w-4 text-indigo-600" />
                            <span className="text-slate-700">{style.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Error message */}
              {error && (
                <div className="p-3.5 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5"/>
                  <span>{error}</span>
                </div>
              )}

              {/* Info tip */}
              <div className="p-3.5 text-sm text-indigo-700 bg-indigo-50 rounded-lg border border-indigo-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5"/>
                <div>
                  <p className="font-semibold mb-0.5">Conseil</p>
                  <p className="text-indigo-600">Plus votre description est détaillée, plus nous pourrons vous aider rapidement.</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-[200px] font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 h-11"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Envoi en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      <span>Créer le ticket</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}