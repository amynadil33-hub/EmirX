import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  input: string;
  expectedLanguage: string;
  actualLanguage: string;
  response: string;
  translationStatus: any;
  success: boolean;
  timestamp: Date;
}

const DhivehiTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testCases = [
    { input: 'Hello, how are you?', expectedLanguage: 'en' },
    { input: 'ހެލޯ، ހާލު ކިހިނެއް؟', expectedLanguage: 'dv' },
    { input: 'What is artificial intelligence?', expectedLanguage: 'en' },
    { input: 'އާޓިފިޝަލް އިންޓެލިޖެންސް ކީއްވެ؟', expectedLanguage: 'dv' }
  ];

  const runTest = async (input: string, expectedLanguage: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-v2', {
        body: {
          message: input,
          assistantType: 'secretary',
        }
      });

      if (error) throw error;

      const result: TestResult = {
        input,
        expectedLanguage,
        actualLanguage: data.language || 'unknown',
        response: data.response || 'No response',
        translationStatus: data.translationStatus || {},
        success: data.language === expectedLanguage,
        timestamp: new Date()
      };

      setTestResults(prev => [result, ...prev]);
    } catch (error: any) {
      const result: TestResult = {
        input,
        expectedLanguage,
        actualLanguage: 'error',
        response: `Error: ${error.message}`,
        translationStatus: {},
        success: false,
        timestamp: new Date()
      };
      setTestResults(prev => [result, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    for (const testCase of testCases) {
      await runTest(testCase.input, testCase.expectedLanguage);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const runCustomTest = async () => {
    if (!customInput.trim()) return;
    
    // Detect expected language based on Thaana script
    const expectedLanguage = /[\u0780-\u07BF]/.test(customInput) ? 'dv' : 'en';
    await runTest(customInput, expectedLanguage);
    setCustomInput('');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dhivehi Translation Test</h1>
        <p className="text-gray-600">
          Test the Dhivehi translation pipeline with automatic Thaana script detection
        </p>
      </div>

      {/* Test Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button 
              onClick={runAllTests} 
              disabled={isLoading}
              className="mr-4"
            >
              Run All Tests
            </Button>
            <Badge variant="outline" className="mr-2">
              {testResults.filter(r => r.success).length} / {testResults.length} Passed
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter custom test message (English or Dhivehi)..."
              className={/[\u0780-\u07BF]/.test(customInput) ? 'dhivehi-text' : ''}
              onKeyPress={(e) => e.key === 'Enter' && runCustomTest()}
            />
            <Button 
              onClick={runCustomTest} 
              disabled={!customInput.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="space-y-4">
        {testResults.map((result, index) => (
          <Card key={index} className={`border-l-4 ${
            result.success ? 'border-l-green-500' : 'border-l-red-500'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-semibold">
                    Test #{testResults.length - index}
                  </span>
                </div>
                <Badge variant={result.success ? 'default' : 'destructive'}>
                  {result.success ? 'PASS' : 'FAIL'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-1">Input</h4>
                  <p className={`p-2 bg-gray-50 rounded text-sm ${
                    result.expectedLanguage === 'dv' ? 'dhivehi-text' : ''
                  }`}>
                    {result.input}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-1">Response</h4>
                  <p className={`p-2 bg-gray-50 rounded text-sm ${
                    result.actualLanguage === 'dv' ? 'dhivehi-text' : ''
                  }`}>
                    {result.response}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">
                  Expected: {result.expectedLanguage.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  Actual: {result.actualLanguage.toUpperCase()}
                </Badge>
                {result.translationStatus.inputTranslated && (
                  <Badge variant="secondary">Input Translated</Badge>
                )}
                {result.translationStatus.outputTranslated && (
                  <Badge variant="secondary">Output Translated</Badge>
                )}
                {result.translationStatus.isDhivehi && (
                  <Badge variant="secondary">Thaana Detected</Badge>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                {result.timestamp.toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {testResults.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No test results yet. Run some tests to see results.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DhivehiTestPage;