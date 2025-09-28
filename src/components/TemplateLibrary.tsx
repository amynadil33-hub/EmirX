import React, { useState, useEffect } from 'react';
import { FileText, Plus, Eye, Edit, Copy, Download, Search, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TemplatePreview from './TemplatePreview';
import { TemplateService } from '@/lib/templateService';

interface Template {
  id: string;
  name: string;
  description: string;
  assistant_type: string;
  category: string;
  content: string;
  fields: any[];
  is_public: boolean;
  created_at: string;
  version: number;
}

interface TemplateLibraryProps {
  assistantType?: string;
  onSelectTemplate?: (template: Template) => void;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ 
  assistantType, 
  onSelectTemplate 
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [assistantType]);

  const fetchTemplates = async () => {
    try {
      const data = await TemplateService.getTemplates(assistantType);
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async (template: Template) => {
    setDownloadingId(template.id);
    try {
      // Create a simple HTML document with the template content
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .content { white-space: pre-wrap; }
        .fields { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${template.name}</h1>
        <p><strong>Description:</strong> ${template.description}</p>
        <p><strong>Category:</strong> ${template.category}</p>
        <p><strong>Version:</strong> ${template.version}</p>
    </div>
    <div class="content">
        ${template.content}
    </div>
    ${template.fields.length > 0 ? `
    <div class="fields">
        <h3>Template Fields:</h3>
        <ul>
            ${template.fields.map(field => `
                <li><strong>${field.label}</strong> (${field.type})${field.required ? ' - Required' : ''}</li>
            `).join('')}
        </ul>
    </div>
    ` : ''}
</body>
</html>`;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name.replace(/[^a-z0-9]/gi, '_')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleUseTemplate = (template: Template, fieldValues: Record<string, any>) => {
    const processedContent = TemplateService.processTemplate(template, fieldValues);
    
    // Copy to clipboard
    navigator.clipboard.writeText(processedContent).then(() => {
      alert('Template content copied to clipboard!');
    }).catch(() => {
      // Fallback - create a textarea and copy
      const textarea = document.createElement('textarea');
      textarea.value = processedContent;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Template content copied to clipboard!');
    });

    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
    setSelectedTemplate(null);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(templates.map(t => t.category))];

  const assistantTypeLabels = {
    hr: 'HR Assistant',
    secretary: 'Secretary Assistant', 
    accounting: 'Accounting Assistant',
    marketing: 'Marketing Assistant',
    research: 'Research Assistant',
    lawyer: 'Lawyer Assistant'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Template Library</h2>
          <p className="text-gray-600 mt-1">
            {assistantType 
              ? `Templates for ${assistantTypeLabels[assistantType as keyof typeof assistantTypeLabels]}`
              : 'Browse all available templates'
            }
          </p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => window.location.href = '/templates'}
        >
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{template.name}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {template.description}
                  </CardDescription>
                </div>
                <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary">{template.category}</Badge>
                {!assistantType && (
                  <Badge variant="outline">
                    {assistantTypeLabels[template.assistant_type as keyof typeof assistantTypeLabels]}
                  </Badge>
                )}
                <Badge variant="outline">v{template.version}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadTemplate(template)}
                  disabled={downloadingId === template.id}
                >
                  {downloadingId === template.id ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No templates available for this assistant type.'
            }
          </p>
        </div>
      )}

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <TemplatePreview
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onUseTemplate={handleUseTemplate}
        />
      )}
    </div>
  );
};

export default TemplateLibrary;