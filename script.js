// --- Element References ---
const form = document.getElementById('searchForm');
const queryInput = document.getElementById('queryInput');
const chatMessages = document.getElementById('chatMessages');
const sendButton = document.getElementById('sendButton');
const micButton = document.getElementById('micButton');
const welcomeSection = document.getElementById('welcomeSection');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileToggle = document.getElementById('mobileToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const newChatBtn = document.getElementById('newChatBtn');
const searchChats = document.getElementById('searchChats');
const chatHistory = document.getElementById('chatHistory');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const confirmDialog = document.getElementById('confirmDialog');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMessage = document.getElementById('confirmMessage');
const confirmCancel = document.getElementById('confirmCancel');
const confirmDelete = document.getElementById('confirmDelete');

let recognition;
let isRecording = false;
let currentChatId = null;
let chatData = [];
let pendingDeleteAction = null;

document.addEventListener('DOMContentLoaded', function() {
  loadChatHistory();
  startNewChat();
  initializeSidebarState();
  document.getElementById('mobileToggle').addEventListener('click', toggleSidebar);
});

function initializeSidebarState() {
  if (window.innerWidth <= 768) {
    sidebar.classList.add('collapsed');
  } else {
    sidebar.classList.remove('collapsed');
  }
}

function loadChatHistory() {
  try {
    const stored = localStorage.getItem('vera_chat_history');
    chatData = stored ? JSON.parse(stored) : [];
    renderChatHistory();
  } catch (e) {
    console.error('Error loading chat history:', e);
    chatData = [];
  }
}

function saveChatHistory() {
  try {
    localStorage.setItem('vera_chat_history', JSON.stringify(chatData));
    console.log('Chat history saved.');
  } catch (e) {
    console.error('Error saving chat history:', e);
  }
}

function startNewChat() {
  currentChatId = Date.now().toString();
  const newChat = {
    id: currentChatId,
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  chatData.unshift(newChat);
  clearChat();
  renderChatHistory();
  setActiveChatInHistory(currentChatId);
}

function clearChat() {
  chatMessages.innerHTML = `
    <div class="welcome-section" id="welcomeSection">
      <h2 class="welcome-title">How can I help you today?</h2>
      <p class="welcome-subtitle">Ask me anything - I can help with calculations, provide information, or just have a conversation.</p>
      <div class="example-prompts">
        <div class="example-prompt" onclick="fillPrompt('What time is it?')">
          <div class="example-prompt-title">Current Time</div>
          <div class="example-prompt-subtitle">Get the current time</div>
        </div>
        <div class="example-prompt" onclick="fillPrompt('What is 25 * 17?')">
          <div class="example-prompt-title">Calculator</div>
          <div class="example-prompt-subtitle">Solve math problems</div>
        </div>
        <div class="example-prompt" onclick="fillPrompt('What is the weather like?')">
          <div class="example-prompt-title">Weather</div>
          <div class="example-prompt-subtitle">Search for weather information</div>
        </div>
        <div class="example-prompt" onclick="fillPrompt('Tell me about artificial intelligence')">
          <div class="example-prompt-title">Learn</div>
          <div class="example-prompt-subtitle">Get information on any topic</div>
        </div>
      </div>
    </div>
  `;
  chatMessages.classList.remove('has-messages');
}

function loadChat(chatId) {
  const chat = chatData.find(c => c.id === chatId);
  if (!chat) return;

  currentChatId = chatId;
  clearChat();

  if (chat.messages.length > 0) {
    chatMessages.classList.add('has-messages');
    chat.messages.forEach(msg => {
      addMessage(msg.text, msg.sender, false);
    });
  }

  setActiveChatInHistory(chatId);
  closeSidebar();
}

function saveMessage(text, sender) {
  const chat = chatData.find(c => c.id === currentChatId);
  if (!chat) return;

  const message = {
    text: text,
    sender: sender,
    timestamp: new Date().toISOString()
  };

  chat.messages.push(message);
  chat.updatedAt = new Date().toISOString();

  if (sender === 'user' && chat.title === 'New Chat') {
    chat.title = text.length > 50 ? text.substring(0, 50) + '...' : text;
  }

  saveChatHistory();
  renderChatHistory();
}

function renderChatHistory() {
  const filteredChats = chatData.filter(chat => {
    const searchTerm = searchChats.value.toLowerCase();
    return searchTerm === '' || 
           chat.title.toLowerCase().includes(searchTerm) ||
           chat.messages.some(msg => msg.text.toLowerCase().includes(searchTerm));
  });

  chatHistory.innerHTML = filteredChats.map(chat => {
    const lastMessage = chat.messages[chat.messages.length - 1];
    const preview = lastMessage ? lastMessage.text : 'No messages yet';
    const date = new Date(chat.updatedAt).toLocaleDateString();

    return `
      <div class="chat-history-item" data-chat-id="${chat.id}">
        <div class="chat-history-title">${chat.title}</div>
        <div class="chat-history-preview">${preview.length > 60 ? preview.substring(0, 60) + '...' : preview}</div>
        <div class="chat-history-date">${date}</div>
        <div class="chat-history-actions">
          <button class="delete-chat-btn" data-chat-id="${chat.id}" title="Delete this chat">
            🗑️ Delete
          </button>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.chat-history-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-chat-btn')) return;
      const chatId = item.dataset.chatId;
      loadChat(chatId);
    });
  });

  document.querySelectorAll('.delete-chat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const chatId = btn.dataset.chatId;
      showConfirmDialog(
        'Delete Chat',
        'Are you sure you want to delete this chat? This action cannot be undone.',
        () => deleteChat(chatId)
      );
    });
  });

  setActiveChatInHistory(currentChatId);
}

function setActiveChatInHistory(chatId) {
  document.querySelectorAll('.chat-history-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.chatId === chatId) {
      item.classList.add('active');
    }
  });
}

function deleteChat(chatId) {
  chatData = chatData.filter(chat => chat.id !== chatId);
  if (currentChatId === chatId) {
    startNewChat();
  } else {
    saveChatHistory();
    renderChatHistory();
  }
}

function clearAllHistory() {
  showConfirmDialog(
    'Clear All History',
    'Are you sure you want to delete all chat history? This action cannot be undone.',
    () => {
      chatData = [];
      startNewChat();
      saveChatHistory();
      renderChatHistory();
    }
  );
}

function showConfirmDialog(title, message, onConfirm) {
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  confirmDialog.classList.add('active');
  pendingDeleteAction = onConfirm;
}

function hideConfirmDialog() {
  confirmDialog.classList.remove('active');
  pendingDeleteAction = null;
}

function toggleSidebar() {
  sidebar.classList.toggle('collapsed');
  if (window.innerWidth <= 768) {
    sidebarOverlay.classList.toggle('active');
  }
}

function closeSidebar() {
  if (window.innerWidth <= 768) {
    sidebar.classList.add('collapsed');
    sidebarOverlay.classList.remove('active');
  }
}

function autoResizeTextarea() {
  queryInput.style.height = 'auto';
  queryInput.style.height = Math.min(queryInput.scrollHeight, 120) + 'px';
}

function updateSendButton() {
  const hasText = queryInput.value.trim().length > 0;
  sendButton.classList.toggle('active', hasText);
}

function addMessage(text, sender, save = true) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;

  const avatar = document.createElement('div');
  avatar.className = `message-avatar ${sender}-avatar`;
  avatar.textContent = sender === 'user' ? 'U' : 'V';

  const content = document.createElement('div');
  content.className = 'message-content';
  content.textContent = text;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);

  const welcomeSection = document.getElementById('welcomeSection');
  if (welcomeSection) {
    welcomeSection.remove();
    chatMessages.classList.add('has-messages');
  }

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  if (save) {
    saveMessage(text, sender);
  }
}

async function processQuery(query) {
  addMessage(query, 'user');

  const lowerQuery = query.toLowerCase();
  const synth = window.speechSynthesis;

  // Handle time queries
  if (lowerQuery.includes("time")) {
    const time = new Date().toLocaleTimeString();
    const response = `Current time is ${time}`;
    addMessage(response, 'bot');
    synth.speak(new SpeechSynthesisUtterance(response));
    return;
  }

  // Handle date queries
  if (lowerQuery.includes("date")) {
    const date = new Date().toLocaleDateString();
    const response = `Today's date is ${date}`;
    addMessage(response, 'bot');
    synth.speak(new SpeechSynthesisUtterance(response));
    return;
  }

  // Handle math calculations
  const mathPattern = /^[\d+\-*/ ().]+$/;
  if (mathPattern.test(query.replace(/\s/g, ''))) {
    try {
      const result = Function('"use strict"; return (' + query + ')')();
      const response = `The answer is ${result}`;
      addMessage(response, 'bot');
      synth.speak(new SpeechSynthesisUtterance(response));
      return;
    } catch {
      const errorMsg = "Sorry, I couldn't calculate that.";
      addMessage(errorMsg, 'bot');
      synth.speak(new SpeechSynthesisUtterance(errorMsg));
      return;
    }
  }

  // Handle website opening functionality
  const commonSites = {
    youtube: "https://www.youtube.com",
    duckduckgo: "https://duckduckgo.com",
    firefox: "https://firefox.com",
    google: "https://www.google.com",
    wikipedia: "https://www.wikipedia.org",
    github: "https://www.github.com",
    vera: "https://vera.ai"
  };

  const domainMatch = lowerQuery.match(/open\s+([a-z0-9.-]+\.[a-z]{2,})/i);
  if (domainMatch) {
    const url = domainMatch[1].startsWith('http') ? domainMatch[1] : 'https://' + domainMatch[1];
    window.open(url, '_blank');
    const response = `Opening ${domainMatch[1]}...`;
    addMessage(response, 'bot');
    synth.speak(new SpeechSynthesisUtterance(response));
    return;
  }

  for (const keyword in commonSites) {
    if (lowerQuery.includes('open') && lowerQuery.includes(keyword)) {
      window.open(commonSites[keyword], '_blank');
      const response = `Opening ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}...`;
      addMessage(response, 'bot');
      synth.speak(new SpeechSynthesisUtterance(response));
      return;
    }
  }

  // Show searching message
  synth.speak(new SpeechSynthesisUtterance(`Searching for ${query}`));

  // Try to search for information
  try {
    const proxy = 'https://api.allorigins.win/get?url=';
    const duckUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(proxy + encodeURIComponent(duckUrl));
    const data = await response.json();
    const html = data.contents;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const snippet = doc.querySelector('.result__snippet');

    let answer = snippet ? snippet.textContent.trim() : "Sorry, I couldn't find a clear answer to your question.";
    
    // Limit answer length
    if (answer.length > 500) {
      answer = answer.substring(0, 500) + '...';
    }
    
    addMessage(answer, 'bot');
    synth.speak(new SpeechSynthesisUtterance(answer));
  } catch (e) {
    console.error('Search error:', e);
    const fallback = "Sorry, I couldn't fetch the answer right now. Please try again later.";
    addMessage(fallback, 'bot');
    synth.speak(new SpeechSynthesisUtterance(fallback));
  }
}

function generateResponse(query) {
  const lowerQuery = query.toLowerCase();
  const commonSites = {
    youtube: "https://www.youtube.com",
    duckduckgo:"https://duckduckgo.com",
    Firefox:"https://Firefox.com",
    google: "https://www.google.com",
    wikipedia: "https://www.wikipedia.org",
    github: "https://www.github.com",
    vera: "https://vera.ai"
  };

  const domainMatch = lowerQuery.match(/open\s+([a-z0-9.-]+\.[a-z]{2,})/i);
  if (domainMatch) {
    const url = domainMatch[1].startsWith('http') ? domainMatch[1] : 'https://' + domainMatch[1];
    window.open(url, '_blank');
    return `Opening ${domainMatch[1]}...`;
  }

  for (const keyword in commonSites) {
    if (lowerQuery.includes('open') && lowerQuery.includes(keyword)) {
      window.open(commonSites[keyword], '_blank');
      return `Opening ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}...`;
    }
  }

  if (lowerQuery.includes('time')) {
    return `The current time is ${new Date().toLocaleTimeString()}.`;
  }

  const mathMatch = query.match(/(\d+)\s*[\+\-\*\/]\s*(\d+)/);
  if (mathMatch) {
    try {
      const result = eval(query.replace(/[^0-9+\-*/().\s]/g, ''));
      return `The answer is ${result}.`;
    } catch (e) {
      return "I couldn't calculate that. Please check your math expression.";
    }
  }

  if (lowerQuery.includes('weather')) {
    return "I don't have access to real-time weather data, but I'd recommend checking a weather service.";
  }

  if (lowerQuery.includes('artificial intelligence') || lowerQuery.includes('ai')) {
    return "Artificial Intelligence (AI) simulates human intelligence in machines to perform tasks.";
  }

  const responses = [
    "Could you provide more specific details?",
    "That's interesting! What do you want to know?",
    "Can you rephrase or give more context?",
    "I'm here to help! Please clarify your question.",
    "I'm V.E.R.A, your assistant. Let's explore that topic."
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

function fillPrompt(text) {
  queryInput.value = text;
  autoResizeTextarea();
  updateSendButton();
  queryInput.focus();
}

function initializeSpeechRecognition() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = function() {
      isRecording = true;
      micButton.classList.add('recording');
      micButton.title = 'Recording... Click to stop';
    };

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      queryInput.value = transcript;
      autoResizeTextarea();
      updateSendButton();
    };

    recognition.onend = function() {
      isRecording = false;
      micButton.classList.remove('recording');
      micButton.title = 'Voice input';
    };

    recognition.onerror = function(event) {
      console.error('Speech recognition error:', event.error);
      isRecording = false;
      micButton.classList.remove('recording');
      micButton.title = 'Voice input';
    };
  } else {
    micButton.style.display = 'none';
  }
}

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const query = queryInput.value.trim();
  if (query) {
    processQuery(query);
    queryInput.value = '';
    autoResizeTextarea();
    updateSendButton();
  }
});

queryInput.addEventListener('input', function() {
  autoResizeTextarea();
  updateSendButton();
});

queryInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (queryInput.value.trim()) {
      form.dispatchEvent(new Event('submit'));
    }
  }
});

micButton.addEventListener('click', function() {
  if (!recognition) {
    alert('Speech recognition is not supported in your browser.');
    return;
  }

  if (isRecording) {
    recognition.stop();
  } else {
    recognition.start();
  }
});

sidebarToggle.addEventListener('click', toggleSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
newChatBtn.addEventListener('click', startNewChat);
searchChats.addEventListener('input', renderChatHistory);
clearHistoryBtn.addEventListener('click', clearAllHistory);
confirmCancel.addEventListener('click', hideConfirmDialog);
confirmDelete.addEventListener('click', function() {
  if (pendingDeleteAction) {
    pendingDeleteAction();
  }
  hideConfirmDialog();
});

confirmDialog.addEventListener('click', function(e) {
  if (e.target === confirmDialog) {
    hideConfirmDialog();
  }
});

window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    sidebar.classList.remove('collapsed');
    sidebarOverlay.classList.remove('active');
  } else {
    sidebar.classList.add('collapsed');
    sidebarOverlay.classList.remove('active');
  }
});

initializeSpeechRecognition();

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (confirmDialog.classList.contains('active')) {
      hideConfirmDialog();
    } else if (window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
      closeSidebar();
    }
  }
});

queryInput.focus();

function speakResponse(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Speech synthesis not supported in this browser.");
  }
}
