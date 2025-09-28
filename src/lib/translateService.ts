// Google Translate service utility
// This is kept as a standalone utility for future translation features
// but is not connected to the chat flow

export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
  confidence?: number;
}

export class TranslateService {
  private static readonly API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
  private static readonly API_URL = 'https://translation.googleapis.com/language/translate/v2';

  static async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    if (!this.API_KEY) {
      throw new Error('Google Translate API key not configured');
    }

    try {
      const params = new URLSearchParams({
        key: this.API_KEY,
        q: text,
        target: targetLanguage,
        format: 'text'
      });

      if (sourceLanguage) {
        params.append('source', sourceLanguage);
      }

      const response = await fetch(`${this.API_URL}?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Translation error: ${data.error.message}`);
      }

      const translation = data.data.translations[0];
      
      return {
        translatedText: translation.translatedText,
        detectedLanguage: translation.detectedSourceLanguage,
        confidence: translation.confidence
      };

    } catch (error) {
      console.error('Translation service error:', error);
      throw error;
    }
  }

  static async detectLanguage(text: string): Promise<string> {
    if (!this.API_KEY) {
      throw new Error('Google Translate API key not configured');
    }

    try {
      const params = new URLSearchParams({
        key: this.API_KEY,
        q: text
      });

      const response = await fetch(`https://translation.googleapis.com/language/translate/v2/detect?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      if (!response.ok) {
        throw new Error(`Detection API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Detection error: ${data.error.message}`);
      }

      return data.data.detections[0][0].language;

    } catch (error) {
      console.error('Language detection error:', error);
      throw error;
    }
  }

  // Utility function to check if text contains Dhivehi characters
  static containsDhivehi(text: string): boolean {
    const dhivehiRegex = /[\u0780-\u07BF]/;
    return dhivehiRegex.test(text);
  }

  // Get supported languages (subset of common languages)
  static getSupportedLanguages() {
    return {
      'en': 'English',
      'dv': 'Dhivehi',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'ur': 'Urdu',
      'ta': 'Tamil',
      'si': 'Sinhala',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese (Simplified)',
      'zh-TW': 'Chinese (Traditional)'
    };
  }
}