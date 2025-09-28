import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

// Test component for Dhivehi translation pipeline
const DhivehiChatTest: React.FC = () => {
  const [testMessage, setTestMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDhivehiPipeline = async () => {
    if (!testMessage.trim()) return;
    
    setIsLoading(true);
    setResponse('');
    setLogs([]);
    
    try {
      addLog(`Testing message: ${testMessage}`);
      
      // Detect if message contains Thaana script
      const containsThaana = /[\u0780-\u07BF]/.test(testMessage);
      addLog(`Thaana script detected: ${containsThaana}`);
      
      const { data, error } = await supabase.functions.invoke('chat-v2', {
        body: {
          message: testMessage,
          assistantType: 'secretary', // Use secretary for testing
        }
      });

      if (error) {
        addLog(`Error: ${error.message}`);
        throw error;
      }

      addLog(`Response received: ${data.response?.substring(0, 100)}...`);
      addLog(`Translation status: ${JSON.stringify(data.translationStatus)}`);
      
      setResponse(data.response || 'No response');
      
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
      setResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isDhivehi = (text: string) => /[\u0780-\u07BF]/.test(text);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Dhivehi Translation Pipeline Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Type test message in English or Dhivehi..."
            className={isDhivehi(testMessage) ? 'dhivehi-text' : ''}
          />
          <Button 
            onClick={testDhivehiPipeline}
            disabled={isLoading || !testMessage.trim()}
          >
            {isLoading ? 'Testing...' : 'Test'}
          </Button>
        </div>

        {/* Test buttons with sample messages */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTestMessage('Hello, how are you?')}
          >
            English Test
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTestMessage('ހެލޯ، ހާލުކަން ކިހިނެތް؟')}
          >
            Dhivehi Test
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTestMessage('What is the weather today?')}
          >
            English Question
          </Button>
        </div>

        {/* Response */}
        {response && (
          <div className="space-y-2">
            <h3 className="font-semibold">Response:</h3>
            <div className={`p-3 bg-gray-50 rounded ${isDhivehi(response) ? 'dhivehi-text' : ''}`}>
              {response}
            </div>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Debug Logs:</h3>
            <div className="p-3 bg-gray-900 text-green-400 rounded text-sm font-mono max-h-60 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DhivehiChatTest;