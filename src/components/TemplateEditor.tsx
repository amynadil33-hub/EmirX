import React, { useState } from 'react';
import { Save, Plus, Trash2, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';

interface TemplateField {
  name: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

interface TemplateEditorProps {
  template?: any;
  assistantType: string;
  onSave?: (template: any) => void;
  onCancel?: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  assistantType,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || '',
    content: template?.content || '',
    is_public: template?.is_public ?? true
  });

  const [fields, setFields] = useState<TemplateField[]>(template?.fields || []);
  const [newField, setNewField] = useState<TemplateField>({
    name: '',
    type: 'text',
    label: '',
    required: false
  });
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'select', label: 'Select' }
  ];

  const categories = {
    hr: ['Onboarding', 'Performance', 'Policies', 'Training'],
    secretary: ['Meetings', 'Correspondence', 'Reports', 'Forms'],
    accounting: ['Invoicing', 'Reports', 'Statements', 'Analysis'],
    marketing: ['Campaigns', 'Reports', 'Proposals', 'Analysis'],
    research: ['Reports', 'Surveys', 'Analysis', 'Proposals'],
    lawyer: ['Contracts', 'Letters', 'Reports', 'Forms']
  };

  const addField = () => {
    if (newField.name && newField.label) {
      setFields([...fields, { ...newField }]);
      setNewField({
        name: '',
        type: 'text',
        label: '',
        required: false
      });
    }
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const templateData = {
        ...formData,
        assistant_type: assistantType,
        fields: fields
      };

      if (template?.id) {
        // Update existing template
        const { error } = await supabase
          .from('templates')
          .update(templateData)
          .eq('id', template.id);
        
        if (error) throw error;
      } else {
        // Create new template
        const { error } = await supabase
          .from('templates')
          .insert([templateData]);
        
        if (error) throw error;
      }

      onSave?.(templateData);
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderPreview = () => {
    let content = formData.content;
    fields.forEach(field => {
      const regex = new RegExp(`{{${field.name}}}`, 'g');
      content = content.replace(regex, `[${field.label}]`);
    });
    return content;
  };

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Template Preview</h2>
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            <X className="w-4 h-4 mr-2" />
            Close Preview
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap">
              {renderPreview()}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {template ? 'Edit Template' : 'Create New Template'}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter template name"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe what this template is for"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories[assistantType as keyof typeof categories]?.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData({...formData, is_public: checked})}
              />
              <Label htmlFor="is_public">Make template public</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Content */}
      <Card>
        <CardHeader>
          <CardTitle>Template Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            placeholder="Enter your template content. Use {{field_name}} for dynamic fields."
            rows={12}
            className="font-mono"
          />
        </CardContent>
      </Card>

      {/* Template Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Template Fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Fields */}
          {fields.map((field, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-4 gap-4">
                <div>
                  <Label>Field Name</Label>
                  <Input value={field.name} disabled />
                </div>
                <div>
                  <Label>Label</Label>
                  <Input value={field.label} disabled />
                </div>
                <div>
                  <Label>Type</Label>
                  <Input value={field.type} disabled />
                </div>
                <div className="flex items-center">
                  <Switch checked={field.required} disabled />
                  <Label className="ml-2">Required</Label>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeField(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {/* Add New Field */}
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <Label>Field Name</Label>
                <Input
                  value={newField.name}
                  onChange={(e) => setNewField({...newField, name: e.target.value})}
                  placeholder="field_name"
                />
              </div>
              <div>
                <Label>Label</Label>
                <Input
                  value={newField.label}
                  onChange={(e) => setNewField({...newField, label: e.target.value})}
                  placeholder="Display Label"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select 
                  value={newField.type} 
                  onValueChange={(value) => setNewField({...newField, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center">
                <Switch
                  checked={newField.required}
                  onCheckedChange={(checked) => setNewField({...newField, required: checked})}
                />
                <Label className="ml-2">Required</Label>
              </div>
            </div>
            <Button onClick={addField} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateEditor;