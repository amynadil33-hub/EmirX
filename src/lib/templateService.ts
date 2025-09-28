import { supabase } from './supabase';

export interface Template {
  id: string;
  name: string;
  description: string;
  assistant_type: string;
  category: string;
  content: string;
  fields: TemplateField[];
  is_public: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  version: number;
  is_active: boolean;
}

export interface TemplateField {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select';
  label: string;
  required: boolean;
  options?: string[];
}

export interface TemplateVersion {
  id: string;
  template_id: string;
  version: number;
  content: string;
  fields: TemplateField[];
  change_notes?: string;
  created_by?: string;
  created_at: string;
}

export class TemplateService {
  static async getTemplates(assistantType?: string): Promise<Template[]> {
    let query = supabase
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (assistantType) {
      query = query.eq('assistant_type', assistantType);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }

  static async getTemplate(id: string): Promise<Template | null> {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createTemplate(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .insert([template])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateTemplate(id: string, updates: Partial<Template>): Promise<Template> {
    const { data, error } = await supabase
      .from('templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('templates')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  }

  static async createVersion(templateId: string, content: string, fields: TemplateField[], changeNotes?: string): Promise<TemplateVersion> {
    // Get current version number
    const { data: currentTemplate } = await supabase
      .from('templates')
      .select('version')
      .eq('id', templateId)
      .single();

    const newVersion = (currentTemplate?.version || 0) + 1;

    // Create version record
    const { data: versionData, error: versionError } = await supabase
      .from('template_versions')
      .insert([{
        template_id: templateId,
        version: newVersion,
        content,
        fields,
        change_notes: changeNotes
      }])
      .select()
      .single();

    if (versionError) throw versionError;

    // Update template version
    const { error: updateError } = await supabase
      .from('templates')
      .update({ 
        version: newVersion,
        content,
        fields,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId);

    if (updateError) throw updateError;

    return versionData;
  }

  static async getVersions(templateId: string): Promise<TemplateVersion[]> {
    const { data, error } = await supabase
      .from('template_versions')
      .select('*')
      .eq('template_id', templateId)
      .order('version', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static processTemplate(template: Template, fieldValues: Record<string, any>): string {
    let content = template.content;
    
    // Replace template variables with field values
    template.fields.forEach(field => {
      const value = fieldValues[field.name] || '';
      const regex = new RegExp(`{{${field.name}}}`, 'g');
      content = content.replace(regex, String(value));
    });

    return content;
  }

  static async generateDocument(template: Template, fieldValues: Record<string, any>, filename?: string): Promise<string> {
    const processedContent = this.processTemplate(template, fieldValues);
    
    try {
      const { data, error } = await supabase.functions.invoke('document-generator', {
        body: {
          content: processedContent,
          filename: filename || `${template.name}.html`,
          templateId: template.id,
          fieldValues
        }
      });

      if (error) throw error;
      
      return data.content;
    } catch (error) {
      console.error('Error generating document:', error);
      throw error;
    }
  }
}

export default TemplateService;