import React from 'react';
import DocumentLibrary from '@/components/DocumentLibrary';
import { AppProvider } from '@/contexts/AppContext';

const DocumentsPage: React.FC = () => {
  return (
    <AppProvider>
      <DocumentLibrary />
    </AppProvider>
  );
};

export default DocumentsPage;