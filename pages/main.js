const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8787' 
  : 'https://cf-ai-flashcards-worker.lucasdeor-8428.workers.dev';

let sessionId = localStorage.getItem('flashcard-session-id') || generateSessionId();
localStorage.setItem('flashcard-session-id', sessionId);

function generateSessionId() {
  return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

async function initSession() {
  try {
    const response = await fetch(`${API_URL}/api/session/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
      },
      body: JSON.stringify({ userId: sessionId }),
    });

    if (!response.ok) throw new Error('Failed to initialize session');
    
    await loadFlashcards();
  } catch (error) {
    console.error('Error initializing session:', error);
  }
}

async function generateFlashcards() {
  const topicInput = document.getElementById('topicInput');
  const countInput = document.getElementById('countInput');
  const generateBtn = document.getElementById('generateBtn');
  const loading = document.getElementById('loading');

  const topic = topicInput.value.trim();
  const count = parseInt(countInput.value) || 5;

  if (!topic) {
    alert('Please enter a topic!');
    return;
  }

  generateBtn.disabled = true;
  loading.classList.add('active');

  try {
    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, count }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate flashcards');
    }

    const { flashcards } = await response.json();

    await fetch(`${API_URL}/api/session/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
      },
      body: JSON.stringify({ flashcards }),
    });

    await loadFlashcards();
    topicInput.value = '';

    setTimeout(() => {
      document.getElementById('flashcardsContainer').scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);

  } catch (error) {
    console.error('Error generating flashcards:', error);
    alert('Error: ' + error.message);
  } finally {
    generateBtn.disabled = false;
    loading.classList.remove('active');
  }
}

async function loadFlashcards() {
  try {
    const response = await fetch(`${API_URL}/api/session/list`, {
      method: 'GET',
      headers: {
        'X-Session-ID': sessionId,
      },
    });

    if (!response.ok) throw new Error('Failed to load flashcards');

    const { flashcards, topics } = await response.json();

    document.getElementById('totalCards').textContent = flashcards.length;
    document.getElementById('totalTopics').textContent = topics.length;
    document.getElementById('stats').style.display = flashcards.length > 0 ? 'flex' : 'none';

    renderFlashcards(flashcards);
  } catch (error) {
    console.error('Error loading flashcards:', error);
  }
}

function renderFlashcards(flashcards) {
  const container = document.getElementById('flashcardsContainer');

  if (flashcards.length === 0) {
    container.innerHTML = `
      <div class="main-card empty-state">
        <h3>No flashcards yet!</h3>
        <p>Generate your first set of AI-powered flashcards above.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="main-card">
      <h2 style="margin-bottom: 20px;">Your Flashcards (Click to flip)</h2>
      <div class="flashcards-grid">
        ${flashcards.map(fc => `
          <div class="flashcard" data-id="${fc.id}" onclick="flipCard('${fc.id}')">
            <button class="delete-btn" onclick="event.stopPropagation(); deleteFlashcard('${fc.id}')">×</button>
            <div class="front">
              <div class="flashcard-topic">${fc.topic}</div>
              <div class="flashcard-label">Question</div>
              <div class="flashcard-content">${fc.question}</div>
            </div>
            <div class="back">
              <div class="flashcard-topic">${fc.topic}</div>
              <div class="flashcard-label">Answer</div>
              <div class="flashcard-content">${fc.answer}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function flipCard(id) {
  const card = document.querySelector(`.flashcard[data-id="${id}"]`);
  card.classList.toggle('flipped');
}

async function deleteFlashcard(id) {
  if (!confirm('Delete this flashcard?')) return;

  try {
    const response = await fetch(`${API_URL}/api/session/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) throw new Error('Failed to delete flashcard');

    await loadFlashcards();
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    alert('Error deleting flashcard');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSession();

  document.getElementById('topicInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      generateFlashcards();
    }
  });
});