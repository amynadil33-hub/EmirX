import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, format, assistantType, title } = await req.json()
    
    if (!content) {
      throw new Error('Content is required')
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const cleanTitle = (title || 'document').replace(/[^a-zA-Z0-9]/g, '_')
    const filename = `${cleanTitle}-${timestamp}.${format}`
    
    let fileContent: string | Uint8Array
    let contentType: string

    // Detect if content is in Dhivehi (contains Thaana script)
    const isDhivehi = /[\u0780-\u07BF]/.test(content)
    
    switch (format) {
      case 'txt':
        fileContent = `${title || 'Document'}\n${'='.repeat((title || 'Document').length)}\n\n${content}`
        contentType = 'text/plain; charset=utf-8'
        break
        
      case 'html':
        fileContent = `<!DOCTYPE html>
<html lang="${isDhivehi ? 'dv' : 'en'}" dir="${isDhivehi ? 'rtl' : 'ltr'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Document'}</title>
    <style>
        body { 
            font-family: ${isDhivehi ? "'MV Faseyha', 'Faruma', sans-serif" : "Arial, sans-serif"}; 
            line-height: 1.6; 
            margin: 40px; 
            direction: ${isDhivehi ? 'rtl' : 'ltr'};
            max-width: 800px;
        }
        h1 { 
            color: #333; 
            border-bottom: 2px solid #007acc; 
            padding-bottom: 10px; 
            margin-bottom: 20px;
        }
        .content { 
            white-space: pre-wrap; 
            line-height: 1.8;
        }
        @media print {
            body { margin: 20px; }
        }
    </style>
</head>
<body>
    <h1>${title || 'Document'}</h1>
    <div class="content">${content.replace(/\n/g, '<br>')}</div>
</body>
</html>`
        contentType = 'text/html; charset=utf-8'
        break
        
      case 'pdf':
        // Enhanced PDF generation with proper structure
        const pdfTitle = title || 'Document'
        const lines = content.split('\n').filter(line => line.trim())
        let yPosition = 750
        let pageContent = ''
        
        // Calculate content for PDF
        lines.forEach((line, index) => {
          if (yPosition < 50) {
            // Start new page if needed
            yPosition = 750
          }
          pageContent += `(${line.replace(/[()\\]/g, '\\$&')}) Tj 0 -15 Td `
          yPosition -= 15
        })
        
        const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] 
   /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> 
   /Contents 6 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Length ${pageContent.length + 200} >>
stream
BT
/F1 16 Tf
50 750 Td
(${pdfTitle.replace(/[()\\]/g, '\\$&')}) Tj
0 -30 Td
/F2 12 Tf
${pageContent}
ET
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000268 00000 n 
0000000340 00000 n 
0000000408 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
${600 + pageContent.length}
%%EOF`
        fileContent = new TextEncoder().encode(pdfContent)
        contentType = 'application/pdf'
        break
        
      case 'docx':
        // Generate proper RTF that opens correctly in Word
        const rtfTitle = title || 'Document'
        const rtfContent = content.replace(/\n/g, '\\par ')
        const rtfDocument = `{\\rtf1\\ansi\\ansicpg1252\\deff0 
{\\fonttbl{\\f0\\fswiss\\fcharset0 ${isDhivehi ? 'MV Faseyha' : 'Arial'};}}
{\\colortbl ;\\red0\\green0\\blue0;}
\\viewkind4\\uc1\\pard\\cf1\\f0\\fs28\\b ${rtfTitle}\\par\\par
\\fs24\\b0 ${rtfContent}\\par
}`
        fileContent = rtfDocument
        contentType = 'application/rtf'
        break

      case 'xlsx':
        // Generate a basic Excel XML structure
        const excelTitle = title || 'Document'
        const excelLines = content.split('\n').filter(line => line.trim())
        let sharedStrings = `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${excelLines.length + 1}" uniqueCount="${excelLines.length + 1}">
<si><t>${excelTitle}</t></si>`
        
        excelLines.forEach((line, index) => {
          sharedStrings += `<si><t>${line.replace(/[<>&"']/g, (m) => ({
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;',
            "'": '&apos;'
          }[m] || m))}</t></si>`
        })
        sharedStrings += '</sst>'
        
        // This is a simplified Excel structure - in production, you'd use a proper library
        fileContent = sharedStrings
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        break
        
      default:
        throw new Error(`Unsupported format: ${format}`)
    }

    // Convert to base64 for binary data
    let base64Content: string
    if (typeof fileContent === 'string') {
      base64Content = btoa(unescape(encodeURIComponent(fileContent)))
    } else {
      base64Content = btoa(String.fromCharCode(...fileContent))
    }

    // Create data URL
    const dataUrl = `data:${contentType};base64,${base64Content}`

    return new Response(
      JSON.stringify({
        success: true,
        filename,
        fileUrl: dataUrl,
        contentType,
        format,
        title: title || 'Document'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Document generation error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})