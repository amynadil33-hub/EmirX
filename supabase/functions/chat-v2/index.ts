import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  message: string
  assistantId?: string
  assistantType?: string
  threadId?: string
  language?: string
  files?: Array<{
    name: string
    type: string
    size: number
    content: number[]
  }>
}

// Map assistant types to OpenAI Assistant IDs (you'll need to create these in OpenAI)
const ASSISTANT_IDS = {
  'hr': 'asst_hr_default', // Replace with actual assistant ID
  'secretary': 'asst_secretary_default',
  'lawyer': 'asst_lawyer_default',
  'research': 'asst_research_default',
  'accounting': 'asst_accounting_default',
  'marketing': 'asst_marketing_default'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, assistantType, threadId, files }: ChatRequest = await req.json()
    
    console.log('Received chat request:', { assistantType, hasMessage: !!message, hasFiles: !!files, threadId })
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Process uploaded files
    let fileContext = ''
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const content = await extractFileContent(file)
          fileContext += `\n\n--- Content from ${file.name} ---\n${content}\n--- End of ${file.name} ---\n`
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error)
          fileContext += `\n\n--- Error reading ${file.name}: ${error.message} ---\n`
        }
      }
    }

    // Prepare the full message with file context
    const fullMessage = fileContext 
      ? `${message}\n\nAttached files content:${fileContext}` 
      : message

    // Get assistant configuration based on assistantType
    const selectedAssistant = assistantType || 'hr'
    console.log('Using assistant type:', selectedAssistant)
    const assistantConfig = getAssistantConfig(selectedAssistant)
    // Use OpenAI Chat Completions API with assistant-like behavior
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { 
            role: 'system', 
            content: `${assistantConfig.systemPrompt}

IMPORTANT: When users upload documents, you MUST analyze the actual content provided and give specific, detailed insights based on what you read. Do not give generic responses about being unable to access files.

DOCUMENT GENERATION: You can create downloadable documents. Format responses with clear structure using markdown (# ## ###) for reports, analyses, and formal documents.`
          },
          { role: 'user', content: fullMessage }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`OpenAI API error: ${response.statusText} - ${errorData}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || 'No response generated'

    // Check if response should be downloadable
    const downloadData = await generateDownloadableContent(aiResponse, assistantType || 'secretary')

    return new Response(
      JSON.stringify({
        response: aiResponse,
        threadId: threadId || `thread_${Date.now()}`,
        ...downloadData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Chat function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: `I apologize, but I encountered an error: ${error.message}. Please try again.`
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function extractFileContent(file: any): Promise<string> {
  const { name, type, content } = file
  
  try {
    const uint8Array = new Uint8Array(content)
    
    // Text-based files
    if (type === 'text/csv' || type === 'text/plain' || name.endsWith('.txt') || name.endsWith('.csv')) {
      const text = new TextDecoder().decode(uint8Array)
      return `File: ${name}\n\nContent:\n${text}`
    }
    
    // JSON files
    if (type === 'application/json' || name.endsWith('.json')) {
      const text = new TextDecoder().decode(uint8Array)
      try {
        const jsonData = JSON.parse(text)
        return `JSON File: ${name}\n\nContent:\n${JSON.stringify(jsonData, null, 2)}`
      } catch {
        return `File: ${name}\n\nContent:\n${text}`
      }
    }
    
    // PDF files - improved extraction
    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array)
      
      // Multiple extraction strategies for PDFs
      // Strategy 1: Look for text between BT and ET markers (PDF text objects)
      const btEtMatches = text.match(/BT[\s\S]*?ET/g) || []
      let extractedText = ''
      
      for (const match of btEtMatches) {
        const textMatches = match.match(/\((.*?)\)/g) || []
        for (const textMatch of textMatches) {
          const cleaned = textMatch.slice(1, -1)
            .replace(/\\([0-9]{3})/g, (m, p1) => String.fromCharCode(parseInt(p1, 8)))
            .replace(/\\/g, '')
          extractedText += cleaned + ' '
        }
      }
      
      // Strategy 2: General text pattern extraction
      if (extractedText.length < 100) {
        const textPatterns = text.match(/[\x20-\x7E\s]{20,}/g) || []
        extractedText = textPatterns
          .filter(t => !t.includes('obj') && !t.includes('endobj') && !t.includes('stream'))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
      }
      
      if (extractedText.length > 50) {
        return `PDF Document: ${name}\n\nExtracted Content:\n${extractedText.slice(0, 5000)}`
      }
      
      return `PDF Document: ${name}\n\nNote: This appears to be a scanned PDF or contains primarily images. The document was uploaded successfully but text extraction is limited. File size: ${Math.round(uint8Array.length / 1024)}KB`
    }
    
    // Word documents - improved extraction
    if (type.includes('word') || type === 'application/msword' || name.endsWith('.docx') || name.endsWith('.doc')) {
      const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array)
      
      // For .docx files (which are actually zip files with XML)
      if (name.endsWith('.docx')) {
        // Extract text from Word XML
        const textContent = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || []
        let extractedText = textContent
          .map(match => match.replace(/<[^>]+>/g, ''))
          .join(' ')
          .trim()
        
        // Also try to extract from document.xml patterns
        if (extractedText.length < 100) {
          const altPatterns = text.match(/>([^<]{10,})</g) || []
          extractedText += ' ' + altPatterns
            .map(m => m.slice(1, -1))
            .filter(t => !t.includes('xml') && !t.includes('rels'))
            .join(' ')
        }
        
        if (extractedText.trim().length > 50) {
          return `Word Document: ${name}\n\nExtracted Content:\n${extractedText.trim().slice(0, 5000)}`
        }
      }
      
      // For older .doc files or when XML extraction fails
      const patterns = text.match(/[\x20-\x7E\s]{20,}/g) || []
      const fallbackText = patterns
        .filter(t => !t.includes('Microsoft') && !t.includes('Word.Document'))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
      
      if (fallbackText.length > 100) {
        return `Word Document: ${name}\n\nExtracted Content:\n${fallbackText.slice(0, 5000)}`
      }
      
      return `Word Document: ${name}\n\nNote: Document uploaded successfully. The file appears to use complex formatting. File size: ${Math.round(uint8Array.length / 1024)}KB`
    }
    
    // Excel files - improved extraction
    if (type.includes('sheet') || type === 'application/vnd.ms-excel' || name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array)
      
      // Extract shared strings from Excel XML
      const sharedStrings = text.match(/<(?:t|v)[^>]*>([^<]+)<\/(?:t|v)>/g) || []
      const extractedData = sharedStrings
        .map(match => match.replace(/<[^>]+>/g, ''))
        .filter(t => t.trim().length > 0 && !t.includes('xml'))
        .join('\n')
      
      if (extractedData.length > 50) {
        return `Excel Spreadsheet: ${name}\n\nExtracted Data:\n${extractedData.slice(0, 5000)}`
      }
      
      return `Excel Spreadsheet: ${name}\n\nNote: Spreadsheet uploaded successfully. File size: ${Math.round(uint8Array.length / 1024)}KB`
    }
    
    // Try generic text extraction for unknown types
    const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array)
    const cleanText = text.match(/[\x20-\x7E\s]{20,}/g)?.join(' ').slice(0, 5000)
    
    if (cleanText && cleanText.length > 100) {
      return `File: ${name} (${type})\n\nExtracted Content:\n${cleanText}`
    }
    
    return `File: ${name}\nType: ${type}\nSize: ${Math.round(uint8Array.length / 1024)}KB\n\nNote: File uploaded successfully. The content appears to be in a binary or specialized format.`
    
  } catch (error) {
    console.error(`Error extracting content from ${name}:`, error)
    return `File: ${name}\n\nNote: File uploaded but encountered an error during content extraction: ${error.message}`
  }
}

function getAssistantConfig(assistantId: string) {
  const configs = {
    'hr': {
      systemPrompt: `You are an expert HR Assistant. You help with:
- Recruitment and hiring processes
- Employee relations and conflict resolution
- HR policies and procedures
- Performance management
- Training and development
- Compensation and benefits
- Legal compliance

When analyzing uploaded documents, provide specific HR insights and recommendations.`
    },
    'secretary': {
      systemPrompt: `You are a professional Executive Secretary Assistant. You excel at:
- Administrative tasks and document management
- Meeting scheduling and coordination
- Professional correspondence
- Travel arrangements
- Office management
- Event planning

When reviewing uploaded documents, provide specific administrative insights and improvements.`
    },
    'lawyer': {
      systemPrompt: `You are a Legal Assistant with expertise in:
- Contract analysis and drafting
- Legal research and documentation
- Compliance and regulatory matters
- Legal memorandums
- Case summaries
- Document reviews

When analyzing uploaded legal documents, provide specific legal insights and identify key issues.`
    },
    'research': {
      systemPrompt: `You are a Research Assistant specializing in:
- Market research and analysis
- Data collection and interpretation
- Literature reviews
- Research methodology
- Statistical analysis
- Report writing

When analyzing uploaded documents, provide specific research insights and analytical findings.`
    },
    'accounting': {
      systemPrompt: `You are an Accounting Assistant expert in:
- Financial statement analysis
- Bookkeeping and ledger management
- Tax preparation and planning
- Budget analysis
- Cost accounting
- Financial reporting

When reviewing uploaded financial documents, provide specific accounting insights and calculations.`
    },
    'marketing': {
      systemPrompt: `You are a Marketing Assistant specializing in:
- Digital marketing strategies
- Content creation and copywriting
- Social media management
- Market analysis
- Campaign planning
- Brand development

When analyzing uploaded marketing materials, provide specific marketing insights and strategies.`
    },
    'developer': {
      systemPrompt: `You are a Software Development Assistant with expertise in:
- Code review and optimization
- Technical documentation
- Software architecture
- Debugging and troubleshooting
- API design and integration
- Development best practices

When analyzing uploaded code or technical documents, provide specific development insights and recommendations.`
    }
  }
  
  return configs[assistantId] || configs['secretary']
}

async function generateDownloadableContent(response: string, assistantId: string) {
  const hasStructuredContent = (
    response.length > 500 &&
    (response.includes('#') || response.includes('\n\n') || response.includes('1.'))
  )
  
  if (!hasStructuredContent) {
    return {}
  }
  
  const timestamp = new Date().toISOString().slice(0, 10)
  const filename = `${assistantId}_document_${timestamp}.txt`
  
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(response)
    const base64 = btoa(String.fromCharCode(...data))
    const dataUrl = `data:text/plain;charset=utf-8;base64,${base64}`
    
    return {
      fileUrl: dataUrl,
      filename: filename
    }
  } catch (error) {
    console.error('Error generating download:', error)
    return {}
  }
}
