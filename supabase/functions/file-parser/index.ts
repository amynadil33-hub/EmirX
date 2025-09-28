import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FileParseRequest {
  files: Array<{
    name: string
    type: string
    size: number
    content: number[]
  }>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { files }: FileParseRequest = await req.json()
    
    if (!files || files.length === 0) {
      throw new Error('No files provided')
    }

    const parsedFiles = []
    
    for (const file of files) {
      try {
        const content = await parseFileContent(file)
        parsedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          content: content,
          success: true
        })
      } catch (error) {
        console.error(`Error parsing ${file.name}:`, error)
        parsedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          content: `Error parsing file: ${error.message}`,
          success: false
        })
      }
    }

    return new Response(
      JSON.stringify({ files: parsedFiles }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('File parser error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function parseFileContent(file: any): Promise<string> {
  const { name, type, size, content } = file
  const uint8Array = new Uint8Array(content)
  
  // Text files
  if (type === 'text/plain' || type === 'text/csv' || name.endsWith('.txt') || name.endsWith('.csv')) {
    return new TextDecoder('utf-8').decode(uint8Array)
  }
  
  // JSON files
  if (type === 'application/json' || name.endsWith('.json')) {
    const text = new TextDecoder('utf-8').decode(uint8Array)
    try {
      const jsonData = JSON.parse(text)
      return `JSON File: ${name}\n\n${JSON.stringify(jsonData, null, 2)}`
    } catch {
      return `JSON File: ${name}\n\n${text}`
    }
  }
  
  // PDF files - Enhanced extraction
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    try {
      const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array)
      
      // Multiple extraction strategies for PDF
      let extractedText = ''
      
      // Strategy 1: Look for text between BT and ET markers
      const btEtPattern = /BT\s*(.*?)\s*ET/gs
      const btEtMatches = text.match(btEtPattern) || []
      if (btEtMatches.length > 0) {
        extractedText = btEtMatches
          .map(match => match.replace(/BT|ET/g, ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
      }
      
      // Strategy 2: Extract readable text patterns
      if (!extractedText || extractedText.length < 100) {
        const textPatterns = text.match(/[\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF\u0100-\u017F\u0180-\u024F]+/g) || []
        extractedText = textPatterns
          .filter(t => t.length > 5 && !t.match(/^[0-9\s\.]+$/))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
      }
      
      if (extractedText.length > 50) {
        return `PDF Document: ${name} (${Math.round(size / 1024)}KB)\n\nExtracted Content:\n${extractedText}`
      }
      
      return `PDF Document: ${name} (${Math.round(size / 1024)}KB)\n\nNote: This PDF may contain images, scanned content, or complex formatting that requires specialized OCR tools for text extraction. The document structure was detected but text content could not be reliably extracted.`
    } catch (error) {
      console.error('PDF parsing error:', error)
      return `PDF Document: ${name} (${Math.round(size / 1024)}KB)\n\nError: Unable to parse PDF content - ${error.message}`
    }
  }
  
  // Word documents - Enhanced extraction
  if (type.includes('wordprocessingml') || type === 'application/msword' || name.endsWith('.docx') || name.endsWith('.doc')) {
    try {
      const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array)
      
      // Extract text from Word XML structure (DOCX format)
      const xmlTextPattern = /<w:t[^>]*>([^<]+)<\/w:t>/g
      const xmlMatches = []
      let match
      while ((match = xmlTextPattern.exec(text)) !== null) {
        xmlMatches.push(match[1])
      }
      
      if (xmlMatches.length > 0) {
        const extractedText = xmlMatches.join(' ').trim()
        return `Word Document: ${name} (${Math.round(size / 1024)}KB)\n\nExtracted Content:\n${extractedText}`
      }
      
      // Fallback: Extract readable text patterns
      const textPatterns = text.match(/[\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF\u0100-\u017F\u0180-\u024F]+/g) || []
      const cleanText = textPatterns
        .filter(t => t.length > 10 && !t.includes('xml') && !t.includes('xmlns') && !t.includes('w:'))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
      
      if (cleanText.length > 100) {
        return `Word Document: ${name} (${Math.round(size / 1024)}KB)\n\nExtracted Content:\n${cleanText}`
      }
      
      return `Word Document: ${name} (${Math.round(size / 1024)}KB)\n\nNote: Document structure detected but text extraction was limited. This may be due to complex formatting, tables, or embedded objects.`
    } catch (error) {
      return `Word Document: ${name} (${Math.round(size / 1024)}KB)\n\nError: Unable to extract content - ${error.message}`
    }
  }
  
  // Excel files - Enhanced extraction
  if (type.includes('spreadsheetml') || type === 'application/vnd.ms-excel' || name.endsWith('.xlsx') || name.endsWith('.xls')) {
    try {
      const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array)
      
      // Extract shared strings from Excel XML (XLSX format)
      const sharedStringPattern = /<t[^>]*>([^<]+)<\/t>/g
      const sharedStrings = []
      let match
      while ((match = sharedStringPattern.exec(text)) !== null) {
        sharedStrings.push(match[1])
      }
      
      if (sharedStrings.length > 0) {
        const extractedText = sharedStrings
          .filter(s => s.trim().length > 0)
          .join('\n')
        return `Excel Spreadsheet: ${name} (${Math.round(size / 1024)}KB)\n\nExtracted Data:\n${extractedText}`
      }
      
      // Try to extract cell values from worksheet XML
      const cellValuePattern = /<v>([^<]+)<\/v>/g
      const cellValues = []
      while ((match = cellValuePattern.exec(text)) !== null) {
        cellValues.push(match[1])
      }
      
      if (cellValues.length > 0) {
        const extractedData = cellValues.join('\n')
        return `Excel Spreadsheet: ${name} (${Math.round(size / 1024)}KB)\n\nExtracted Values:\n${extractedData}`
      }
      
      return `Excel Spreadsheet: ${name} (${Math.round(size / 1024)}KB)\n\nNote: Spreadsheet structure detected but data extraction was limited. The file may contain complex formulas, charts, or formatting.`
    } catch (error) {
      return `Excel File: ${name} (${Math.round(size / 1024)}KB)\n\nError: Unable to extract data - ${error.message}`
    }
  }
  
  // Try generic text extraction for unknown types
  try {
    const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array)
    const readableText = text.match(/[\x20-\x7E\u00A0-\u024F]+/g)?.join(' ').trim()
    
    if (readableText && readableText.length > 50) {
      return `File: ${name} (${type}, ${Math.round(size / 1024)}KB)\n\nExtracted Text:\n${readableText.slice(0, 5000)}`
    }
  } catch {
    // Ignore decode errors
  }
  
  return `File: ${name} (${type}, ${Math.round(size / 1024)}KB)\n\nFile uploaded successfully. This file type may require specialized processing or may contain binary data that cannot be displayed as text.`
}