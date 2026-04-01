import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Entry from './pages/Entry';
import Home from './pages/Home';
import AddMemory from './pages/AddMemory';
import Browse from './pages/Browse';
import Statistics from './pages/Statistics';
import MemoryDetail from './pages/MemoryDetail';
import Calendar from './pages/Calendar';
import MapView from './pages/MapView';
import ThemePicker from './components/ThemePicker';
import Journal from './pages/Journal';
import Auth from './pages/Auth';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LanguageSwitcher from './components/LanguageSwitcher';

function App() {
  useEffect(() => {
    const saved = localStorage.getItem('ani_kutusu_theme') || 'aurora';
    if (saved && saved !== 'aurora') {
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <ThemePicker />
          <LanguageSwitcher />
          <Routes>
            <Route path="/" element={<Entry />} />
            <Route path="/auth" element={<Auth />} />
            
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/add" element={<ProtectedRoute><AddMemory /></ProtectedRoute>} />
            <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
            <Route path="/stats" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
            <Route path="/memory/:id" element={<ProtectedRoute><MemoryDetail /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
            <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
