import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUser, logout } from "@/utils/auth";

export default function UserProfile() {
  const navigate = useNavigate();
  const user = getUser();

  const initials = user?.firstName
    ? `${user.firstName[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : (user?.username?.slice(0, 2) || "U").toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen px-4 py-10 bg-white">
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="text-sm text-slate-600">Aucun utilisateur connecte.</p>
          <Button asChild variant="outline">
            <Link to="/login">Se connecter</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-white">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 pb-5 border-b md:flex-row md:items-center md:justify-between border-slate-200">
          <div>
            <Button asChild variant="outline" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50">
              <Link to="/user">Retour dashboard</Link>
            </Button>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">Profil utilisateur</h1>
            <p className="text-sm text-slate-600">Consulte les informations de ton compte.</p>
          </div>
          <div className="flex items-center justify-center w-16 h-16 text-xl font-semibold border rounded-full border-slate-200 bg-slate-50 text-slate-700">
            {initials}
          </div>
        </div>

        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <div>
              <span className="text-xs tracking-wide uppercase text-slate-400">Nom d'utilisateur</span>
              <p className="font-semibold text-slate-800">{user.username || "-"}</p>
            </div>
            <div>
              <span className="text-xs tracking-wide uppercase text-slate-400">Email</span>
              <p className="font-semibold text-slate-800">{user.email || "-"}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-xs tracking-wide uppercase text-slate-400">Prenom</span>
                <p className="font-semibold text-slate-800">{user.firstName || "-"}</p>
              </div>
              <div>
                <span className="text-xs tracking-wide uppercase text-slate-400">Nom</span>
                <p className="font-semibold text-slate-800">{user.lastName || "-"}</p>
              </div>
            </div>
            <div>
              <span className="text-xs tracking-wide uppercase text-slate-400">Role</span>
              <p className="font-semibold text-slate-800">{user.role || "-"}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleLogout} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
            Se deconnecter
          </Button>
        </div>
      </div>
    </div>
  );
}
