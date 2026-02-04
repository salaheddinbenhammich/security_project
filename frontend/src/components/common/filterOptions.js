import {
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  Archive,
  Shield,
  User,
  Tag,
  Laptop,
  Globe,
  Code,
  Key,
  Mail,
} from "lucide-react";

// STATUS (tickets)
export const STATUS_STYLES = {
  ALL:         { label: "Tous Statuts", color: "bg-white text-slate-700", icon: Filter },
  PENDING:     { label: "À Traiter",    color: "bg-orange-100 text-orange-700 border-orange-200", icon: Clock },
  IN_PROGRESS: { label: "En Cours",     color: "bg-blue-100 text-blue-700 border-blue-200", icon: PlayCircle },
  RESOLVED:    { label: "Résolu",       color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  CANCELLED:   { label: "Archivé",      color: "bg-slate-100 text-slate-600 border-slate-200", icon: Archive },
};

// PRIORITY (tickets)
export const PRIORITY_STYLES = {
  ALL:      { label: "Toutes Priorités", color: "bg-white text-slate-700", icon: Filter },
  CRITICAL: { label: "Critique",         color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
  HIGH:     { label: "Haute",            color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertCircle },
  MEDIUM:   { label: "Moyenne",          color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
  LOW:      { label: "Basse",            color: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock },
};

// ROLE (users)
export const ROLE_STYLES = {
  ALL:   { label: "Tous Rôles",       color: "bg-white text-slate-700", icon: Filter },
  ADMIN: { label: "Administrateur",   color: "bg-purple-100 text-purple-700 border-purple-200", icon: Shield },
  USER:  { label: "Utilisateur",      color: "bg-blue-100 text-blue-700 border-blue-200", icon: User },
};

// CATEGORY (create ticket)
export const CATEGORY_STYLES = {
  HARDWARE: { label: "Matériel",        color: "bg-white text-slate-700", icon: Laptop },
  SOFTWARE: { label: "Logiciel",        color: "bg-white text-slate-700", icon: Code },
  NETWORK:  { label: "Réseau",          color: "bg-white text-slate-700", icon: Globe },
  ACCESS:   { label: "Accès / Login",   color: "bg-white text-slate-700", icon: Key },
  EMAIL:    { label: "Messagerie",      color: "bg-white text-slate-700", icon: Mail },
  OTHER:    { label: "Autre",           color: "bg-white text-slate-700", icon: Tag },
};
