// Enhanced document generation utilities for creating downloadable files
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import * as ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export interface DocumentContent {
  title: string
  content: string
  type: 'word' | 'excel' | 'pdf' | 'txt'
}

export class DocumentGenerator {
  static async generateWordDocument(title: string, content: string): Promise<Blob> {
    try {
      const paragraphs = this.parseContentToParagraphs(content)
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: title,
              heading: HeadingLevel.TITLE,
            }),
            ...paragraphs
          ],
        }],
      })

      return await Packer.toBlob(doc)
    } catch (error) {
      console.error('Error generating Word document:', error)
      // Fallback to plain text with correct MIME type
      return new Blob([`${title}\n\n${content}`], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      })
    }
  }

  static async generatePDFDocument(title: string, content: string): Promise<Blob> {
    try {
      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(18)
      doc.text(title, 20, 30)
      
      // Add content
      doc.setFontSize(12)
      const lines = doc.splitTextToSize(content, 170)
      doc.text(lines, 20, 50)
      
      return doc.output('blob')
    } catch (error) {
      console.error('Error generating PDF:', error)
      // Fallback to simple text-based PDF
      return new Blob([`${title}\n\n${content}`], { type: 'application/pdf' })
    }
  }

  static async generateExcelDocument(title: string, content: string): Promise<Blob> {
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Document')
      
      // Add title
      worksheet.addRow([title])
      worksheet.getRow(1).font = { bold: true, size: 16 }
      
      // Add content - split by lines and add each as a row
      const lines = content.split('\n').filter(line => line.trim())
      lines.forEach(line => {
        worksheet.addRow([line])
      })
      
      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = 50
      })
      
      const buffer = await workbook.xlsx.writeBuffer()
      return new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
    } catch (error) {
      console.error('Error generating Excel document:', error)
      // Fallback to CSV format
      const csvContent = `${title}\n${content.replace(/\n/g, '\n')}`
      return new Blob([csvContent], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
    }
  }

  static generateTextDocument(title: string, content: string): Blob {
    const textContent = `${title}\n${'='.repeat(title.length)}\n\n${content}`
    return new Blob([textContent], { type: 'text/plain; charset=utf-8' })
  }

  private static parseContentToParagraphs(content: string): Paragraph[] {
    const lines = content.split('\n')
    const paragraphs: Paragraph[] = []

    for (const line of lines) {
      if (line.trim() === '') {
        paragraphs.push(new Paragraph({ text: '' }))
        continue
      }

      if (line.startsWith('# ')) {
        paragraphs.push(new Paragraph({
          text: line.substring(2),
          heading: HeadingLevel.HEADING_1,
        }))
      } else if (line.startsWith('## ')) {
        paragraphs.push(new Paragraph({
          text: line.substring(3),
          heading: HeadingLevel.HEADING_2,
        }))
      } else if (line.startsWith('### ')) {
        paragraphs.push(new Paragraph({
          text: line.substring(4),
          heading: HeadingLevel.HEADING_3,
        }))
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        paragraphs.push(new Paragraph({
          text: line.substring(2),
          bullet: { level: 0 },
        }))
      } else {
        paragraphs.push(new Paragraph({
          children: [new TextRun(line)],
        }))
      }
    }

    return paragraphs
  }

  static downloadFile(blob: Blob, filename: string): void {
    try {
      console.log(`Initiating download: ${filename} (${blob.size} bytes)`)
      
      // Validate blob
      if (!blob || blob.size === 0) {
        throw new Error('Invalid or empty file')
      }
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      
      // Set link properties
      link.href = url
      link.download = filename
      link.style.display = 'none'
      link.setAttribute('download', filename)
      
      // Add to DOM and trigger download
      document.body.appendChild(link)
      
      // Force download with click event
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false
      })
      link.dispatchEvent(clickEvent)
      
      // Cleanup after delay
      setTimeout(() => {
        try {
          if (document.body.contains(link)) {
            document.body.removeChild(link)
          }
          URL.revokeObjectURL(url)
          console.log(`Download cleanup completed for: ${filename}`)
        } catch (cleanupError) {
          console.warn('Cleanup error:', cleanupError)
        }
      }, 2000)
      
      console.log(`Download triggered successfully: ${filename}`)
      
    } catch (error) {
      console.error('Download error:', error)
      
      // Enhanced fallback method
      try {
        console.log('Attempting alternative download method...')
        
        // Create a more compatible download approach
        const reader = new FileReader()
        reader.onload = function(e) {
          const link = document.createElement('a')
          link.href = e.target?.result as string
          link.download = filename
          link.style.display = 'none'
          
          document.body.appendChild(link)
          link.click()
          
          setTimeout(() => {
            if (document.body.contains(link)) {
              document.body.removeChild(link)
            }
          }, 1000)
        }
        reader.readAsDataURL(blob)
        
      } catch (fallbackError) {
        console.error('All download methods failed:', fallbackError)
        
        // Final fallback - open in new tab
        try {
          const url = URL.createObjectURL(blob)
          const newWindow = window.open(url, '_blank')
          if (!newWindow) {
            throw new Error('Popup blocked - please allow popups and try again')
          }
          setTimeout(() => URL.revokeObjectURL(url), 10000)
        } catch (finalError) {
          alert(`Download failed: ${error.message}. Please check your browser settings and allow downloads.`)
        }
      }
    }
  }
}