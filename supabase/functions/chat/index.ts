import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  message: string
  assistantId: string
  threadId?: string
  files?: Array<{
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
    const { message, assistantId, threadId, files }: ChatRequest = await req.json()
    
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

    const assistantConfig = getAssistantConfig(assistantId)
    
    // Prepare the full message with file context
    const fullMessage = fileContext 
      ? `${message}\n\nAttached files content:${fileContext}` 
      : message

    // Enhanced system prompt for document generation
    const systemPrompt = `${assistantConfig.systemPrompt}

IMPORTANT DOCUMENT GENERATION CAPABILITY:
You can generate downloadable documents when appropriate. When creating structured content like reports, analyses, templates, or formal documents, format your response to be comprehensive and well-structured.

For document generation, create content that includes:
- Clear headings and structure using markdown format (# ## ###)
- Proper formatting with line breaks and sections
- Comprehensive content that would be useful as a standalone document
- Professional language and formatting
- When generating reports, include executive summaries, detailed sections, and conclusions

File types you can generate:
- Word documents (.docx) for reports, letters, proposals, memos
- Excel spreadsheets (.xlsx) for data analysis, budgets, schedules, financial reports
- CSV files for data exports and structured data
- Text documents for simple reports and documentation

Always provide thorough, professional responses that add significant value. When users upload documents, analyze them comprehensively and provide detailed insights.`

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
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
    const aiResponse = data.choices[0]?.message?.content || 'No response generated'

    // Check if response should be downloadable
    const downloadData = await generateDownloadableContent(aiResponse, assistantId)

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
        response: `I apologize, but I encountered an error processing your request: ${error.message}. Please try again.`
      }),
      { 
        status: 200, // Return 200 to prevent frontend errors
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function extractFileContent(file: any): Promise<string> {
  const { name, type, content } = file
  
  try {
    // Convert number array back to Uint8Array
    const uint8Array = new Uint8Array(content)
    
    if (type === 'text/csv' || type === 'text/plain') {
      const text = new TextDecoder().decode(uint8Array)
      return `File Content (${type}):\n${text}`
    }
    
    if (type === 'application/json') {
      const text = new TextDecoder().decode(uint8Array)
      try {
        const jsonData = JSON.parse(text)
        return `JSON Data from ${name}:\n${JSON.stringify(jsonData, null, 2)}`
      } catch {
        return `JSON file content:\n${text}`
      }
    }
    
    if (type === 'application/pdf') {
      return `PDF document "${name}" has been uploaded. I can see this is a PDF file with ${Math.round(uint8Array.length / 1024)}KB of content. Please let me know what specific information you'd like me to extract or analyze from this PDF document. I can help with summarizing, finding specific information, or analyzing the content based on your needs.`
    }
    
    if (type.includes('wordprocessingml') || type === 'application/msword') {
      return `Word document "${name}" (${Math.round(uint8Array.length / 1024)}KB) has been uploaded. I can see this is a Word document. Please describe what you'd like me to help you with regarding this document - I can analyze its content, create summaries, extract information, or help you create related documents.`
    }
    
    if (type.includes('spreadsheetml') || type === 'application/vnd.ms-excel') {
      return `Excel spreadsheet "${name}" (${Math.round(uint8Array.length / 1024)}KB) has been uploaded. I can see this is an Excel file. Please let me know what analysis you'd like me to perform - I can help with data analysis, create reports, generate summaries, or assist with financial calculations.`
    }
    
    // Try to read as text for other formats
    try {
      const text = new TextDecoder().decode(uint8Array)
      if (text.length > 0) {
        return `Content from ${name}:\n${text.slice(0, 5000)}${text.length > 5000 ? '\n... (content truncated)' : ''}`
      }
    } catch (e) {
      // Ignore decode errors
    }
    
    return `File "${name}" (${type}, ${Math.round(uint8Array.length / 1024)}KB) has been uploaded successfully. I can see the file data. Please describe what you'd like me to help you with regarding this file.`
    
  } catch (error) {
    return `I received the file "${name}" but encountered an issue reading it: ${error.message}. Please let me know what you'd like me to help you with regarding this file, and I'll do my best to assist you.`
  }
}

function getAssistantConfig(assistantId: string) {
  const configs = {
    'hr-assistant': {
      systemPrompt: 'You are an expert HR Assistant specializing in human resources, recruitment, employee relations, and workplace policies. You can analyze uploaded documents like resumes, policies, employee handbooks, and HR data. Create comprehensive HR documents including job descriptions, policy documents, employee evaluations, and training materials. Always maintain professional HR standards and include relevant legal considerations.'
    },
    'secretary-assistant': {
      systemPrompt: 'You are a professional Executive Secretary Assistant. You excel at administrative tasks, document management, correspondence, and creating professional business documents. You can analyze uploaded files and create downloadable documents like letters, memos, meeting minutes, reports, and administrative templates. Always maintain a professional, courteous tone.'
    },
    'lawyer-assistant': {
      systemPrompt: 'You are a Legal Assistant with expertise in law, contracts, legal research, and document preparation. You can review uploaded legal documents, contracts, and legal files. Create professional legal documents including contract analyses, legal memos, research summaries, and document reviews. Always include appropriate legal disclaimers and provide thorough, accurate analysis.'
    },
    'research-assistant': {
      systemPrompt: 'You are a Research Assistant specializing in comprehensive research, data analysis, and report generation. You can analyze uploaded research documents, data files, academic papers, and datasets. Create detailed research reports with proper analysis, citations, findings, and recommendations. Focus on thorough analysis and evidence-based conclusions.'
    },
    'accounting-assistant': {
      systemPrompt: 'You are an Accounting Assistant expert in financial analysis, bookkeeping, tax preparation, and financial reporting. You can analyze uploaded financial documents, spreadsheets, receipts, and financial data. Create detailed financial reports, budget analyses, expense summaries, and accounting documents. Always ensure accuracy in financial calculations and reporting.'
    },
    'business-assistant': {
      systemPrompt: 'You are a Business Strategy Assistant specializing in business planning, market analysis, and strategic consulting. You can analyze uploaded business documents, reports, and data. Create comprehensive business documents including business plans, market analyses, strategic reports, and executive summaries. Focus on actionable insights and strategic recommendations.'
    }
  }
  
  return configs[assistantId] || configs['business-assistant']
}

async function generateDownloadableContent(response: string, assistantId: string) {
  // Enhanced detection for downloadable content
  const hasStructuredContent = (
    response.length > 600 &&
    (
      // Markdown headers
      response.includes('# ') || response.includes('## ') || response.includes('### ') ||
      // Lists and structure
      response.includes('1.') || response.includes('2.') || response.includes('- ') || response.includes('* ') ||
      // Professional document keywords
      response.includes('Executive Summary') || response.includes('Analysis') || 
      response.includes('Recommendations') || response.includes('Conclusion') ||
      response.includes('Report') || response.includes('Document') ||
      response.includes('Summary') || response.includes('Overview') ||
      response.includes('Introduction') || response.includes('Background') ||
      response.includes('Findings') || response.includes('Results') ||
      // Business/professional terms
      response.includes('Budget') || response.includes('Plan') || 
      response.includes('Strategy') || response.includes('Policy') ||
      response.includes('Proposal') || response.includes('Agreement') ||
      // Multiple paragraphs with structure
      (response.split('\n\n').length >= 3 && response.includes(':'))
    )
  )
  
  if (!hasStructuredContent) {
    return {}
  }
  
  // Determine file type based on assistant and content
  let fileExtension = 'docx'
  let mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  
  // Assistant-specific file types
  if (assistantId === 'accounting-assistant') {
    if (response.includes('$') || response.includes('budget') || response.includes('financial') || 
        response.includes('expense') || response.includes('revenue') || response.includes('cost')) {
      fileExtension = 'xlsx'
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  } else if (assistantId === 'research-assistant') {
    if (response.includes('data') && (response.includes(',') || response.includes('|'))) {
      fileExtension = 'csv'
      mimeType = 'text/csv'
    }
  }
  
  // Content-based file type detection
  if (response.includes('|') && response.includes('-') && response.split('\n').some(line => line.includes('|'))) {
    // Table format detected
    fileExtension = 'csv'
    mimeType = 'text/csv'
  }
  
  // Generate filename
  const timestamp = new Date().toISOString().slice(0, 10)
  const assistantName = assistantId.replace('-assistant', '')
  const filename = `${assistantName}_document_${timestamp}.${fileExtension}`
  
  // Create downloadable content
  try {
    let processedContent = response
    
    // For CSV files, convert table format
    if (fileExtension === 'csv' && response.includes('|')) {
      const lines = response.split('\n')
      const tableLines = lines.filter(line => line.includes('|') && !line.includes('---'))
      if (tableLines.length > 0) {
        processedContent = tableLines
          .map(line => line.split('|').map(cell => cell.trim()).filter(cell => cell).join(','))
          .join('\n')
      }
    }
    
    const encoder = new TextEncoder()
    const data = encoder.encode(processedContent)
    const base64 = btoa(String.fromCharCode(...data))
    const dataUrl = `data:${mimeType};base64,${base64}`
    
    return {
      downloadUrl: dataUrl,
      filename: filename
    }
  } catch (error) {
    console.error('Error generating download content:', error)
    return {}
  }
}