import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CheckCircle, Globe } from 'lucide-react';

const TranslationTest: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testCases = [
    { text: 'Hello, how are you?', from: 'en', to: 'dv', description: 'English to Dhivehi' },
    { text: 'ސަލާމް', from: 'dv', to: 'en', description: 'Dhivehi greeting to English' },
    { text: 'ކިހިނެއްތޯ', from: 'dv', to: 'en', description: 'Dhivehi "how" to English' },
    { text: 'Good morning', from: 'en', to: 'dv', description: 'English greeting to Dhivehi' },
    { text: 'Thank you', from: 'en', to: 'dv', description: 'English thanks to Dhivehi' }
  ];

  const runTests = async () => {
    setIsLoading(true);
    setResults([]);
    
    const testResults = [];
    
    for (const testCase of testCases) {
      try {
        const { data, error } = await supabase.functions.invoke('translate-test', {
          body: {
            text: testCase.text,
            sourceLang: testCase.from,
            targetLang: testCase.to
          }
        });

        testResults.push({
          ...testCase,
          success: !error && data?.success,
          result: data?.translatedText || error?.message || 'No result',
          error: error || data?.error,
          apiResponse: data
        });
      } catch (err: any) {
        testResults.push({
          ...testCase,
          success: false,
          result: 'Test failed',
          error: err.message
        });
      }
    }
    
    setResults(testResults);
    setIsLoading(false);
  };

  const checkLanguageSupport = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-test', {
        body: {
          text: 'test',
          sourceLang: 'en',
          targetLang: 'dv'
        }
      });
      
      if (data?.apiResponse) {
        console.log('Language support check:', data);
        alert('Check console for language support details');
      }
    } catch (err) {
      console.error('Language check failed:', err);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Dhivehi Translation Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runTests} disabled={isLoading}>
              {isLoading ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <Button onClick={checkLanguageSupport} variant="outline" disabled={isLoading}>
              Check Language Support
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Test Results:</h3>
              {results.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{result.description}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Input:</span> {result.text} ({result.from})
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Output:</span> 
                        <span className={result.to === 'dv' ? 'dhivehi-text' : ''}>
                          {' '}{result.result}
                        </span>
                      </div>
                      {result.error && (
                        <div className="text-sm text-red-600 mt-1">
                          <span className="font-medium">Error:</span> {JSON.stringify(result.error)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Important Notes:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Dhivehi (dv) was recently added to Google Translate</li>
              <li>• API support may lag behind web interface availability</li>
              <li>• If tests fail, Dhivehi might not be available in the API yet</li>
              <li>• Check console logs for detailed API responses</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslationTest;