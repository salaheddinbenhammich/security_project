import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/user" element={<UserDashboard />} />
        
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;