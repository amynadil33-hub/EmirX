import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

const TranslationDebugger: React.FC = () => {
  const [inputText, setInputText] = useState('ސަލާމް ޢަލައިކުމް');
  const [sourceLang, setSourceLang] = useState('dv');
  const [targetLang, setTargetLang] = useState('en');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testTranslation = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('translate-test', {
        body: {
          text: inputText,
          sourceLang,
          targetLang
        }
      });

      if (error) {
        setResult({ error: error.message });
      } else {
        setResult(data);
      }
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const sampleTexts = [
    { lang: 'dv', text: 'ސަލާމް ޢަލައިކުމް', desc: 'Hello (Dhivehi)' },
    { lang: 'dv', text: 'ކިހިނެއްތޯ ހާލު؟', desc: 'How are you? (Dhivehi)' },
    { lang: 'en', text: 'Hello, how are you?', desc: 'English to Dhivehi' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Google Translate API Debugger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Source Language</Label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="dv">Dhivehi (dv)</option>
                <option value="en">English (en)</option>
              </select>
            </div>
            
            <div>
              <Label>Target Language</Label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="en">English (en)</option>
                <option value="dv">Dhivehi (dv)</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Text to Translate</Label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className={`w-full p-3 border rounded min-h-[100px] ${
                sourceLang === 'dv' ? 'dhivehi-text' : ''
              }`}
              placeholder="Enter text to translate..."
            />
          </div>

          <div className="flex gap-2">
            {sampleTexts.map((sample, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInputText(sample.text);
                  setSourceLang(sample.lang);
                  setTargetLang(sample.lang === 'dv' ? 'en' : 'dv');
                }}
              >
                {sample.desc}
              </Button>
            ))}
          </div>

          <Button 
            onClick={testTranslation}
            disabled={isLoading || !inputText}
            className="w-full"
          >
            {isLoading ? 'Testing Translation...' : 'Test Translation'}
          </Button>

          {result && (
            <div className="mt-6 space-y-4">
              {result.error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <h3 className="font-semibold text-red-700">Error</h3>
                  <pre className="mt-2 text-sm text-red-600">{JSON.stringify(result, null, 2)}</pre>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-green-50 border border-green-200 rounded">
                    <h3 className="font-semibold text-green-700 mb-2">Translation Result</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Original ({result.sourceLang}):</span>
                        <p className={`mt-1 p-2 bg-white rounded ${result.sourceLang === 'dv' ? 'dhivehi-text' : ''}`}>
                          {result.originalText}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Translated ({result.targetLang}):</span>
                        <p className={`mt-1 p-2 bg-white rounded ${result.targetLang === 'dv' ? 'dhivehi-text' : ''}`}>
                          {result.translatedText}
                        </p>
                      </div>
                      {result.detectedLanguage && (
                        <div>
                          <span className="font-medium">Detected Language:</span> {result.detectedLanguage}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                    <h3 className="font-semibold text-gray-700">API Response</h3>
                    <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(result.apiResponse, null, 2)}</pre>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslationDebugger;