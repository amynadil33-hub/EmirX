import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Trash2, FolderOpen, File, Upload, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import DashboardLayout from './DashboardLayout';

interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  assistant_type: string;
  document_category: 'uploaded' | 'generated';
  created_at: string;
  metadata: any;
}

export default function DocumentLibrary() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const assistantTypes = [
    { id: 'hr', name: 'HR Assistant' },
    { id: 'secretary', name: 'Secretary Assistant' },
    { id: 'accounting', name: 'Accounting Assistant' },
    { id: 'marketing', name: 'Marketing Assistant' },
    { id: 'research', name: 'Research Assistant' },
    { id: 'lawyer', name: 'Lawyer Assistant' }
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedAssistant, selectedCategory]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.assistant_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedAssistant !== 'all') {
      filtered = filtered.filter(doc => doc.assistant_type === selectedAssistant);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.document_category === selectedCategory);
    }

    setFilteredDocs(filtered);
  };

  const downloadDocument = async (doc: Document) => {
    setDownloadingId(doc.id);
    try {
      console.log('Downloading document:', doc.original_filename);
      
      const { data, error } = await supabase.storage
        .from('user-documents')
        .download(doc.file_path);

      if (error) {
        console.error('Supabase download error:', error);
        throw new Error(`Download failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data received from download');
      }

      console.log('Downloaded blob:', { size: data.size, type: data.type });

      // Create download link with proper MIME type
      const blob = new Blob([data], { type: data.type || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.original_filename;
      link.style.display = 'none';
      
      // Add to DOM and trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 1000);
      
      console.log('Download initiated successfully');
    } catch (error) {
      console.error('Error downloading document:', error);
      alert(`Failed to download ${doc.original_filename}. Please try again.`);
    } finally {
      setDownloadingId(null);
    }
  };

  const deleteDocument = async (doc: Document) => {
    if (!confirm(`Are you sure you want to delete "${doc.original_filename}"?`)) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user-documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      setDocuments(prev => prev.filter(document => document.id !== doc.id));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAssistantName = (type: string) => {
    return assistantTypes.find(a => a.id === type)?.name || type;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    return '📄';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading documents...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Library</h1>
              <p className="text-gray-600">Manage your uploaded files and AI-generated documents</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <File className="w-4 h-4" />
                  {documents.length} total documents
                </span>
                <span className="flex items-center gap-1">
                  <Upload className="w-4 h-4" />
                  {documents.filter(d => d.document_category === 'uploaded').length} uploaded
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by filename or assistant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Filter by Assistant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assistants</SelectItem>
                  {assistantTypes.map(assistant => (
                    <SelectItem key={assistant.id} value={assistant.id}>
                      {assistant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="uploaded">Uploaded Files</SelectItem>
                  <SelectItem value="generated">Generated Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        {filteredDocs.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="text-center py-16">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No documents found</h3>
              <p className="text-gray-500 mb-4">
                {documents.length === 0 
                  ? "Upload documents through the chat interface to get started"
                  : "Try adjusting your search or filters"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocs.map((document) => (
              <Card key={document.id} className="hover:shadow-lg transition-all duration-200 border-gray-200">
                <CardContent className="p-6">
                  {/* File Icon & Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="text-2xl">{getFileIcon(document.file_type)}</div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                          {document.original_filename}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(document.file_size)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Metadata */}
                  <div className="space-y-3 mb-6">
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant={document.document_category === 'uploaded' ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {document.document_category === 'uploaded' ? '📤 Uploaded' : '🤖 Generated'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getAssistantName(document.assistant_type)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(document.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => downloadDocument(document)}
                      disabled={downloadingId === document.id}
                      className="flex-1 h-9"
                    >
                      {downloadingId === document.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteDocument(document)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}