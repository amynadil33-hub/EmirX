import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import HomePage from '@/components/HomePage';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { ForgotPassword } from '@/pages/ForgotPassword';
import Dashboard from '@/components/Dashboard';
import ChatInterfaceV2 from '@/components/ChatInterfaceV2';
import DocumentLibrary from '@/components/DocumentLibrary';
import TemplateManager from '@/components/TemplateManager';
import NotFound from '@/pages/NotFound';

// 🐇 Musalhu Bot Center imports
import BotManagement from '@/components/BotManagement';
import BotDetails from '@/components/BotDetails';

import './App.css';

// Assistants config (kept as is)
const assistantConfig = {
  hr: { name: 'HR Assistant', description: 'Human resources management and employee relations for Maldivian businesses' },
  secretary: { name: 'Secretary Assistant', description: 'Administrative tasks, scheduling, and office management' },
  accounting: { name: 'Accounting Assistant', description: 'Financial management and accounting with MVR support' },
  marketing: { name: 'Marketing Assistant', description: 'Tourism marketing and promotional strategies for Maldives' },
  research: { name: 'Research Assistant', description: 'Market research and business intelligence' },
  lawyer: { name: 'Lawyer Assistant', description: 'Legal guidance for Maldivian business law (not legal advice)' }
};

// Component to handle root route based on auth status
function RootRoute() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <HomePage />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <AppProvider>
                  <Dashboard />
                </AppProvider>
              </ProtectedRoute>
            } 
          />

          {/* Example assistant routes (unchanged) */}
          <Route path="/chat/hr" element={<ProtectedRoute><AppProvider><ChatInterfaceV2 /></AppProvider></ProtectedRoute>} />
          <Route path="/chat/secretary" element={<ProtectedRoute><AppProvider><ChatInterfaceV2 /></AppProvider></ProtectedRoute>} />
          <Route path="/chat/accounting" element={<ProtectedRoute><AppProvider><ChatInterfaceV2 /></AppProvider></ProtectedRoute>} />
          <Route path="/chat/marketing" element={<ProtectedRoute><AppProvider><ChatInterfaceV2 /></AppProvider></ProtectedRoute>} />
          <Route path="/chat/research" element={<ProtectedRoute><AppProvider><ChatInterfaceV2 /></AppProvider></ProtectedRoute>} />
          <Route path="/chat/lawyer" element={<ProtectedRoute><AppProvider><ChatInterfaceV2 /></AppProvider></ProtectedRoute>} />

          <Route path="/documents" element={<ProtectedRoute><AppProvider><DocumentLibrary /></AppProvider></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute><AppProvider><TemplateManager /></AppProvider></ProtectedRoute>} />

          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <AppProvider>
                  <div className="flex h-screen bg-gray-50">
                    <div className="flex-1 p-6">
                      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Settings</h1>
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>
                        <p className="text-gray-600">User profile and billing settings coming soon.</p>
                      </div>
                    </div>
                  </div>
                </AppProvider>
              </ProtectedRoute>
            } 
          />

          {/* 🐇 Musalhu Bot Center Routes */}
          <Route 
            path="/bots" 
            element={
              <ProtectedRoute>
                <AppProvider>
                  <BotManagement />
                </AppProvider>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/bot/:id" 
            element={
              <ProtectedRoute>
                <AppProvider>
                  <BotDetails />
                </AppProvider>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
