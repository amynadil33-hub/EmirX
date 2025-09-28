import React, { useState } from 'react';
import { FileText, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplateLibrary from './TemplateLibrary';
import TemplatePreview from './TemplatePreview';
import TemplateEditor from './TemplateEditor';

interface Template {
  id: string;
  name: string;
  description: string;
  assistant_type: string;
  category: string;
  content: string;
  fields: any[];
  version: number;
}

interface TemplateManagerProps {
  assistantType?: string;
  onSelectTemplate?: (template: Template, fieldValues: Record<string, any>) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
  assistantType,
  onSelectTemplate
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [activeTab, setActiveTab] = useState('library');

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleUseTemplate = (template: Template, fieldValues: Record<string, any>) => {
    onSelectTemplate?.(template, fieldValues);
    setShowPreview(false);
    setSelectedTemplate(null);
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setShowEditor(true);
    setActiveTab('editor');
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setShowEditor(true);
    setActiveTab('editor');
  };

  const handleSaveTemplate = (template: any) => {
    setShowEditor(false);
    setEditingTemplate(null);
    setActiveTab('library');
    // Refresh the library
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setEditingTemplate(null);
    setActiveTab('library');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Template Manager</h1>
            <p className="text-gray-600">
              Create, manage, and use document templates
            </p>
          </div>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-6 mt-4">
            <TabsTrigger value="library">Template Library</TabsTrigger>
            <TabsTrigger value="editor" disabled={!showEditor}>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 overflow-y-auto p-6">
            <TemplateLibrary
              assistantType={assistantType}
              onSelectTemplate={handleTemplateSelect}
            />
          </TabsContent>

          <TabsContent value="editor" className="flex-1 overflow-y-auto p-6">
            {showEditor && (
              <TemplateEditor
                template={editingTemplate}
                assistantType={assistantType || 'secretary'}
                onSave={handleSaveTemplate}
                onCancel={handleCancelEdit}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Preview Modal */}
      {showPreview && selectedTemplate && (
        <TemplatePreview
          template={selectedTemplate}
          onClose={() => {
            setShowPreview(false);
            setSelectedTemplate(null);
          }}
          onUseTemplate={handleUseTemplate}
        />
      )}
    </div>
  );
};

export default TemplateManager;