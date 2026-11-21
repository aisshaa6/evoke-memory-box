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
import Journal from './pages/Journal';
import Auth from './pages/Auth';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav';
import { applyTheme, getSavedTheme } from './lib/themes';

function App() {
  useEffect(() => {
    applyTheme(getSavedTheme());
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
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
          <BottomNav />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
