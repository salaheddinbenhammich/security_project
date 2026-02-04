import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function UserProfile() {
  const navigate = useNavigate();
  const user = getUser();

  const initials = user?.firstName
    ? `${user.firstName[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : (user?.username?.slice(0, 2) || "U").toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="text-sm text-slate-600">Aucun utilisateur connecte.</p>
          <Button asChild variant="outline">
            <Link to="/login">Se connecter</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
          <div>
            <Button asChild variant="outline" className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50">
              <Link to="/user">Retour dashboard</Link>
            </Button>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">Profil utilisateur</h1>
            <p className="text-sm text-slate-600">Consulte les informations de ton compte.</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xl font-semibold text-slate-700">
            {initials}
          </div>
        </div>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <div>
              <span className="text-xs uppercase tracking-wide text-slate-400">Nom d'utilisateur</span>
              <p className="font-semibold text-slate-800">{user.username || "-"}</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wide text-slate-400">Email</span>
              <p className="font-semibold text-slate-800">{user.email || "-"}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-xs uppercase tracking-wide text-slate-400">Prenom</span>
                <p className="font-semibold text-slate-800">{user.firstName || "-"}</p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wide text-slate-400">Nom</span>
                <p className="font-semibold text-slate-800">{user.lastName || "-"}</p>
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wide text-slate-400">Role</span>
              <p className="font-semibold text-slate-800">{user.role || "-"}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleLogout} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
            Se deconnecter
          </Button>
        </div>
      </div>
    </div>
  );
}
