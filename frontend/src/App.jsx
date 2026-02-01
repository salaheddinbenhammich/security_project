import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* pour l’instant, page d’accueil = login ou plus tard page visiteur */}
        <Route path="/" element={<Login />} />

        <Route path="/" element={<PublicIncidents />} />           {/* Visiteur */}
        <Route path="/incidents" element={<PublicIncidents />} />  {/* Visiteur */}

        <Route path="/login" element={<Login />} />        {/* USER/ADMIN */}
        <Route path="/register" element={<Register />} />  {/* USER/ADMIN */}

        <Route path="/user" element={<UserDashboard />} />  {/* USER */}
        <Route path="*" element={<PublicIncidents />} />       {/* Default = visiteur */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
