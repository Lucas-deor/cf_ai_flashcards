import { FlashcardsDurableObject, Flashcard } from './FlashcardsDurableObject';

export { FlashcardsDurableObject };

export interface Env {
  AI: any;
  FLASHCARDS_DO: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Session-ID',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/api/generate') {
      return handleGenerate(request, env, corsHeaders);
    }

    if (url.pathname.startsWith('/api/session')) {
      return handleDurableObject(request, env, corsHeaders);
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  },
};

async function handleGenerate(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const { topic, count = 5 } = await request.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Generate ${count} educational flashcards about "${topic}". 
For each flashcard, create a question and a detailed answer.
Format your response as valid JSON array with this structure:
[
  {
    "question": "What is...",
    "answer": "The answer is..."
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text, no markdown formatting, no explanations.`;

    const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful educational assistant that generates flashcards in valid JSON format only.' 
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    let flashcardsData;
    try {
      if (Array.isArray(response.response)) {
        flashcardsData = response.response;
      } else if (response.result?.response && Array.isArray(response.result.response)) {
        flashcardsData = response.result.response;
      } else {
        const content = response.response || response.result?.response || '';
        let cleaned = content.trim();
        
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/```\n?/g, '');
        }
        
        flashcardsData = JSON.parse(cleaned);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', response);
      throw new Error('Failed to parse AI response as JSON');
    }

    const flashcards: Flashcard[] = flashcardsData.map((fc: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      question: fc.question,
      answer: fc.answer,
      topic: topic,
      createdAt: Date.now(),
    }));

    return new Response(JSON.stringify({ flashcards }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error generating flashcards:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleDurableObject(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const userId = request.headers.get('X-Session-ID') || 'default-session';
    const id = env.FLASHCARDS_DO.idFromName(userId);
    const stub = env.FLASHCARDS_DO.get(id);

    const url = new URL(request.url);
    const internalPath = url.pathname.replace('/api/session', '');
    
    const doUrl = new URL(request.url);
    doUrl.pathname = internalPath || '/list';

    const doRequest = new Request(doUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    return await stub.fetch(doRequest);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}