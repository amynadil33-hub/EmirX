import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ChatRequest {
  message: string;
  assistantId?: string;
  assistantType?: string;
  threadId?: string;
  language?: string;
  files?: Array<{
    name: string;
    type: string;
    size: number;
    content: number[];
  }>;
}

// Translation helper (auto-detects source language if not provided)
async function translateText(text: string, target: string, source?: string) {
  const apiKey = Deno.env.get("GOOGLE_API_KEY");
  if (!apiKey) throw new Error("Google API key not configured");

  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        target,
        source, // optional
      }),
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error("Google Translate API error: " + JSON.stringify(data));
  }

  return {
    text: data.data.translations[0].translatedText,
    detected: data.data.translations[0].detectedSourceLanguage,
  };
}

// Map assistant types to OpenAI Assistant IDs
const ASSISTANT_IDS = {
  hr: "asst_hr_default",
  secretary: "asst_secretary_default",
  lawyer: "asst_lawyer_default",
  research: "asst_research_default",
  accounting: "asst_accounting_default",
  marketing: "asst_marketing_default",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, assistantType, threadId, files }: ChatRequest =
      await req.json();

    console.log("Received chat request:", {
      assistantType,
      hasMessage: !!message,
      hasFiles: !!files,
      threadId,
    });

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Process uploaded files
    let fileContext = "";
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const content = await extractFileContent(file);
          fileContext +=
            `\n\n--- Content from ${file.name} ---\n${content}\n--- End of ${file.name} ---\n`;
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          fileContext +=
            `\n\n--- Error reading ${file.name}: ${error.message} ---\n`;
        }
      }
    }

    // Auto-detect language & translate → English
    let translatedMessage = message;
    let sourceLang = "en";
    try {
      const result = await translateText(message, "en");
      translatedMessage = result.text;
      sourceLang = result.detected;
      console.log(`🌐 Detected input language: ${sourceLang}`);
    } catch (err) {
      console.error("⚠️ Input translation error:", err);
    }

    // Prepare message for OpenAI
    const fullMessage = fileContext
      ? `${translatedMessage}\n\nAttached files content:${fileContext}`
      : translatedMessage;

    // Get assistant system prompt
    const selectedAssistant = assistantType || "hr";
    console.log("Using assistant type:", selectedAssistant);
    const assistantConfig = getAssistantConfig(selectedAssistant);

    // Call OpenAI
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: `${assistantConfig.systemPrompt}

IMPORTANT: When users upload documents, you MUST analyze the actual content provided and give specific, detailed insights based on what you read. Do not give generic responses about being unable to access files.

DOCUMENT GENERATION: You can create downloadable documents. Format responses with clear structure using markdown (# ## ###) for reports, analyses, and formal documents.`,
            },
            { role: "user", content: fullMessage },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `OpenAI API error: ${response.statusText} - ${errorData}`,
      );
    }

    const data = await response.json();
    const aiResponse =
      data.choices?.[0]?.message?.content || "No response generated";

    // Translate response back → only if input wasn’t English
    let finalResponse = aiResponse;
    if (sourceLang !== "en") {
      try {
        const result = await translateText(aiResponse, sourceLang, "en");
        finalResponse = result.text;
      } catch (err) {
        console.error("⚠️ Output translation error:", err);
      }
    }

    // Check if response should be downloadable
    const downloadData = await generateDownloadableContent(
      aiResponse, // keep English as downloadable version
      assistantType || "secretary",
    );

    return new Response(
      JSON.stringify({
        response: finalResponse, // Dhivehi if input was Dhivehi
        originalResponse: aiResponse, // English always included
        threadId: threadId || `thread_${Date.now()}`,
        ...downloadData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        response: `I apologize, but I encountered an error: ${error.message}. Please try again.`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

// (keep your existing extractFileContent, getAssistantConfig, generateDownloadableContent functions below…)
