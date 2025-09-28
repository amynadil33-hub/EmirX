import { supabase } from './supabase';

export interface DocumentMetadata {
  id?: string;
  filename: string;
  originalFilename: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  assistantType: string;
  documentCategory: 'uploaded' | 'generated';
  metadata?: any;
}

export class DocumentStorage {
  private static generateFilePath(userId: string, assistantType: string, filename: string, category: 'uploaded' | 'generated'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${userId}/${assistantType}/${category}/${timestamp}-${filename}`;
  }
  static async uploadFile(
    file: File | Blob,
    filename: string,
    assistantType: string,
    category: 'uploaded' | 'generated' = 'uploaded',
    metadata: any = {}
  ): Promise<DocumentMetadata & { extractedText?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const filePath = this.generateFilePath(user.id, assistantType, filename, category);
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Parse file content if it's an uploaded document
      let extractedText = '';
      if (category === 'uploaded') {
        try {
          const fileArray = new Uint8Array(await file.arrayBuffer());
          const { data: parseData, error: parseError } = await supabase.functions.invoke('file-parser', {
            body: {
              files: [{
                name: filename,
                type: file instanceof File ? file.type : 'application/octet-stream',
                size: file.size,
                content: Array.from(fileArray)
              }]
            }
          });

          if (!parseError && parseData?.success && parseData?.files?.[0]?.extractedText) {
            extractedText = parseData.files[0].extractedText;
          }
        } catch (parseError) {
          console.warn('File parsing failed:', parseError);
        }
      }

      // Save metadata to database
      const documentData = {
        user_id: user.id,
        filename: filename,
        original_filename: filename,
        file_path: filePath,
        file_type: file instanceof File ? file.type : 'application/octet-stream',
        file_size: file.size,
        assistant_type: assistantType,
        document_category: category,
        metadata: { ...metadata, extractedText }
      };

      const { data: dbData, error: dbError } = await supabase
        .from('user_documents')
        .insert(documentData)
        .select()
        .single();

      if (dbError) throw dbError;

      return {
        id: dbData.id,
        filename: dbData.filename,
        originalFilename: dbData.original_filename,
        filePath: dbData.file_path,
        fileType: dbData.file_type,
        fileSize: dbData.file_size,
        assistantType: dbData.assistant_type,
        documentCategory: dbData.document_category,
        metadata: dbData.metadata,
        extractedText
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  static async downloadFile(filePath: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from('user-documents')
        .download(filePath);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  static async deleteFile(documentId: string): Promise<void> {
    try {
      // Get document info first
      const { data: document, error: fetchError } = await supabase
        .from('user_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user-documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  static async getUserDocuments(assistantType?: string, category?: 'uploaded' | 'generated'): Promise<DocumentMetadata[]> {
    try {
      let query = supabase
        .from('user_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (assistantType) {
        query = query.eq('assistant_type', assistantType);
      }

      if (category) {
        query = query.eq('document_category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(doc => ({
        id: doc.id,
        filename: doc.filename,
        originalFilename: doc.original_filename,
        filePath: doc.file_path,
        fileType: doc.file_type,
        fileSize: doc.file_size,
        assistantType: doc.assistant_type,
        documentCategory: doc.document_category,
        metadata: doc.metadata
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  static async createDownloadUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('user-documents')
        .createSignedUrl(filePath, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error creating download URL:', error);
      throw error;
    }
  }
}