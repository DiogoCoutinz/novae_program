import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import ComercialOnboarding from './ComercialOnboarding';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/comercial" element={<ComercialOnboarding />} />
      </Routes>
    </Router>
  );
}

export default App;
