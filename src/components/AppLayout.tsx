import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import Dashboard from './Dashboard';
import ChatInterfaceV2 from './ChatInterfaceV2';
import DocumentLibrary from './DocumentLibrary';
import TemplateManager from './TemplateManager';
import ProtectedRoute from './ProtectedRoute';

const AppLayout: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/chat/:assistantId" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ChatInterfaceV2 />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/documents" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DocumentLibrary />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/templates" element={
        <ProtectedRoute>
          <DashboardLayout>
            <TemplateManager />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <DashboardLayout>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Settings</h1>
              <p className="text-gray-600">Settings page coming soon...</p>
            </div>
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="*" element={
        <DashboardLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold">Page Not Found</h1>
            <p className="text-gray-600 mt-2">The page you're looking for doesn't exist.</p>
          </div>
        </DashboardLayout>
      } />
    </Routes>
  );
};

export default AppLayout;