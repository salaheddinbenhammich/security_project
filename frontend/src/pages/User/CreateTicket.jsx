import { useState, useEffect } from "react";
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
import { getUser } from "@/utils/auth"; // ✅ Import getUser from localStorage


export default function CreateTicket() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingApprovalStatus, setLoadingApprovalStatus] = useState(true);
  const [isUserApproved, setIsUserApproved] = useState(true); // ✅ Default to approved

  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        // ✅ Try to fetch user details - this will succeed if approved
        await api.get('/users/me');
        setIsUserApproved(true); // User is approved
      } catch (err) {
        // ✅ If 403 with ACCOUNT_NOT_APPROVED, user is not approved
        if (err.response?.status === 403 && 
            err.response?.data?.error === 'ACCOUNT_NOT_APPROVED') {
          setIsUserApproved(false);
        } else {
          // Other errors - assume approved (let other parts of app handle it)
          setIsUserApproved(true);
        }
      } finally {
        setLoadingApprovalStatus(false);
      }
    };
    
    checkApprovalStatus();
  }, []);

  
  // Gestion de l'ouverture des menus déroulants
  const [openDropdown, setOpenDropdown] = useState(null);

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
      // ✅ Check if it's an approval error
      if (err.response?.status === 403 && err.response?.data?.error === 'ACCOUNT_NOT_APPROVED') {
        setError("Votre compte doit être approuvé par un administrateur avant de créer des tickets.");
      } else {
        setError("Impossible de créer le ticket. Veuillez réessayer.");
        toast.error("Erreur lors de la création du ticket");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show loading while checking approval status
  if (loadingApprovalStatus) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-slate-200 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        {/* ✅ Show banner if user is NOT approved */}
        {!isUserApproved && (
          <div className="p-4 mb-6 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Compte en attente d'approbation</p>
                <p className="text-sm text-amber-700 mt-1">
                  Votre compte doit être approuvé par un administrateur avant de pouvoir créer des tickets.
                  Vous recevrez une notification une fois votre compte approuvé.
                </p>
              </div>
            </div>
          </div>
        )}

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
                  disabled={!isUserApproved}
                  className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
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
                  disabled={!isUserApproved}
                  className="resize-none border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                
                {/* CUSTOM SELECT: PRIORITY */}
                <div className="space-y-2 relative">
                  <Label className="text-sm font-medium text-slate-700">Priorité (Urgence) *</Label>
                  
                  <button
                    type="button"
                    onClick={() => isUserApproved && setOpenDropdown(openDropdown === 'PRIORITY' ? null : 'PRIORITY')}
                    disabled={!isUserApproved}
                    className={`flex w-full h-11 items-center justify-between rounded-lg border px-3.5 text-sm font-medium transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${currentPriorityStyle.color} border disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
                  >
                    <div className="flex items-center gap-2">
                      <PriorityIcon className="h-4 w-4" />
                      <span>{currentPriorityStyle.label}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>

                  {openDropdown === 'PRIORITY' && isUserApproved && (
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
                    onClick={() => isUserApproved && setOpenDropdown(openDropdown === 'CATEGORY' ? null : 'CATEGORY')}
                    disabled={!isUserApproved}
                    className="flex w-full h-11 items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-slate-700 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="h-4 w-4 text-indigo-600" />
                      <span>{currentCategoryStyle.label}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>

                  {openDropdown === 'CATEGORY' && isUserApproved && (
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
                  disabled={loading || !isUserApproved}
                  className="min-w-[200px] font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
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