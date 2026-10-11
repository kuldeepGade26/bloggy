import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Page 1: Home / Blog Roll */}
              <Route path="/" element={<HomePage />} />
              
              {/* Page 2: Blog Detail Page */}
              <Route path="/post/:slug" element={<PostDetailPage />} />
              
              {/* Admin / Author Side */}
              <Route path="/admin" element={<AdminDashboard />} />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <AuthModal />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
