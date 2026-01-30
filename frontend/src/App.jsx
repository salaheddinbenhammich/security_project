import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* On ajoutera les routes ici au fur et à mesure */}
        <Route path="/" element={<h1>Page Publique (À faire)</h1>} />
        <Route path="/login" element={<h1>Page Login (À faire)</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;