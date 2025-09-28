import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, FileText, Download, Bot, User, BookOpen, Users, Briefcase, Calculator, Megaphone, Search, Scale, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import FileUploadZone from './FileUploadZone';

import TemplateLibrary from './TemplateLibrary';
import Notepad from './Notepad';
import DocumentDownloader from './DocumentDownloader';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isDocument?: boolean;
  filename?: string;
  fileUrl?: string;
  language?: 'en' | 'dv';
}

// Assistant configurations
const assistantConfigs = {
  hr: {
    name: 'HR Assistant',
    description: 'Manage recruitment, employee relations, and HR policies',
    icon: Users,
    color: 'from-pink-500 to-rose-500'
  },
  secretary: {
    name: 'Secretary Assistant',
    description: 'Schedule meetings, manage communications, and organize tasks',
    icon: Briefcase,
    color: 'from-blue-500 to-cyan-500'
  },
  accounting: {
    name: 'Accounting Assistant',
    description: 'Handle bookkeeping, financial reports, and tax calculations',
    icon: Calculator,
    color: 'from-green-500 to-emerald-500'
  },
  marketing: {
    name: 'Marketing Assistant',
    description: 'Create campaigns, analyze trends, and boost your brand',
    icon: Megaphone,
    color: 'from-purple-500 to-violet-500'
  },
  research: {
    name: 'Research Assistant',
    description: 'Conduct market research, analyze data, and provide insights',
    icon: Search,
    color: 'from-orange-500 to-amber-500'
  },
  lawyer: {
    name: 'Legal Assistant',
    description: 'Review contracts, provide legal guidance, and ensure compliance',
    icon: Scale,
    color: 'from-indigo-500 to-blue-600'
  }
}


const ChatInterfaceV2: React.FC = () => {
  // Get the path to determine which assistant
  const location = window.location.pathname;
  const pathParts = location.split('/');
  const assistantIdFromPath = pathParts[pathParts.length - 1] || 'hr';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug logging
  console.log('ChatInterfaceV2 - Current path:', location);
  console.log('ChatInterfaceV2 - Extracted assistantId:', assistantIdFromPath);
  console.log('ChatInterfaceV2 - Available assistants:', Object.keys(assistantConfigs));
  
  // Get assistant configuration
  const assistant = assistantConfigs[assistantIdFromPath as keyof typeof assistantConfigs] || assistantConfigs.hr;
  const assistantId = assistantIdFromPath; // Store for use in requests
  
  console.log('ChatInterfaceV2 - Selected assistant:', assistant?.name);
  
  const Icon = assistant.icon;
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset thread when switching assistants
  useEffect(() => {
    setThreadId(null);
    setMessages([]);
  }, [assistantId]);

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && uploadedFiles.length === 0) || isLoading) return;

    const userLanguage = 'en';
    const messageText = inputMessage; // Store the message before clearing
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText || (uploadedFiles.length > 0 ? `📎 Uploaded ${uploadedFiles.length} file(s)` : ''),
      isUser: true,
      timestamp: new Date(),
      language: userLanguage
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      console.log('Sending message with assistantId:', assistantId);
      console.log('Message text:', messageText);
      console.log('Uploaded files:', uploadedFiles.length);
      console.log('Thread ID:', threadId);
      
      const requestBody: any = {
        message: messageText,
        assistantType: assistantId, // Use assistantId directly
        language: userLanguage,
        threadId: threadId
      };
      // Add files if any are uploaded
      if (uploadedFiles.length > 0) {
        requestBody.files = uploadedFiles;
        console.log('Adding files to request:', uploadedFiles.map(f => f.name));
      }

      console.log('Request body:', requestBody);
      const { data, error } = await supabase.functions.invoke('chat-v2', {
        body: requestBody
      });

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Store thread ID for future messages
      if (data.threadId && !threadId) {
        setThreadId(data.threadId);
        console.log('Thread ID set:', data.threadId);
      }
      
      // Determine response language based on translation status from backend
      const responseLanguage = data.language || userLanguage;
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'No response',
        isUser: false,
        timestamp: new Date(),
        language: responseLanguage,
        isDocument: !!data.fileUrl,
        filename: data.filename,
        fileUrl: data.fileUrl
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Clear uploaded files after successful message
      if (uploadedFiles.length > 0) {
        setUploadedFiles([]);
      }
      
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Extract error message
      let errorContent = 'An error occurred. Please try again.';
      if (error.message) {
        errorContent = error.message;
      } else if (typeof error === 'string') {
        errorContent = error;
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `⚠️ ${errorContent}`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleFileUpload = async (files: File[] | any[]) => {
    try {
      // If files are already processed (from FileUploadZone), use them directly
      if (files.length > 0 && files[0].extractedText !== undefined) {
        setUploadedFiles(files);
        console.log(`Using processed files:`, files.map(f => f.filename || f.name));
        return;
      }

      // Convert raw File objects to the format expected by the file-parser API
      const fileData = await Promise.all(
        (files as File[]).map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            content: Array.from(new Uint8Array(arrayBuffer))
          };
        })
      );
      setUploadedFiles(fileData);
      console.log(`Prepared ${fileData.length} files for upload:`, fileData.map(f => f.name));
    } catch (error) {
      console.error('Error processing files:', error);
    }
  };

  const handleQuickFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await handleFileUpload(files);
    }
  };
  
  const handleTemplateSelect = (template: any) => {
    setInputMessage(template.content);
    setShowTemplates(false);
  };

  const handleDownload = async (fileUrl: string, filename: string) => {
    try {
      if (fileUrl.startsWith('data:')) {
        // Handle data URLs directly
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = fileUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Handle regular URLs
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h3 className="font-semibold text-gray-900 mb-2">Documents & Templates</h3>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Templates
            </Button>
          </div>
        </div>
        
        {showTemplates ? (
          <div className="flex-1 overflow-y-auto p-4">
            <TemplateLibrary 
              assistantType={assistantId || 'hr'}
              onSelectTemplate={handleTemplateSelect}
            />
          </div>
        ) : (
          <div className="flex-1 p-4 space-y-4">
            {/* Notepad */}
            <Notepad />
            
            {/* File Upload */}
            <FileUploadZone 
              assistantType={assistantId || 'hr'} 
              onUploadComplete={handleFileUpload} 
            />
            
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">📎 Files Ready to Send:</h4>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-blue-700 font-medium">{file.name}</span>
                      <span className="text-xs text-blue-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setUploadedFiles(files => files.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-gray-500">Files will be included with your next message</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        <div className={`px-6 py-4 border-b bg-gradient-to-r ${assistant.color}`}>
          <div className="flex items-center gap-3">
            <Icon className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-semibold text-white">{assistant.name}</h1>
              <p className="text-sm text-white/90">{assistant.description}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
               <p className="text-gray-500">Start a conversation</p>
              <p className="text-sm text-gray-400 mt-2">Upload documents or select a template to begin</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex mb-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[70%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 ${message.isUser ? 'ml-3' : 'mr-3'}`}>
                  {message.isUser ? 
                    <User className="w-8 h-8 p-1.5 bg-blue-500 text-white rounded-full" /> :
                    <Icon className="w-8 h-8 p-1.5 bg-gray-500 text-white rounded-full" />
                  }
                </div>
                 <div className={`px-4 py-2 rounded-lg ${
                   message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-100'
                 } ${message.language === 'dv' ? 'dhivehi-text' : ''}`}>
                   <p className="whitespace-pre-wrap">{message.content}</p>
                   {message.isDocument && message.filename && message.fileUrl && (
                     <div className="mt-2 pt-2 border-t border-gray-200">
                       <Button
                         size="sm"
                         variant="outline"
                         className="flex items-center gap-2"
                         onClick={() => handleDownload(message.fileUrl!, message.filename!)}
                       >
                         <Download className="w-4 h-4" />
                         Download {message.filename}
                       </Button>
                     </div>
                   )}
                   
                   {/* Add DocumentDownloader for assistant messages that could be documents */}
                   {!message.isUser && message.content.length > 200 && 
                    !message.content.startsWith('⚠️') && 
                    !message.content.includes('Error') && (
                     <div className="mt-3">
                       <DocumentDownloader 
                         title={`${assistant.name} Response`}
                         content={message.content}
                         assistantType={assistantId || 'hr'}
                         className="max-w-sm"
                       />
                     </div>
                   )}
                 </div>
               </div>
             </div>
           ))}


          {isLoading && (
            <div className="flex justify-start mb-4">
              <Icon className="w-8 h-8 p-1.5 bg-gray-500 text-white rounded-full mr-3" />
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
           <div ref={messagesEndRef} />
        </div>

        <div className="px-6 py-4 border-t">
          {/* Show uploaded files indicator above input */}
          {uploadedFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  <FileText className="w-3 h-3" />
                  <span>{file.name}</span>
                  <button
                    onClick={() => setUploadedFiles(files => files.filter((_, i) => i !== index))}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
               placeholder={uploadedFiles.length > 0 ? `Message with ${uploadedFiles.length} file(s)...` : "Type your message..."}
               className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               disabled={isLoading}
            />
            
            {/* File Upload Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className={`px-3 ${uploadedFiles.length > 0 ? 'bg-blue-50 border-blue-200 text-blue-600' : ''}`}
              title="Upload files (PDF, Word, Excel, CSV, TXT)"
            >
              <Paperclip className="w-4 h-4" />
              {uploadedFiles.length > 0 && (
                <span className="ml-1 text-xs">{uploadedFiles.length}</span>
              )}
            </Button>
            
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleQuickFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json"
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && uploadedFiles.length === 0) || isLoading}
              className={uploadedFiles.length > 0 ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterfaceV2;