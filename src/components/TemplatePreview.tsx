import React, { useState } from 'react';
import { X, Download, Copy, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

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

interface TemplatePreviewProps {
  template: Template;
  onClose: () => void;
  onUseTemplate?: (template: Template, fieldValues: Record<string, any>) => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onClose,
  onUseTemplate
}) => {
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [previewMode, setPreviewMode] = useState<'form' | 'preview'>('form');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const renderPreview = () => {
    let content = template.content;
    
    // Replace template variables with field values
    template.fields.forEach(field => {
      const value = fieldValues[field.name] || `{{${field.name}}}`;
      const regex = new RegExp(`{{${field.name}}}`, 'g');
      content = content.replace(regex, value);
    });

    return content;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const processedContent = renderPreview();
      
      // Create HTML document
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name}</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 40px; 
            line-height: 1.6; 
            color: #333;
        }
        .header { 
            border-bottom: 2px solid #007bff; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .content { 
            white-space: pre-wrap; 
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #007bff;
        }
        .meta { 
            color: #666; 
            font-size: 14px; 
            margin-bottom: 10px;
        }
        h1 { color: #007bff; margin: 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${template.name}</h1>
        <div class="meta">
            <strong>Category:</strong> ${template.category} | 
            <strong>Version:</strong> ${template.version} | 
            <strong>Generated:</strong> ${new Date().toLocaleDateString()}
        </div>
        <p>${template.description}</p>
    </div>
    <div class="content">
${processedContent}
    </div>
</body>
</html>`;

      // Create and download file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name.replace(/[^a-z0-9]/gi, '_')}_filled.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download template. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderField = (field: any) => {
    const value = fieldValues[field.name] || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.label}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.label}
            required={field.required}
            rows={3}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || 0)}
            placeholder={field.label}
            required={field.required}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleFieldChange(field.name, val)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.label}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary">{template.category}</Badge>
              <Badge variant="outline">v{template.version}</Badge>
              <Badge variant="outline">{template.fields.length} fields</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Mode Toggle */}
        <div className="flex border-b bg-white">
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              previewMode === 'form'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setPreviewMode('form')}
          >
            Fill Template ({template.fields.length} fields)
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              previewMode === 'preview'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setPreviewMode('preview')}
          >
            Preview Document
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {previewMode === 'form' ? (
            <div className="p-6 space-y-6">
              {template.fields.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>This template has no customizable fields.</p>
                </div>
              ) : (
                template.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderField(field)}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
                  {renderPreview()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            {template.fields.length > 0 && (
              <>
                {Object.keys(fieldValues).length} of {template.fields.length} fields filled
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2"
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download
            </Button>
            <Button 
              onClick={() => onUseTemplate?.(template, fieldValues)}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Use Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;