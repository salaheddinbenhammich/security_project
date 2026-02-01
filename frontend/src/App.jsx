import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicIncidents from './pages/PublicIncidents';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';

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
        
        {/* Default = visiteur */}
        <Route path="*" element={<PublicIncidents />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
