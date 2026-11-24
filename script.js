const form = document.getElementById('searchForm');
const queryInput = document.getElementById('queryInput');
const chatMessages = document.getElementById('chatMessages');
const sendButton = document.getElementById('sendButton');
const micButton = document.getElementById('micButton');
const micIcon = document.getElementById('micIcon');
const stopIcon = document.getElementById('stopIcon');
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
const welcomeOverlay = document.getElementById('welcomeOverlay');
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const loginForm = document.getElementById('loginForm');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');
const logoutSection = document.getElementById('logoutSection');
const logoutBtn = document.getElementById('logoutBtn');
const desktopDownloadBtn = document.getElementById('desktopDownloadBtn');
const downloadModal = document.getElementById('downloadModal');
const closeDownloadModal = document.getElementById('closeDownloadModal');
const linuxDownloadBtn = document.getElementById('linuxDownloadBtn');
const macDownloadBtn = document.getElementById('macDownloadBtn');
const downloadMessage = document.getElementById('downloadMessage');
const ollamaDownloadBtn = document.getElementById('ollamaDownloadBtn');

// Guidance Modal Elements
const guidanceBtn = document.getElementById('guidanceBtn');
const guidanceModal = document.getElementById('guidanceModal');
const closeGuidanceModal = document.getElementById('closeGuidanceModal');
const openDownloadModalFromGuidance = document.getElementById('openDownloadModalFromGuidance');

// Feedback Modal Elements
const feedbackBtn = document.getElementById('feedbackBtn');
const feedbackModal = document.getElementById('feedbackModal');
const closeFeedbackModal = document.getElementById('closeFeedbackModal');
const feedbackForm = document.getElementById('feedbackForm');
const feedbackSuccessMessage = document.getElementById('feedbackSuccessMessage');

// Forgot Password Modal Elements
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeForgotPasswordModal = document.getElementById('closeForgotPasswordModal');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const backToLoginLink = document.getElementById('backToLoginLink');

// User Profile Modal Elements
const userProfileBtn = document.getElementById('userProfileBtn');
const userProfileModal = document.getElementById('userProfileModal');
const closeUserProfileModal = document.getElementById('closeUserProfileModal');
const userProfileForm = document.getElementById('userProfileForm');
const profilePicture = document.getElementById('profilePicture');
const profilePictureInput = document.getElementById('profilePictureInput');
const profileUsername = document.getElementById('profileUsername');
const profileEmail = document.getElementById('profileEmail');
const profileFullName = document.getElementById('profileFullName');
const profileBio = document.getElementById('profileBio');
const profileLocation = document.getElementById('profileLocation');
const profileSuccessMessage = document.getElementById('profileSuccessMessage');

// Download Chat Button
const downloadChatBtn = document.getElementById('downloadChatBtn');


// Registration Modal Elements
const registrationModal = document.getElementById('registrationModal');
const closeRegistrationModal = document.getElementById('closeRegistrationModal');
const registrationForm = document.getElementById('registrationForm');
const showLoginLink = document.getElementById('showLoginLink');

// Add near the top with other DOM element references
const regEmail = document.getElementById('regEmail');
const registrationStatus = document.querySelector('.registration-status');
const regUsername = document.getElementById('regUsername');
const regPassword = document.getElementById('regPassword');
const confirmRegPassword = document.getElementById('confirmRegPassword');


let recognition;
let isRecording = false;
let isSpeaking = false;
let currentChatId = null;
let chatData = [];
let pendingDeleteAction = null;
let userData = {};
let currentUser = null;
const synth = window.speechSynthesis;

// Add this constant near the top of script.js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8sOqYI1si4pMzmui_UZZswFxwcK39mfUy5EhsXuViuvdCRnUAKI1AtN4NoIKa8Dv4/exec';
const UPDATE_INTERVAL = 30000; // Check every 30 seconds
const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';

document.addEventListener('DOMContentLoaded', function() {
  setupSheets();
  
  setTimeout(() => {
    welcomeOverlay.style.opacity = '0';
    welcomeOverlay.style.pointerEvents = 'none';
    setTimeout(() => {
      welcomeOverlay.style.display = 'none';
      restoreUserSession();
    }, 400);
  }, 900);

  loadChatHistory();
  loadUserData();
  startNewChat(false);
  initializeSidebarState();
  initializeTheme();
  initializeSpeechRecognition();
  
  // Attach toggle events
  mobileToggle.addEventListener('click', toggleSidebar);
  sidebarToggle.addEventListener('click', toggleSidebar);
});

function restoreUserSession() {
  if (localStorage.getItem('vera_current_user')) {
    checkLoginStatus();
  } else {
    updateUIForLoggedInUser();
  }
}

function setupSheets() {
  fetch(`${APPS_SCRIPT_URL}?action=setupSheets`)
    .catch(err => console.log('Sheets setup initiated'));
}

function initializeSidebarState() {
  // Default to collapsed on smaller screens, open on larger screens
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
    const savedChats = chatData.filter(chat => Array.isArray(chat.messages) && chat.messages.length > 0);
    localStorage.setItem('vera_chat_history', JSON.stringify(savedChats));
    console.log('Chat history saved.');
  } catch (e) {
    console.error('Error saving chat history:', e);
  }
}

function loadUserData() {
    try {
        const stored = localStorage.getItem('vera_user_data');
        userData = stored ? JSON.parse(stored) : {};
        const loggedInUser = localStorage.getItem('vera_current_user');
        if (loggedInUser) {
            currentUser = loggedInUser;
        }
    } catch(e) {
        console.error('Error loading user data:', e);
        userData = {};
        currentUser = null;
    }
}

function saveUserData() {
    try {
        localStorage.setItem('vera_user_data', JSON.stringify(userData));
        if (currentUser) {
            localStorage.setItem('vera_current_user', currentUser);
        } else {
            localStorage.removeItem('vera_current_user');
        }
        console.log('User data saved.');
    } catch (e) {
        console.error('Error saving user data:', e);
    }
}

function checkLoginStatus() {
    const currentUserFromStorage = localStorage.getItem('vera_current_user');
    const userDataFromStorage = localStorage.getItem('vera_user_data');
    
    if (currentUserFromStorage) {
        currentUser = currentUserFromStorage;
        if (userDataFromStorage) {
            userData = JSON.parse(userDataFromStorage);
        }
    }
    
    updateUIForLoggedInUser();
}

function updateUIForLoggedInUser() {
  if (!currentUser) {
    // User not logged in - show login button, hide logout
    if (loginBtn) loginBtn.style.display = 'block';
    if (logoutSection) logoutSection.style.display = 'none';
    
    // Reset welcome message
    const welcomeTitle = document.querySelector('.welcome-title');
    if (welcomeTitle) {
      welcomeTitle.textContent = 'How can I help you today?';
    }
  } else {
    // User is logged in - hide login button, show logout
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutSection) logoutSection.style.display = 'block';
    
    // Update welcome message with user name
    const welcomeTitle = document.querySelector('.welcome-title');
    if (welcomeTitle) {
      const userName = (userData[currentUser] && userData[currentUser].fullName) || currentUser || 'User';
      welcomeTitle.textContent = `Hello, ${userName}! How can I help?`;
    }
  }
}

function showRegistrationModal() {
  registrationModal.classList.add('active');
  registrationModal.style.display = 'flex';
  loginModal.classList.remove('active');
  loginModal.style.display = 'none';
}

function startNewChat(persist = true) {
  currentChatId = Date.now().toString();
  const newChat = {
    id: currentChatId,
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  chatData.unshift(newChat);
  if (persist) saveChatHistory();
  clearChat();
  renderChatHistory();
  setActiveChatInHistory(currentChatId);
  checkLoginStatus(); // Update welcome message
}

function clearChat() {
  chatMessages.innerHTML = `
    <div class="welcome-section" id="welcomeSection">
      <h2 class="welcome-title">How can I help you today?</h2>
      <p class="welcome-subtitle">Ask a question, solve a calculation, or look up a topic in Wikipedia’s open knowledge base.</p>
      <div class="example-prompts">
        <button type="button" class="example-prompt" onclick="fillPrompt('What time is it?')">
          <span class="example-prompt-title">Current Time</span>
          <span class="example-prompt-subtitle">Get the current time</span>
        </button>
        <button type="button" class="example-prompt" onclick="fillPrompt('What is 25 * 17?')">
          <span class="example-prompt-title">Calculator</span>
          <span class="example-prompt-subtitle">Solve math problems</span>
        </button>
        <button type="button" class="example-prompt" onclick="fillPrompt('VERA-AI Introduction')">
          <span class="example-prompt-title">VERA-AI Introduction</span>
          <span class="example-prompt-subtitle">Search for VERA-AI Introduction information</span>
        </button>
        <button type="button" class="example-prompt" onclick="fillPrompt('Tell me about artificial intelligence')">
          <span class="example-prompt-title">Learn</span>
          <span class="example-prompt-subtitle">Get information on any topic</span>
        </button>
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
  checkLoginStatus(); // Update welcome message
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
    const preview = lastMessage ? (lastMessage.text.length > 60 ? lastMessage.text.substring(0,60) + '...' : lastMessage.text) : 'No messages yet';
    const date = new Date(chat.updatedAt).toLocaleDateString();

    const plainPreview = preview.replace(/<[^>]*>/g, '');

    return `
      <div class="chat-history-item" data-chat-id="${escapeHTML(chat.id)}">
        <div class="chat-history-title">${escapeHTML(chat.title)}</div>
        <div class="chat-history-preview">${escapeHTML(plainPreview)}</div>
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
  saveChatHistory();
  if (currentChatId === chatId) {
    startNewChat();
  } else {
    renderChatHistory();
  }
}

function clearAllHistory() {
  showConfirmDialog(
    'Clear All History',
    'Are you sure you want to delete all chat history? This action cannot be undone.',
    () => {
      chatData = [];
      saveChatHistory();
      startNewChat();
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
  if (window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
      sidebarOverlay.classList.add('active');
  } else {
      sidebarOverlay.classList.remove('active');
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

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function sanitizeMessageHTML(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  const allowedTags = new Set(['A', 'B', 'BR', 'CODE', 'DIV', 'EM', 'H3', 'I', 'LI', 'OL', 'P', 'SPAN', 'STRONG', 'UL']);

  function sanitizeNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent);
    }

    const fragment = document.createDocumentFragment();
    if (node.nodeType !== Node.ELEMENT_NODE || !allowedTags.has(node.tagName)) {
      Array.from(node.childNodes || []).forEach(child => fragment.appendChild(sanitizeNode(child)));
      return fragment;
    }

    const safeElement = document.createElement(node.tagName.toLowerCase());
    if (node.tagName === 'A') {
      const href = node.getAttribute('href');
      if (href) {
        try {
          const safeURL = new URL(href, window.location.href);
          if (safeURL.protocol === 'https:' || safeURL.protocol === 'http:') {
            safeElement.href = safeURL.href;
            safeElement.target = '_blank';
            safeElement.rel = 'noopener noreferrer';
          }
        } catch (error) {
          console.warn('Skipped an invalid link in a message.');
        }
      }
    }

    Array.from(node.childNodes).forEach(child => safeElement.appendChild(sanitizeNode(child)));
    fragment.appendChild(safeElement);
    return fragment;
  }

  const safeContent = document.createDocumentFragment();
  Array.from(template.content.childNodes).forEach(node => safeContent.appendChild(sanitizeNode(node)));
  return safeContent;
}

function addMessage(text, sender, save = true) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;

  const avatar = document.createElement('div');
  avatar.className = `message-avatar ${sender}-avatar`;
  
  if (sender === 'user') {
      const userInitial = currentUser ? currentUser.charAt(0).toUpperCase() : 'U';
      const profileImage = userData[currentUser] && userData[currentUser].profilePicture;
      if (profileImage && profileImage.startsWith('data:image/')) {
        const image = document.createElement('img');
        image.src = profileImage;
        image.alt = 'Profile';
        image.className = 'message-profile-picture';
        avatar.appendChild(image);
      } else {
        avatar.textContent = userInitial;
      }
  } else {
      avatar.textContent = 'V';
  }

  const content = document.createElement('div');
  content.className = 'message-content';
  if (sender === 'user') {
    content.textContent = text;
  } else {
    content.appendChild(sanitizeMessageHTML(text));
  }

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
    // Save the raw HTML content to preserve formatting
    saveMessage(text, sender);
  }
}

function speak(text, onEndCallback) {
    try {
        if (synth.speaking) {
            synth.cancel();
        }
        
        // Strip HTML tags for speech
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';

        if (!plainText) return;

        const utterance = new SpeechSynthesisUtterance(plainText);

        utterance.onstart = () => {
            isSpeaking = true;
            if (micButton) {
                micButton.classList.add('speaking');
                if (micIcon) micIcon.style.display = 'none';
                if (stopIcon) stopIcon.style.display = 'block';
                micButton.title = 'V.E.R.A is speaking... Click to stop';
            }
        };

        utterance.onend = () => {
            isSpeaking = false;
            if (micButton) {
                micButton.classList.remove('speaking');
                if (micIcon) micIcon.style.display = 'block';
                if (stopIcon) stopIcon.style.display = 'none';
                micButton.title = 'Voice input';
            }
            if (onEndCallback) {
                onEndCallback();
            }
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            isSpeaking = false;
            if (micButton) {
                micButton.classList.remove('speaking');
                if (micIcon) micIcon.style.display = 'block';
                if (stopIcon) stopIcon.style.display = 'none';
                micButton.title = 'Voice input';
            }
        };

        synth.speak(utterance);
    } catch (error) {
        console.error('Speech synthesis error:', error);
    }
}

function notifyVideoDownloadUnavailable() {
    const message = 'YouTube downloads are not available in the web version. Use YouTube’s official playback and download options.';
    addMessage(message, 'bot');
    speak(message);
}


async function fetchOpenKnowledgeAnswer(query) {
  const searchTerm = query.trim().replace(
    /^(?:tell me about|what is|who is|where is|when was|when did|explain|define)\s+/i,
    ''
  ) || query.trim();
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: searchTerm,
    gsrnamespace: '0',
    gsrlimit: '1',
    prop: 'extracts',
    exintro: '1',
    explaintext: '1',
    exchars: '900',
    redirects: '1',
    format: 'json',
    origin: '*'
  });
  const response = await fetch(`${WIKIPEDIA_API_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Wikipedia request failed with status ${response.status}`);
  }

  const data = await response.json();
  const page = Object.values(data.query?.pages || {})
    .sort((left, right) => left.index - right.index)
    .find(result => typeof result.extract === 'string' && result.extract.trim());
  if (!page) return null;

  return {
    title: page.title,
    extract: page.extract.trim(),
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`
  };
}

async function processQuery(query) {
  addMessage(query, 'user');
  
  const lowerQuery = query.toLowerCase().trim();
  let response = '';
  
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/i;
  const youtubeMatch = query.match(youtubeRegex);

  if (youtubeMatch) {
    notifyVideoDownloadUnavailable();
    return;
  }

  if (['hello', 'hi', 'hey'].includes(lowerQuery)) {
    response = currentUser ? `Hello, ${currentUser}! How can I assist you?` : "Hello! How can I assist you today?";
    addMessage(response, 'bot');
    speak(response);
    return;
  }
  
  if (lowerQuery.includes('how are you')) {
      response = "I'm a machine, but I'm operating at full capacity! Thanks for asking. What can I do for you?";
      addMessage(response, 'bot');
      speak(response);
      return;
  }

  if (lowerQuery.includes("time")) {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timeZone = now.toLocaleDateString(undefined, {day:'2-digit',timeZoneName: 'long' }).substring(4);
    response = `The current time is <strong>${time}</strong> (${timeZone}).`;
    addMessage(response, 'bot');
    speak(`The current time is ${time}.`);
    return;
  }

  if (lowerQuery.includes("date")) {
    const now = new Date();
    const date = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    response = `Today's date is <strong>${date}</strong>.`;
    addMessage(response, 'bot');
    speak(`Today's date is ${date}.`);
    return;
  }

  const mathQuery = lowerQuery
    .replace(/^(what is|what's|calculate|compute)\s*/, '')
    .replace(/[?.!]+$/, '')
    .trim();
  const result = evaluateMathExpression(mathQuery);
  if (result !== null) {
    response = `The result of <code>${escapeHTML(mathQuery)}</code> is <strong>${result}</strong>.`;
    addMessage(response, 'bot');
    speak(`The answer is ${result}`);
    return;
  }

  const commonSites = {
    youtube: "https://www.youtube.com",
    duckduckgo: "https://duckduckgo.com",
    firefox: "https://firefox.com",
    google: "https://www.google.com",
    wikipedia: "https://www.wikipedia.org",
    github: "https://www.github.com",
  };

  const domainMatch = lowerQuery.match(/open\s+([a-z0-9.-]+\.[a-z]{2,})/i);
  if (domainMatch) {
    const url = domainMatch[1].startsWith('http') ? domainMatch[1] : 'https://' + domainMatch[1];
    window.open(url, '_blank');
    response = `Opening ${domainMatch[1]}...`;
    addMessage(response, 'bot');
    speak(response);
    return;
  }

  function evaluateMathExpression(expression) {
    const normalized = expression.replace(/\s+/g, '');
    const tokens = normalized.match(/\d+(?:\.\d+)?|[()+\-*/]/g);
    if (!tokens || tokens.join('') !== normalized || !/[+\-*/]/.test(normalized)) return null;

    let position = 0;
    function parsePrimary() {
      if (tokens[position] === '+' || tokens[position] === '-') {
        const sign = tokens[position++] === '-' ? -1 : 1;
        return sign * parsePrimary();
      }
      if (tokens[position] === '(') {
        position++;
        const value = parseExpression();
        if (tokens[position++] !== ')') throw new Error('Missing closing parenthesis.');
        return value;
      }
      const token = tokens[position++];
      if (!token || !/^\d+(?:\.\d+)?$/.test(token)) throw new Error('Expected a number.');
      return Number(token);
    }

    function parseTerm() {
      let value = parsePrimary();
      while (tokens[position] === '*' || tokens[position] === '/') {
        const operator = tokens[position++];
        const right = parsePrimary();
        if (operator === '/' && right === 0) throw new Error('Cannot divide by zero.');
        value = operator === '*' ? value * right : value / right;
      }
      return value;
    }

    function parseExpression() {
      let value = parseTerm();
      while (tokens[position] === '+' || tokens[position] === '-') {
        const operator = tokens[position++];
        const right = parseTerm();
        value = operator === '+' ? value + right : value - right;
      }
      return value;
    }

    try {
      const value = parseExpression();
      return position === tokens.length && Number.isFinite(value) ? value : null;
    } catch (error) {
      return null;
    }
  }

  for (const keyword in commonSites) {
    if (lowerQuery.includes('open') && lowerQuery.includes(keyword)) {
      window.open(commonSites[keyword], '_blank');
      response = `Opening ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}...`;
      addMessage(response, 'bot');
      speak(response);
      return;
    }
  }

  const tempMessage = document.createElement('div');
  tempMessage.className = 'message bot-message';
  tempMessage.innerHTML = `<div class="message-avatar bot-avatar">V</div><div class="message-content"><i>Searching Wikipedia...</i></div>`;
  chatMessages.appendChild(tempMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const result = await fetchOpenKnowledgeAnswer(query);
    chatMessages.removeChild(tempMessage);

    if (!result) {
      const message = 'I could not find a matching Wikipedia article. Try a more specific topic.';
      addMessage(message, 'bot');
      speak(message);
      return;
    }

    const answer = `<strong>${escapeHTML(result.title)}</strong><p>${escapeHTML(result.extract)}</p><p>Source: <a href="${escapeHTML(result.url)}">Wikipedia (CC BY-SA)</a></p>`;
    addMessage(answer, 'bot');
    speak(`${result.title}. ${result.extract}`);
  } catch (error) {
    console.error('Wikipedia lookup failed:', error);
    if (tempMessage.isConnected) chatMessages.removeChild(tempMessage);
    const message = 'I could not reach Wikipedia right now. Check your connection and try again.';
    addMessage(message, 'bot');
    speak(message);
  }
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
      micIcon.style.display = 'none';
      stopIcon.style.display = 'block';
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
      micIcon.style.display = 'block';
      stopIcon.style.display = 'none';
      micButton.title = 'Voice input';
    };

    recognition.onerror = function(event) {
      console.error('Speech recognition error:', event.error);
      isRecording = false;
      micButton.classList.remove('recording');
      micIcon.style.display = 'block';
      stopIcon.style.display = 'none';
      micButton.title = 'Voice input';
    };
  } else {
    micButton.style.display = 'none';
  }
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('vera_theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.textContent = '🌜';
        themeText.textContent = 'Dark Mode';
    } else {
        document.body.classList.remove('light-mode');
        themeIcon.textContent = '🌞';
        themeText.textContent = 'Light Mode';
    }
}

function downloadChat() {
  const chat = chatData.find(c => c.id === currentChatId);
  if (!chat || chat.messages.length === 0) {
    addMessage("There is no chat to download.", 'bot');
    speak("There is no chat to download.");
    return;
  }

  let chatContent = `Chat Title: ${chat.title}\n`;
  chatContent += `Saved: ${new Date().toLocaleString()}\n\n`;
  
  chat.messages.forEach(msg => {
    // Strip HTML for plain text download
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = msg.text;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    chatContent += `[${new Date(msg.timestamp).toLocaleString()}] ${msg.sender.toUpperCase()}:\n${plainText}\n\n`;
  });

  const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VERA_Chat_${chat.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  addMessage("Current chat has been downloaded as a .txt file.", 'bot');
  speak("Chat downloaded.");
}


themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    let theme = 'dark';
    if (document.body.classList.contains('light-mode')) {
        theme = 'light';
        themeIcon.textContent = '🌜';
        themeText.textContent = 'Dark Mode';
    } else {
        themeIcon.textContent = '🌞';
        themeText.textContent = 'Light Mode';
    }
    localStorage.setItem('vera_theme', theme);
});


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
  if (isSpeaking) {
    synth.cancel();
    return;
  }
  
  if (isRecording) {
    recognition.stop();
    return;
  }
  
  if (!recognition) {
    addMessage('Speech recognition is not supported in your browser.', 'bot');
    return;
  }

  recognition.start();
});



sidebarOverlay.addEventListener('click', closeSidebar);
newChatBtn.addEventListener('click', () => {
  startNewChat();
  closeSidebar();
});
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

loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

// Create Account link handler
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const createAccountLink = document.getElementById('createAccountLink');
        if (createAccountLink) {
            createAccountLink.addEventListener('click', function(e) {
                e.preventDefault();
                showRegistrationModal();
            });
        }
    }, 100);
});

logoutBtn.addEventListener('click', () => {
    // Stop update checks
    stopUpdateCheck();
    
    // Clear user data
    currentUser = null;
    localStorage.removeItem('vera_current_user');
    
    // Update UI
    updateUIForLoggedInUser();
    checkLoginStatus();
    
    // Clear chat and show welcome
    startNewChat();
    
    addMessage("You have been logged out successfully.", 'bot');
    speak("You have been logged out successfully.");
});

// Replace the existing desktopDownloadBtn click listener
desktopDownloadBtn.addEventListener('click', () => {
  if (!currentUser) {
    // Show login modal if user is not logged in
    loginModal.style.display = 'block';
    // Add a message to inform user
    addMessage("Please log in to access download options.", 'bot');
    speak("Please log in to access download options.");
    return;
  }
  
  // If user is logged in, show download modal
  downloadMessage.style.display = 'none';
  downloadModal.style.display = 'block';
});

// Also update Linux and Mac download buttons
linuxDownloadBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (!currentUser) {
    loginModal.style.display = 'block';
    addMessage("Please log in to access download options.", 'bot');
    speak("Please log in to access download options.");
    return;
  }
  showComingSoonMessage();
});

macDownloadBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (!currentUser) {
    loginModal.style.display = 'block';
    addMessage("Please log in to access download options.", 'bot');
    speak("Please log in to access download options.");
    return;
  }
  showComingSoonMessage();
});

ollamaDownloadBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (!currentUser) {
    loginModal.style.display = 'block';
    addMessage("Please log in to access download options.", 'bot');
    speak("Please log in to access download options.");
    return;
  }

  const ollamaInstructions = `
        <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How to install Ollama and Llama 3.2:</h3>
        <p style="font-size: 1rem; margin-bottom: 10px;">1. <b>Download Ollama:</b> Visit <a href="https://ollama.com/download" target="_blank" style="color: #60a5fa; text-decoration: underline;">ollama.com/download</a> and download the installer for your operating system.</p>
        <p style="font-size: 1rem; margin-bottom: 10px;">2. <b>Install Ollama:</b> Run the downloaded installer and follow the on-screen instructions.</p>
        <p style="font-size: 1rem; margin-bottom: 10px;">3. <b>Open your Terminal/Command Prompt:</b> After installation, open your terminal (macOS/Linux) or Command Prompt/PowerShell (Windows).</p>
        <p style="font-size: 1rem; margin-bottom: 10px;">4. <b>Download Llama 3.2:</b> In the terminal, run the command: <code style="background-color: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 6px; font-family: monospace; font-size: 0.95rem; display: inline-block; margin-top: 5px;">ollama run llama3.2</code></p>
        <p style="font-size: 1rem; margin-bottom: 10px;">This command will download the Llama 3.2 model. Once downloaded, it will start running, and you can interact with it directly in your terminal.</p>
        <p style="font-size: 1rem;">For more detailed instructions and advanced usage, refer to the <a href="https://ollama.com/blog/llama3" target="_blank" style="color: #60a5fa; text-decoration: underline;">Ollama Llama 3 blog post</a>.</p>
    `;
    
    downloadMessage.innerHTML = ollamaInstructions;
    downloadMessage.style.display = 'block';
    downloadModal.scrollTop = 0;
});


// New Listeners for Forgot Password
forgotPasswordLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginModal.style.display = 'none';
  forgotPasswordModal.style.display = 'block';
});

closeForgotPasswordModal.addEventListener('click', () => {
  forgotPasswordModal.style.display = 'none';
});

backToLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  forgotPasswordModal.style.display = 'none';
  loginModal.style.display = 'block';
});

// Replace the forgotPasswordForm submit event listener with:
forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('resetUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        addMessage("New passwords do not match.", 'bot');
        speak("New passwords do not match.");
        return;
    }

    try {
        const response = await fetch(`${APPS_SCRIPT_URL}?action=resetPassword&username=${encodeURIComponent(username)}&newPassword=${encodeURIComponent(newPassword)}`);
        const data = await response.json();
        
        if(data.status === 'success') {
            if (!userData[username]) userData[username] = {};
            userData[username].password = newPassword;
            saveUserData();
            
            addMessage(`Password for ${username} has been reset. You can now login.`, 'bot');
            speak(`Password for ${username} has been reset.`);
            forgotPasswordModal.style.display = 'none';
            loginModal.style.display = 'block';
            forgotPasswordForm.reset();
        } else {
            addMessage(`Failed to reset password! ${data.message}`, 'bot');
            speak(`Failed to reset password! ${data.message}`);
        }
    } catch (error) {
        console.error('Password reset error:', error);
        addMessage('Failed to reset password! Please try again later.', 'bot');
        speak('Failed to reset password! Please try again later.');
    }
});


// New Listeners for User Profile
userProfileBtn.addEventListener('click', () => {
  if (!currentUser) return;

  // Load current user data into modal
  const data = userData[currentUser] || {};
  profileUsername.value = currentUser;
  profileEmail.value = data.email || '';
  profileFullName.value = data.fullName || '';
  profileBio.value = data.bio || '';
  profileLocation.value = data.location || '';
  profilePicture.src = data.profilePicture || `https://ui-avatars.com/api/?name=${currentUser.charAt(0)}&background=10b981&color=fff&size=150`;

  profileSuccessMessage.style.display = 'none';
  userProfileModal.style.display = 'block';
});

closeUserProfileModal.addEventListener('click', () => {
  userProfileModal.style.display = 'none';
});

profilePictureInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      profilePicture.src = dataUrl;
      
      // Save PFP data immediately
      if (!userData[currentUser]) userData[currentUser] = {};
      userData[currentUser].profilePicture = dataUrl;
      saveUserData();
      // Reload current chat to update avatar
      loadChat(currentChatId); 
    };
    reader.readAsDataURL(file);
  }
});

// Replace the userProfileForm submit event listener with:
userProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const profileData = {
        username: currentUser,
        email: profileEmail.value,
        fullName: profileFullName.value,
        bio: profileBio.value,
        location: profileLocation.value,
        profilePicture: userData[currentUser]?.profilePicture || ''
    };

    try {
        const response = await fetch(`${APPS_SCRIPT_URL}?action=profile&` + new URLSearchParams(profileData));
        const data = await response.json();
        
        if(data.status === 'success') {
            if (!userData[currentUser]) userData[currentUser] = {};
            Object.assign(userData[currentUser], profileData);
            saveUserData();

            profileSuccessMessage.style.display = 'block';
            setTimeout(() => {
                profileSuccessMessage.style.display = 'none';
            }, 3000);
        } else {
            addMessage('Failed to update profile! Please try again.', 'bot');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        addMessage('Failed to update profile! Please try again later.', 'bot');
    }
});

// Download Chat Button Listener
downloadChatBtn.addEventListener('click', downloadChat);



// Add this function to check if it's first visit

// Add registration form handler
registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!checkConnectivity()) {
        addMessage('No internet connection. Please check your network and try again.', 'bot');
        return;
    }

    const username = regUsername.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value;
    const confirmPassword = confirmRegPassword.value;

    // Validation
    if (!username || !email || !password) {
        addMessage('Please fill in all fields.', 'bot');
        return;
    }

    if (password !== confirmPassword) {
        addMessage('Passwords do not match!', 'bot');
        return;
    }

    const submitButton = registrationForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Creating Account...';

    try {
        const response = await fetch(
            `${APPS_SCRIPT_URL}?action=register&` +
            `username=${encodeURIComponent(username)}&` +
            `email=${encodeURIComponent(email)}&` +
            `password=${encodeURIComponent(password)}&` +
            `confirmPassword=${encodeURIComponent(confirmPassword)}`
        );
        
        const data = await response.json();
        console.log('Registration response:', data);

        if (data.status === 'success') {
            // Show success message in chat
            addMessage('✅ Account created successfully! Please login with your credentials.', 'bot');
            speak('Account created successfully! Please login.');
            
            // Clear form
            registrationForm.reset();
            
            // Hide registration modal and show login modal
            registrationModal.style.display = 'none';
            registrationModal.classList.remove('active');
            
            setTimeout(() => {
                loginModal.style.display = 'flex';
            }, 500);
        } else {
            addMessage(`❌ ${data.message}`, 'bot');
            speak(`Registration failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Registration error:', error);
        addMessage('Failed to create account. Please try again later.', 'bot');
        speak('Failed to create account. Please try again later.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
});

// Replace the modal close button handlers (around line 1070):
closeRegistrationModal.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Closing registration modal');
    registrationModal.style.display = 'none';
    registrationModal.classList.remove('active');
    registrationForm.reset();
});

closeLoginModal.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Closing login modal');
    loginModal.style.display = 'none';
    loginForm.reset();
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Switching to login modal');
    
    // Hide registration
    registrationModal.style.display = 'none';
    registrationModal.classList.remove('active');
    registrationForm.reset();
    
    // Show login
    loginModal.style.display = 'flex';
});

// Update the window click handler (around line 1095):
window.addEventListener('click', (event) => {
    if (event.target === registrationModal) {
        registrationModal.style.display = 'none';
        registrationModal.classList.remove('active');
    }
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (event.target === downloadModal) {
        downloadModal.style.display = 'none';
    }
    if (event.target === guidanceModal) {
        guidanceModal.style.display = 'none';
    }
    if (event.target === feedbackModal) {
        feedbackModal.style.display = 'none';
    }
    if (event.target === forgotPasswordModal) {
        forgotPasswordModal.style.display = 'none';
    }
    if (event.target === userProfileModal) {
        userProfileModal.style.display = 'none';
    }
});


// Add this function near the top with other utility functions
function checkConnectivity() {
  return navigator.onLine;
}

// Add these event listeners after the other modal-related listeners

// Guidance Modal
guidanceBtn.addEventListener('click', () => {
    guidanceModal.style.display = 'block';
});

closeGuidanceModal.addEventListener('click', () => {
    guidanceModal.style.display = 'none';
});

// Feedback Modal
feedbackBtn.addEventListener('click', () => {
    feedbackModal.style.display = 'block';
});

closeFeedbackModal.addEventListener('click', () => {
    feedbackModal.style.display = 'none';
});

// Download Modal Close Button
closeDownloadModal.addEventListener('click', () => {
    downloadModal.style.display = 'none';
});

// Add feedback form submission handling
feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!checkConnectivity()) {
        addMessage('No internet connection. Please check your network and try again.', 'bot');
        return;
    }

    // Get form data
    const feedbackData = {
        username: currentUser || 'Anonymous',
        name: document.getElementById('feedbackName').value,
        email: document.getElementById('feedbackEmail').value,
        feedbackType: document.getElementById('feedbackType').value,
        message: document.getElementById('feedbackMessage').value,
        consent: document.getElementById('feedbackConsent').checked
    };

    try {
        // Show loading state
        const submitButton = feedbackForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        // Send feedback to Google Apps Script
        const response = await fetch(`${APPS_SCRIPT_URL}?action=feedback&` + new URLSearchParams(feedbackData));
        const data = await response.json();

        if (data.status === 'success') {
            // Show success message
            feedbackSuccessMessage.style.display = 'block';
            
            // Clear form
            feedbackForm.reset();
            
            // Hide success message and modal after 2 seconds
            setTimeout(() => {
                feedbackSuccessMessage.style.display = 'none';
                feedbackModal.style.display = 'none';
            }, 2000);

            // Add feedback confirmation message in chat
            addMessage("Thank you for your feedback! It has been saved successfully.", 'bot');
            speak("Thank you for your feedback!");
        } else {
            throw new Error(data.message || 'Failed to save feedback');
        }
        
    } catch (error) {
        console.error('Error submitting feedback:', error);
        addMessage("Sorry, there was an error submitting your feedback. Please try again.", 'bot');
        speak("Sorry, there was an error submitting your feedback. Please try again.");
    } finally {
        // Reset button state
        const submitButton = feedbackForm.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Feedback';
    }
});

// Add click handler for opening download modal from guidance
openDownloadModalFromGuidance.addEventListener('click', (e) => {
    e.preventDefault();
    guidanceModal.style.display = 'none';
    
    // Check login status before showing download modal
    if (!currentUser) {
        loginModal.style.display = 'block';
        addMessage("Please log in to access download options.", 'bot');
        speak("Please log in to access download options.");
        return;
    }
    
    downloadModal.style.display = 'block';
});

// Helper function to show "Coming Soon" message
function showComingSoonMessage() {
    downloadMessage.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h3>Coming Soon!</h3>
            <p>This version is currently under development. Please check back later.</p>
        </div>
    `;
    downloadMessage.style.display = 'block';
}

// Add to script.js
function checkForUpdates() {
    fetch(`${APPS_SCRIPT_URL}?action=getData`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Update user data
                if (data.data.users) {
                    updateUserData(data.data.users);
                }
                // Update feedback data
                if (data.data.feedback) {
                    updateFeedbackData(data.data.feedback);
                }
            }
        })
        .catch(error => console.error('Error checking for updates:', error));
}

function updateUserData(users) {
    if (!Array.isArray(users)) {
        console.error('Invalid users data:', users);
        return;
    }

    users.forEach(user => {
        if (!Array.isArray(user) || user.length < 2) {
            console.error('Invalid user record:', user);
            return;
        }

        const username = user[1]; // Column B in Sheet2
        if (username === currentUser) {
            // Update profile fields if the profile modal is open
            if (userProfileModal && userProfileModal.style.display === 'block') {
                if (profileEmail) profileEmail.value = user[2] || '';
                if (profileFullName) profileFullName.value = user[3] || '';
                if (profileBio) profileBio.value = user[4] || '';
                if (profileLocation) profileLocation.value = user[5] || '';
            }
            
            // Update stored user data
            if (!userData[username]) userData[username] = {};
            userData[username] = {
                ...userData[username],
                email: user[2] || '',
                fullName: user[3] || '',
                bio: user[4] || '',
                location: user[5] || '',
            };

            // Trigger UI updates
            saveUserData();
            updateUIWithUserData();
        }
    });
}

function updateFeedbackData(feedback) {
    // Update feedback display if the feedback modal is open
    if (feedbackModal.style.display === 'block') {
        // Update feedback display logic here
    }
}

// Start periodic updates when user is logged in
let updateCheckInterval;

function startUpdateCheck() {
    if (currentUser) {
        // Initial check
        checkForUpdates();
        // Set up periodic checks
        updateCheckInterval = setInterval(checkForUpdates, UPDATE_INTERVAL);
    }
}

function stopUpdateCheck() {
    if (updateCheckInterval) {
        clearInterval(updateCheckInterval);
        updateCheckInterval = null;
    }
}

function updateUIWithUserData() {
    if (!currentUser) return;

    // Update welcome message
    const welcomeTitle = document.querySelector('.welcome-title');
    if (welcomeTitle) {
        const userName = userData[currentUser]?.fullName || currentUser;
        welcomeTitle.textContent = `Hello, ${userName}! How can I help?`;
    }

    // Update chat messages with new profile picture
    const userAvatars = document.querySelectorAll('.user-message .message-avatar');
    userAvatars.forEach(avatar => {
        const profileImage = userData[currentUser]?.profilePicture;
        avatar.textContent = '';
        if (profileImage && profileImage.startsWith('data:image/')) {
            const image = document.createElement('img');
            image.src = profileImage;
            image.alt = 'Profile';
            image.className = 'message-profile-picture';
            avatar.appendChild(image);
        } else {
            avatar.textContent = currentUser.charAt(0).toUpperCase();
        }
    });

    // Trigger chat history refresh to update any visible user data
    renderChatHistory();
}

// Add after other event listeners
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!checkConnectivity()) {
        addMessage('No internet connection. Please check your network and try again.', 'bot');
        return;
    }

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        addMessage('Please enter username and password.', 'bot');
        return;
    }

    const submitButton = loginForm.querySelector('button[type="submit"]');
    const loginStatus = loginModal.querySelector('.login-status');
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';

    // Show loading status
    if (loginStatus) {
        loginStatus.style.display = 'block';
        loginStatus.innerHTML = '<div class="loading-spinner"></div><span class="status-message">Verifying credentials...</span>';
    }

    try {
        const response = await fetch(
            `${APPS_SCRIPT_URL}?action=login&` +
            `username=${encodeURIComponent(username)}&` +
            `password=${encodeURIComponent(password)}`
        );
        
        const data = await response.json();
        console.log('Login response:', data);

        if (data.status === 'success') {
            // Save user info
            currentUser = username;
            if (!userData[username]) {
                userData[username] = {
                    password: password,
                    email: '',
                    fullName: '',
                    bio: '',
                    location: '',
                    profilePicture: ''
                };
            }
            
            localStorage.setItem('vera_current_user', username);
            localStorage.setItem('vera_user_data', JSON.stringify(userData));
            
            // Hide login modal
            loginModal.style.display = 'none';
            loginForm.reset();
            if (loginStatus) loginStatus.style.display = 'none';
            
            // Update UI
            updateUIForLoggedInUser();
            startUpdateCheck();
            
            addMessage(`✅ Welcome back, ${username}!`, 'bot');
            speak(`Welcome back, ${username}!`);
        } else if (data.message === 'Username not found') {
            // User doesn't exist - offer to create account
            if (loginStatus) {
                loginStatus.innerHTML = '<span class="error-message">❌ Username not found. Would you like to create an account?</span>';
            }
            
            addMessage(`❌ Username "${username}" not found. Please create an account first.`, 'bot');
            speak('Username not found. Please create an account.');
            
            // Show create account link or switch to registration
            setTimeout(() => {
                if (confirm('Username not found. Would you like to create an account?')) {
                    switchToRegistration();
                    
                    // Pre-fill username
                    document.getElementById('regUsername').value = username;
                }
            }, 500);
        } else {
            // Wrong password or other error
            if (loginStatus) {
                loginStatus.innerHTML = `<span class="error-message">❌ ${data.message}</span>`;
            }
            addMessage(`❌ ${data.message}`, 'bot');
            speak(data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        if (loginStatus) {
            loginStatus.innerHTML = '<span class="error-message">❌ Connection error. Please try again.</span>';
        }
        addMessage('Failed to login. Please try again later.', 'bot');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
        
        // Hide loading status after 3 seconds if there was an error
        if (loginStatus && loginStatus.innerHTML.includes('error-message')) {
            setTimeout(() => {
                loginStatus.style.display = 'none';
            }, 3000);
        }
    }
});

function switchToRegistration() {
    loginModal.style.display = 'none';
    loginForm.reset();
    
    registrationModal.style.display = 'flex';
    registrationModal.classList.add('active');
}

async function makeAPIRequest(action, params) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${APPS_SCRIPT_URL}?action=${action}&${queryString}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`API Request Error (${action}):`, error);
        throw error;
    }
}

// Replace the handleLogin function in your Apps Script

function handleLogin(e, ss) {
  const sheet = ss.getSheetByName('Sheet1');
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'User database not found'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const username = e && e.parameter ? String(e.parameter.username).trim() : null;
  const password = e && e.parameter ? String(e.parameter.password) : null;
  
  if (!username || !password) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Missing username or password'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    const data = sheet.getDataRange().getValues();
    
    // Debug logging
    Logger.log('Login attempt - Username: ' + username);
    Logger.log('Login attempt - Password length: ' + password.length);
    
    // Check if user exists and password matches (starts from row 2, skip header)
    for (let i = 1; i < data.length; i++) {
      const dbUsername = String(data[i][1]).trim();  // Column B = Username
      const dbPassword = String(data[i][2]);         // Column C = Password
      
      // Debug logging
      Logger.log('Checking row ' + (i+1) + ' - DB Username: "' + dbUsername + '"');
      Logger.log('Checking row ' + (i+1) + ' - DB Password: "' + dbPassword + '"');
      
      if (dbUsername === username) {
        // Found the user, now check password
        Logger.log('User found! Comparing passwords...');
        Logger.log('Input password: "' + password + '" (length: ' + password.length + ')');
        Logger.log('DB password: "' + dbPassword + '" (length: ' + dbPassword.length + ')');
        
        if (dbPassword === password) {
          return ContentService.createTextOutput(JSON.stringify({
            status: 'success',
            message: 'Login successful',
            username: username
          })).setMimeType(ContentService.MimeType.JSON);
        } else {
          return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            message: 'Invalid password',
            debug: 'Expected: "' + dbPassword + '", Got: "' + password + '"'
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    
    // User not found
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Username not found'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Login error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
