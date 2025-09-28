# Dhivehi Language Support Implementation

## Architecture Overview

The Musalhu SaaS platform implements Dhivehi (Thaana script) support using a three-layer translation architecture:

```
User Input (Dhivehi/English) → Translation Layer → Assistant (English Only) → Translation Layer → Output (Dhivehi/English)
```

## 🔑 Core Implementation Rules

1. **Assistant Reasoning**: All OpenAI assistants reason exclusively in English
2. **Translation Layers**: Google Translate API handles Dhivehi ↔ English conversion
3. **Thaana Detection**: Unicode range U+0780–U+07BF identifies Dhivehi text
4. **Frontend Rendering**: RTL text direction with professional Dhivehi fonts

## 📁 Key Files Modified

### Backend (Edge Functions)

#### `/supabase/functions/chat-v2/index.ts`
- **Input Layer**: Detects Thaana script and translates Dhivehi → English
- **Reasoning Layer**: Processes in English only with OpenAI API
- **Output Layer**: Translates English → Dhivehi based on user's input language
- **Fallback Handling**: Returns clarification request if translation fails

#### `/supabase/functions/document-generator/index.ts`
- Detects Dhivehi content in generated documents
- Applies proper RTL formatting for PDF/HTML exports
- Embeds Dhivehi fonts in document metadata

### Frontend Components

#### `/src/components/ChatInterfaceV2.tsx`
- Detects user input language (Dhivehi/English)
- Tags messages with language metadata
- Applies `.dhivehi-text` CSS class for proper rendering
- Bidirectional text support in input field

#### `/src/styles/globals.css`
```css
.dhivehi-text {
  font-family: 'MV Faseyha', 'Faruma', sans-serif;
  direction: rtl;
  unicode-bidi: isolate;
  text-align: right;
  line-height: 1.8;
  font-size: 1.05em;
}
```

## 🔧 Setup Instructions

### 1. Google Translate API

1. Enable Google Cloud Translation API in your GCP project
2. Create an API key with Translation API permissions
3. Add to Supabase environment variables:
   ```bash
   supabase secrets set GOOGLE_TRANSLATE_API_KEY=your-api-key
   ```

### 2. Dhivehi Fonts

1. Download required fonts:
   - **MV Faseyha**: Primary Dhivehi font
   - **Faruma**: Alternative open-source font

2. Place font files in `/public/fonts/`:
   - `MV_Faseyha.ttf`
   - `Faruma.ttf`

### 3. Environment Configuration

Update `.env.local`:
```env
GOOGLE_TRANSLATE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## 🌐 Translation Flow

### Input Processing
```typescript
// Detect Thaana script
function containsThaana(text: string): boolean {
  return /[\u0780-\u07BF]/.test(text)
}

// Translate if Dhivehi detected
if (isDhivehi(message)) {
  userLanguage = 'dv'
  processedMessage = await translate(message, 'en', 'dv')
}
```

### Output Processing
```typescript
// Translate response back to Dhivehi if needed
if (userLanguage === 'dv') {
  finalResponse = await translate(aiResponse, 'dv', 'en')
}
```

## 📝 Usage Examples

### User writes in Dhivehi:
1. User: "މިއީ ޓެސްޓް މެސެޖެއް"
2. System: Translates to English → "This is a test message"
3. Assistant: Processes in English → "I understand your test message..."
4. System: Translates back to Dhivehi → "އަހަރެން ތިޔަ ޓެސްޓް މެސެޖް..."
5. Display: Shows Dhivehi response with RTL formatting

### User writes in English:
1. User: "Hello, how are you?"
2. System: No translation needed
3. Assistant: Processes in English → "Hello! I'm doing well..."
4. System: No translation needed
5. Display: Shows English response with LTR formatting

## 🎨 UI/UX Considerations

- **Auto-detection**: System automatically detects language from input
- **Bidirectional Support**: Input field supports both RTL and LTR
- **Font Fallback**: Gracefully degrades if custom fonts unavailable
- **Mixed Content**: Supports documents with both English and Dhivehi

## 🚀 Testing

1. **Basic Dhivehi Input**: Type any Thaana text and verify translation
2. **Mixed Language**: Test sentences with both scripts
3. **Document Generation**: Export documents with Dhivehi content
4. **Font Rendering**: Verify proper RTL display and font application
5. **Error Handling**: Test with network failures or API limits

## 📊 Performance Notes

- Translation adds ~200-500ms latency per message
- Caching not implemented (stateless for privacy)
- Font files (~200KB) loaded once and cached by browser
- RTL rendering has minimal performance impact

## 🔒 Security & Privacy

- Dhivehi text is sent to Google Translate API
- No message content is stored permanently
- Translation happens in-memory only
- API keys are server-side only (never exposed to client)

## 🐛 Known Limitations

1. Complex Dhivehi phrases may lose nuance in translation
2. Technical terms might not translate accurately
3. Font rendering depends on client system support
4. PDF generation with Dhivehi requires font embedding

## 📚 Resources

- [Google Cloud Translation API](https://cloud.google.com/translate/docs)
- [Thaana Unicode Block](https://en.wikipedia.org/wiki/Thaana_(Unicode_block))
- [Dhivehi Fonts Repository](https://github.com/dhivehi/fonts)
- [RTL Text Best Practices](https://www.w3.org/International/articles/inline-bidi-markup/)