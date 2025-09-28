import React, { useState } from 'react'
import { Download, FileText, File, Table, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DocumentGenerator } from '@/lib/documentGenerator'
import { supabase } from '@/lib/supabase'

interface DocumentDownloaderProps {
  title: string
  content: string
  assistantType?: string
  className?: string
}

export default function DocumentDownloader({ 
  title, 
  content, 
  assistantType = 'assistant',
  className = '' 
}: DocumentDownloaderProps) {
  const [isGenerating, setIsGenerating] = useState<string | null>(null)

  const handleDownload = async (format: 'word' | 'pdf' | 'excel' | 'txt') => {
    setIsGenerating(format)
    console.log(`Starting download generation for format: ${format}`)
    
    try {
      let blob: Blob
      let filename: string
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const baseFilename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}`
      
      console.log(`Generating ${format} document with filename: ${baseFilename}`)
      
      switch (format) {
        case 'word':
          console.log('Generating Word document...')
          blob = await DocumentGenerator.generateWordDocument(title, content)
          filename = `${baseFilename}.docx`
          break
        case 'pdf':
          console.log('Generating PDF document...')
          blob = await DocumentGenerator.generatePDFDocument(title, content)
          filename = `${baseFilename}.pdf`
          break
        case 'excel':
          console.log('Generating Excel document...')
          blob = await DocumentGenerator.generateExcelDocument(title, content)
          filename = `${baseFilename}.xlsx`
          break
        case 'txt':
          console.log('Generating text document...')
          blob = DocumentGenerator.generateTextDocument(title, content)
          filename = `${baseFilename}.txt`
          break
        default:
          throw new Error(`Unsupported format: ${format}`)
      }
      
      console.log(`Generated blob for ${format}:`, {
        size: blob.size,
        type: blob.type,
        filename: filename
      })
      
      // Download the file
      console.log(`Initiating download for: ${filename}`)
      DocumentGenerator.downloadFile(blob, filename)
      
      // Optionally store in Supabase for user's document library
      try {
        console.log('Storing document in library...')
        const { DocumentStorage } = await import('@/lib/documentStorage')
        await DocumentStorage.uploadFile(blob, filename, assistantType, 'generated', {
          originalTitle: title,
          format: format,
          generatedAt: new Date().toISOString()
        })
        console.log('Document stored successfully in library')
      } catch (storageError) {
        console.warn('Failed to store document in library:', storageError)
        // Don't fail the download if storage fails
      }
      
    } catch (error) {
      console.error(`Error generating ${format} document:`, error)
      alert(`Failed to generate ${format} document. Error: ${error.message}`)
    } finally {
      setIsGenerating(null)
    }
  }

  const downloadOptions = [
    {
      format: 'word' as const,
      label: 'Word Document',
      icon: FileText,
      extension: '.docx',
      description: 'Microsoft Word format'
    },
    {
      format: 'pdf' as const,
      label: 'PDF Document',
      icon: File,
      extension: '.pdf',
      description: 'Portable Document Format'
    },
    {
      format: 'excel' as const,
      label: 'Excel Spreadsheet',
      icon: FileSpreadsheet,
      extension: '.xlsx',
      description: 'Microsoft Excel format'
    },
    {
      format: 'txt' as const,
      label: 'Text File',
      icon: Table,
      extension: '.txt',
      description: 'Plain text format'
    }
  ]

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Download className="w-4 h-4 text-blue-600" />
          <h3 className="font-medium text-sm">Download Document</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {downloadOptions.map((option) => {
            const Icon = option.icon
            const isLoading = isGenerating === option.format
            
            return (
              <Button
                key={option.format}
                variant="outline"
                size="sm"
                onClick={() => handleDownload(option.format)}
                disabled={isLoading || isGenerating !== null}
                className="flex items-center space-x-2 h-auto py-2 px-3"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <div className="text-left">
                  <div className="text-xs font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.extension}</div>
                </div>
              </Button>
            )
          })}
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Documents will be saved to your library automatically
        </p>
      </CardContent>
    </Card>
  )
}