# Vector Store Setup Guide

## Overview
This guide explains how to set up vector stores for the OpenAI Assistants API to enable file search capabilities with specialized knowledge bases for each assistant.

## Required Environment Variables
The following environment variables need to be created in your Supabase project settings:

### Vector Store IDs
- `VECTOR_HR_ID` - Vector store for HR assistant knowledge base
- `VECTOR_SECRETARY_ID` - Vector store for Secretary assistant knowledge base  
- `VECTOR_ACCOUNTING_ID` - Vector store for Accounting assistant knowledge base
- `VECTOR_MARKETING_ID` - Vector store for Marketing assistant knowledge base
- `VECTOR_RESEARCH_ID` - Vector store for Research assistant knowledge base
- `VECTOR_LAWYER_ID` - Vector store for Lawyer assistant knowledge base

## Setup Steps

### 1. Create Vector Stores via OpenAI API
Use the OpenAI API to create vector stores for each assistant:

```bash
curl https://api.openai.com/v1/vector_stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "name": "HR Knowledge Base"
  }'
```

### 2. Upload Files to Vector Stores
Upload relevant documents for each assistant's domain:

```bash
# Upload files to a vector store
curl https://api.openai.com/v1/vector_stores/{vector_store_id}/file_batches \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -F "files=@hr-policies.pdf" \
  -F "files=@employee-handbook.pdf"
```

### 3. Add Environment Variables to Supabase
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Scroll down to "Project API keys" 
4. Click "Add new secret"
5. Add each VECTOR_*_ID with the corresponding vector store ID from step 1

### 4. Update Assistants (Optional)
You can also attach vector stores directly to assistants:

```bash
curl https://api.openai.com/v1/assistants/{assistant_id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "OpenAI-Beta: assistants=v2" \
  -d '{
    "tool_resources": {
      "file_search": {
        "vector_store_ids": ["{vector_store_id}"]
      }
    }
  }'
```

## Recommended File Types by Assistant

### HR Assistant
- Employee handbooks
- HR policies and procedures
- Benefits documentation
- Compliance guidelines
- Training materials

### Secretary Assistant  
- Meeting templates
- Communication protocols
- Calendar management guides
- Administrative procedures
- Contact directories

### Accounting Assistant
- Financial reporting standards
- Tax regulations
- Bookkeeping procedures
- Accounting software manuals
- Audit checklists

### Marketing Assistant
- Brand guidelines
- Marketing strategies
- Campaign templates
- Social media best practices
- Analytics reports

### Research Assistant
- Research methodologies
- Data analysis guides
- Industry reports
- Academic papers
- Survey templates

### Legal Assistant
- Contract templates
- Legal precedents
- Compliance requirements
- Regulatory documents
- Legal procedures

## Features Enabled

With vector stores configured, each assistant will have:
- **File Search Capabilities** - Search through uploaded documents
- **Contextual Responses** - Answers based on your specific knowledge base
- **Source Citations** - References to specific documents used
- **Semantic Search** - Understanding of context and meaning
- **Keyword Search** - Traditional text-based search

## Cost Considerations
- Vector storage costs $0.10 per GB per day
- First 1 GB is free
- File processing is automatic and included
- Consider document size and quantity when uploading

## Verification
Once set up, the chat interface will show "Vector Search Active" status and responses will include source citations when referencing uploaded documents.