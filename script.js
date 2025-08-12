
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


let recognition;
let isRecording = false;
let isSpeaking = false;
let currentChatId = null;
let chatData = [];
let pendingDeleteAction = null;
let userData = {};
let currentUser = null;
const synth = window.speechSynthesis;

// Global variable to store YouTube link for download options
let youtubeLinkToDownload = null;

document.addEventListener('DOMContentLoaded', function() {
  // Show welcome screen
  setTimeout(() => {
    welcomeOverlay.style.opacity = '0';
    setTimeout(() => {
      welcomeOverlay.style.display = 'none';
    }, 1000);
  }, 3000);

  loadChatHistory();
  loadUserData();
  checkLoginStatus();
  startNewChat();
  initializeSidebarState();
  initializeTheme();
  
  // Attach toggle events
  mobileToggle.addEventListener('click', toggleSidebar);
  sidebarToggle.addEventListener('click', toggleSidebar); // Also allow close button to toggle
});

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
    localStorage.setItem('vera_chat_history', JSON.stringify(chatData));
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
    if (currentUser) {
        loginBtn.style.display = 'none';
        logoutSection.style.display = 'block';
        const welcomeTitle = document.querySelector('.welcome-title');
        if(welcomeTitle) {
           welcomeTitle.textContent = `Hello, ${currentUser}! How can I help?`;
        }
    } else {
        loginBtn.style.display = 'block';
        logoutSection.style.display = 'none';
        const welcomeTitle = document.querySelector('.welcome-title');
        if(welcomeTitle) {
           welcomeTitle.textContent = 'How can I help you today?';
        }
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
  checkLoginStatus(); // Re-apply username to welcome message
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
  checkLoginStatus(); // Re-apply username to welcome message
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

function addMessage(text, sender, save = true) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;

  const avatar = document.createElement('div');
  avatar.className = `message-avatar ${sender}-avatar`;
  avatar.textContent = sender === 'user' ? (currentUser ? currentUser.charAt(0).toUpperCase() : 'U') : 'V';

  const content = document.createElement('div');
  content.className = 'message-content';
  content.innerHTML = text; // Use innerHTML to render formatted text

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
    const savedText = content.textContent || text; // Save plain text version
    saveMessage(savedText, sender);
  }
}

function speak(text, onEndCallback) {
    if (synth.speaking) {
        synth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onstart = () => {
        isSpeaking = true;
        micButton.classList.add('speaking');
        micIcon.style.display = 'none';
        stopIcon.style.display = 'block';
        micButton.title = 'V.E.R.A is speaking... Click to stop';
    };

    utterance.onend = () => {
        isSpeaking = false;
        micButton.classList.remove('speaking');
        micIcon.style.display = 'block';
        stopIcon.style.display = 'none';
        micButton.title = 'Voice input';
        if (onEndCallback) {
            onEndCallback();
        }
    };

    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        isSpeaking = false;
        micButton.classList.remove('recording');
        micIcon.style.display = 'block';
        stopIcon.style.display = 'none';
        micButton.title = 'Voice input';
    };
    synth.speak(utterance);
}

// Function to prompt user for YouTube download format
function promptForDownloadFormat(url) {
    youtubeLinkToDownload = url; // Store the URL globally
    const messageContent = `
        <p>I detected a YouTube link! What format would you like to download it as?</p>
        <div class="flex space-x-2 mt-2">
            <button class="download-option-btn bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200" data-format="mp3">Download MP3</button>
            <button class="download-option-btn bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200" data-format="mp4">Download MP4</button>
        </div>
    `;
    addMessage(messageContent, 'bot');
    speak("I detected a YouTube link! What format would you like to download it as?");
}

// Function to simulate YouTube download
function simulateYouTubeDownload(format) {
    if (!youtubeLinkToDownload) {
        addMessage("No YouTube link found to download.", 'bot');
        speak("No YouTube link found to download.");
        return;
    }

    // Add a message indicating download in progress
    addMessage(`<i>Attempting to download ${format.toUpperCase()} from YouTube...</i>`, 'bot', false);
    speak(`Attempting to download ${format.toUpperCase()} from YouTube.`, () => {
        // Simulate download delay
        setTimeout(() => {
            const isSuccess = Math.random() > 0.3; // 70% chance of success
            let statusText = '';
            let statusColor = '';

            if (isSuccess) {
                statusText = `✅ Download of ${format.toUpperCase()} complete! (Simulation)`;
                statusColor = 'text-green-600';
                
                // Trigger a dummy file download
                // This is a placeholder as direct YouTube download is not possible from client-side JS.
                const dummyContent = `This is a simulated download for the YouTube link: ${youtubeLinkToDownload}\nFormat: ${format.toUpperCase()}\n\nA real YouTube downloader requires a backend server.`;
                const blob = new Blob([dummyContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `youtube_download_simulation.${format === 'mp3' ? 'txt' : 'txt'}`; // Still using .txt for dummy file
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url); // Clean up the URL object

                speak(`Download of ${format.toUpperCase()} complete! A dummy file has been downloaded.`);
            } else {
                statusText = `❌ Download of ${format.toUpperCase()} failed. (Simulation - requires backend)`;
                statusColor = 'text-red-600';
                speak(`Download of ${format.toUpperCase()} failed.`);
            }

            // Update the last message or add a new one with the status
            const statusMessageContent = `<span class="${statusColor}">${statusText}</span>`;
            addMessage(statusMessageContent, 'bot');
            youtubeLinkToDownload = null; // Clear the stored URL
        }, 3000); // Simulate a 3-second download
    });
}


async function processQuery(query) {
  addMessage(query, 'user');
  
  const lowerQuery = query.toLowerCase().trim();
  let response = '';
  
  // Regex to detect YouTube URLs
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/i;
  const youtubeMatch = query.match(youtubeRegex);

  if (youtubeMatch) {
    promptForDownloadFormat(youtubeMatch[0]); // Pass the full matched URL
    return;
  }


  // --- Direct Commands & Simple Q&A ---
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

  // --- Math Calculation ---
  const mathRegex = /^(what is|what's|calculate|compute)?\s*(-?[\d\.]+\s*[\+\-\*\/]\s*)+-?[\d\.]+$/;
  if(mathRegex.test(lowerQuery)) {
      try {
          const mathQuery = lowerQuery.replace(/what is|what's|calculate|compute/g, '').trim();
          const result = new Function(`'use strict'; return (${mathQuery})`)();
          if (typeof result === 'number' && isFinite(result)) {
            response = `The result of <code>${mathQuery}</code> is <strong>${result}</strong>.`;
            addMessage(response, 'bot');
            speak(`The answer is ${result}`);
            return;
          }
      } catch (e) {
          console.error("Math calculation error:", e);
      }
  }

  // --- Website Opening ---
  const commonSites = {
    youtube: "https://www.youtube.com", // This will now be handled by the youtubeRegex above
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

  for (const keyword in commonSites) {
    if (lowerQuery.includes('open') && lowerQuery.includes(keyword)) {
      window.open(commonSites[keyword], '_blank');
      response = `Opening ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}...`;
      addMessage(response, 'bot');
      speak(response);
      return;
    }
  }

  // --- General Knowledge Search (Fetch data from browse/DuckDuckGo) ---
  const tempMessage = document.createElement('div');
  tempMessage.className = 'message bot-message';
  tempMessage.innerHTML = `<div class="message-avatar bot-avatar">V</div><div class="message-content"><i>Searching for an answer...</i></div>`;
  chatMessages.appendChild(tempMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  speak(`Searching for ${query}`);

  try {
    const proxy = 'https://api.allorigins.win/get?url=';
    const duckUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(proxy + encodeURIComponent(duckUrl));
    const data = await response.json();
    const html = data.contents;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const snippet = doc.querySelector('.result__snippet');

    chatMessages.removeChild(tempMessage); // Remove the "Searching..." message

    let answer = snippet ? snippet.textContent.trim() : "Sorry, I couldn't find a clear answer to your question.";
    
    // Limit answer length
    if (answer.length > 500) {
      answer = answer.substring(0, 500) + '...';
    }
    
    addMessage(answer, 'bot');
    speak(answer);

  } catch (e) {
    console.error('Search error:', e);
    chatMessages.removeChild(tempMessage);
    const fallback = "Sorry, I couldn't fetch the answer right now. Please try again later.";
    addMessage(fallback, 'bot');
    speak(fallback);
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

// --- Theme Toggle ---
function initializeTheme() {
    const savedTheme = localStorage.getItem('vera_theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.textContent = '☀️'; // Corrected icon for light mode
        themeText.textContent = 'Dark Mode';
    } else {
        document.body.classList.remove('light-mode');
        themeIcon.textContent = '🌞';
        themeText.textContent = 'Light Mode';
    }
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


// --- Event Listeners ---
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

// Event listener for dynamically added download buttons
chatMessages.addEventListener('click', function(e) {
    if (e.target.classList.contains('download-option-btn')) {
        const format = e.target.dataset.format;
        simulateYouTubeDownload(format);
    }
});


loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

logoutBtn.addEventListener('click', () => {
    currentUser = null;
    saveUserData();
    checkLoginStatus();
    addMessage("You have been logged out.", 'bot');
});


closeLoginModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

// --- Download Modal Listeners ---
desktopDownloadBtn.addEventListener('click', () => {
  downloadMessage.style.display = 'none'; // Hide message on modal open
  downloadModal.style.display = 'block';
});

closeDownloadModal.addEventListener('click', () => {
  downloadModal.style.display = 'none';
});

function showComingSoonMessage() {
    downloadMessage.textContent = 'Coming Soon!';
    downloadMessage.style.display = 'block';
    setTimeout(() => {
        downloadMessage.style.display = 'none';
    }, 3000); // Hide after 3 seconds
}

linuxDownloadBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent following the href="#"
    showComingSoonMessage();
});

macDownloadBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent following the href="#"
    showComingSoonMessage();
});


window.addEventListener('click', (event) => {
    if (event.target == loginModal) {
        loginModal.style.display = 'none';
    }
    if (event.target == downloadModal) {
        downloadModal.style.display = 'none';
    }
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if(userData[username] && userData[username].password === password) {
        // Login successful
    } else if (userData[username]) {
        addMessage('Incorrect password!', 'bot');
        return;
    } else {
        // New user registration
        userData[username] = { password: password };
    }
    currentUser = username;
    saveUserData();
    checkLoginStatus();

    loginModal.style.display = 'none';
    loginForm.reset();
    addMessage(`Welcome, ${currentUser}!`, 'bot');

});

initializeSpeechRecognition();

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (confirmDialog.classList.contains('active')) {
      hideConfirmDialog();
    } else if (window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
      closeSidebar();
    } else if (loginModal.style.display === 'block') {
        loginModal.style.display = 'none';
    } else if (downloadModal.style.display === 'block') {
        downloadModal.style.display = 'none';
    }
  }
});

queryInput.focus();
