export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  topic: string;
  createdAt: number;
}

export interface FlashcardSession {
  userId: string;
  flashcards: Flashcard[];
  topics: string[]; 
  createdAt: number;
}

export class FlashcardsDurableObject {
  private state: DurableObjectState;
  private session: FlashcardSession | null = null;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Session-ID',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      switch (path) {
        case '/init':
          return this.handleInit(request, corsHeaders);
        case '/add':
          return this.handleAddFlashcards(request, corsHeaders);
        case '/list':
          return this.handleListFlashcards(corsHeaders);
        case '/delete':
          return this.handleDeleteFlashcard(request, corsHeaders);
        case '/clear':
          return this.handleClear(corsHeaders);
        default:
          return new Response(JSON.stringify({ error: 'Not found', path }), { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
      }
    } catch (error: any) {
      console.error('Durable Object error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  private async handleInit(request: Request, corsHeaders: Record<string, string>): Promise<Response> {
    const { userId } = await request.json();
    
    this.session = await this.state.storage.get<FlashcardSession>('session') || {
      userId,
      flashcards: [],
      topics: [],
      createdAt: Date.now(),
    };

    await this.state.storage.put('session', this.session);

    return new Response(JSON.stringify({ success: true, session: this.session }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  private async handleAddFlashcards(request: Request, corsHeaders: Record<string, string>): Promise<Response> {
    const { flashcards } = await request.json();
    
    if (!this.session) {
      this.session = {
        userId: 'anonymous',
        flashcards: [],
        topics: [],
        createdAt: Date.now(),
      };
    }

    this.session.flashcards.push(...flashcards);
    
    const allTopics = this.session.flashcards.map(fc => fc.topic);
    this.session.topics = Array.from(new Set(allTopics));

    await this.state.storage.put('session', this.session);

    return new Response(JSON.stringify({ 
      success: true, 
      count: this.session.flashcards.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  private async handleListFlashcards(corsHeaders: Record<string, string>): Promise<Response> {
    if (!this.session) {
      this.session = await this.state.storage.get<FlashcardSession>('session') || {
        userId: 'anonymous',
        flashcards: [],
        topics: [],
        createdAt: Date.now(),
      };
    }

    return new Response(JSON.stringify({ 
      flashcards: this.session.flashcards,
      topics: this.session.topics 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  private async handleDeleteFlashcard(request: Request, corsHeaders: Record<string, string>): Promise<Response> {
    const { id } = await request.json();
    
    if (!this.session) {
      this.session = await this.state.storage.get<FlashcardSession>('session') || {
        userId: 'anonymous',
        flashcards: [],
        topics: [],
        createdAt: Date.now(),
      };
    }

    this.session.flashcards = this.session.flashcards.filter(fc => fc.id !== id);
    
    const allTopics = this.session.flashcards.map(fc => fc.topic);
    this.session.topics = Array.from(new Set(allTopics));
    
    await this.state.storage.put('session', this.session);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  private async handleClear(corsHeaders: Record<string, string>): Promise<Response> {
    await this.state.storage.deleteAll();
    this.session = null;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}