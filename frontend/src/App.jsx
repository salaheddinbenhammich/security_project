import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicIncidents from "./pages/PublicIncidents";  // ← CRITIQUE
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicIncidents />} />
        <Route path="/incidents" element={<PublicIncidents />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="*" element={<PublicIncidents />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
