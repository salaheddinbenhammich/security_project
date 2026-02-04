import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicIncidents from "./pages/PublicIncidents";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import UserTicketDetail from "./pages/UserTicketDetail";  // ← NOUVEAU
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Page d'accueil = visiteur */}
        <Route path="/" element={<PublicIncidents />} />
        <Route path="/incidents" element={<PublicIncidents />} />
        
        {/* USER/ADMIN */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* USER */}
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/user/ticket/:id" element={<UserTicketDetail />} />
        <Route path="/user/profile" element={<UserProfile />} />  {/* ← DÉTAIL TICKET */}
        
        {/* DEFAULT */}
        <Route path="*" element={<PublicIncidents />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
