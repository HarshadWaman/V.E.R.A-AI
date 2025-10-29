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

// Add this constant near the top of script.js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzdMYLBXuIDCE1wIZGpC4XqD6NfgjvdmvioVM6w5_WbME_uJYvcK7kbd24juyJIrBEP/exec';

document.addEventListener('DOMContentLoaded', function() {
  // Show welcome screen
  setTimeout(() => {
    welcomeOverlay.style.opacity = '0';
    setTimeout(() => {
      welcomeOverlay.style.display = 'none';
    }, 1000); // Changed to 1s to match CSS transition
  }, 3000); // Keep 3s total duration

  loadChatHistory();
  loadUserData();
  checkLoginStatus();
  startNewChat();
  initializeSidebarState();
  initializeTheme();
  
  // Attach toggle events
  mobileToggle.addEventListener('click', toggleSidebar);
  sidebarToggle.addEventListener('click', toggleSidebar);
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
        userProfileBtn.style.display = 'flex'; // Show profile button
        const welcomeTitle = document.querySelector('.welcome-title');
        if(welcomeTitle) {
           welcomeTitle.textContent = `Hello, ${currentUser}! How can I help?`;
        }
    } else {
        loginBtn.style.display = 'flex';
        logoutSection.style.display = 'none';
        userProfileBtn.style.display = 'none'; // Hide profile button
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
  checkLoginStatus(); // Update welcome message
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
        <div class="example-prompt" onclick="fillPrompt('VERA-AI Introduction')">
          <div class="example-prompt-title">VERA-AI Introduction</div>
          <div class="example-prompt-subtitle">Search for VERA-AI Introduction information</div>
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

    // Create a temp div to strip HTML for the preview
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = preview;
    const plainPreview = tempDiv.textContent || tempDiv.innerText || '';


    return `
      <div class="chat-history-item" data-chat-id="${chat.id}">
        <div class="chat-history-title">${chat.title}</div>
        <div class="chat-history-preview">${plainPreview}</div>
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
  
  if (sender === 'user') {
      const userInitial = currentUser ? currentUser.charAt(0).toUpperCase() : 'U';
      const pfp = (userData[currentUser] && userData[currentUser].profilePicture) ? 
                  `<img src="${userData[currentUser].profilePicture}" alt="PFP" style="width:100%; height:100%; object-fit:cover; border-radius: 8px;">` : 
                  userInitial;
      avatar.innerHTML = pfp;
  } else {
      avatar.textContent = 'V';
  }

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
    // Save the raw HTML content to preserve formatting
    saveMessage(text, sender);
  }
}

function speak(text, onEndCallback) {
    if (synth.speaking) {
        synth.cancel();
    }
    
    // Strip HTML tags for speech
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    const utterance = new SpeechSynthesisUtterance(plainText);

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

function promptForDownloadFormat(url) {
    youtubeLinkToDownload = url;
    const messageContent = `
        <p>I detected a YouTube link! What format would you like to download it as?</p>
        <div class="download-options" style="display: flex; gap: 8px; margin-top: 8px;">
            <button class="download-option-btn" data-format="mp3" style="background-color: #3b82f6; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer;">Download MP3</button>
            <button class="download-option-btn" data-format="mp4" style="background-color: #10b981; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer;">Download MP4</button>
        </div>
    `;
    addMessage(messageContent, 'bot');
    speak("I detected a YouTube link! What format would you like to download it as?");
}

function simulateYouTubeDownload(format) {
    if (!youtubeLinkToDownload) {
        addMessage("No YouTube link found to download.", 'bot');
        speak("No YouTube link found to download.");
        return;
    }

    addMessage(`<i>Attempting to download ${format.toUpperCase()} from YouTube...</i>`, 'bot', false);
    speak(`Attempting to download ${format.toUpperCase()} from YouTube.`, () => {
        setTimeout(() => {
            const isSuccess = Math.random() > 0.3;
            let statusText = '';
            let statusColor = '';

            if (isSuccess) {
                statusText = `✅ Download of ${format.toUpperCase()} complete! (Simulation)`;
                statusColor = 'color: #10b981;';
                
                const dummyContent = `This is a simulated download for the YouTube link: ${youtubeLinkToDownload}\nFormat: ${format.toUpperCase()}\n\nA real YouTube downloader requires a backend server.`;
                const blob = new Blob([dummyContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `youtube_download_simulation.${format === 'mp3' ? 'txt' : 'txt'}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                speak(`Download of ${format.toUpperCase()} complete! A dummy file has been downloaded.`);
            } else {
                statusText = `❌ Download of ${format.toUpperCase()} failed. (Simulation - requires backend)`;
                statusColor = 'color: #ef4444;';
                speak(`Download of ${format.toUpperCase()} failed.`);
            }

            const statusMessageContent = `<span style="${statusColor}">${statusText}</span>`;
            addMessage(statusMessageContent, 'bot');
            youtubeLinkToDownload = null;
        }, 3000);
    });
}


async function processQuery(query) {
  addMessage(query, 'user');
  
  const lowerQuery = query.toLowerCase().trim();
  let response = '';
  
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/i;
  const youtubeMatch = query.match(youtubeRegex);

  if (youtubeMatch) {
    promptForDownloadFormat(youtubeMatch[0]);
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

    chatMessages.removeChild(tempMessage);

    let answer = snippet ? snippet.textContent.trim() : "Sorry, I couldn't find a clear answer to your question.";
    
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
    // Reload history to remove custom PFP
    loadChat(currentChatId); 
});


closeLoginModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

desktopDownloadBtn.addEventListener('click', () => {
  downloadMessage.style.display = 'none';
  downloadModal.style.display = 'block';
});

closeDownloadModal.addEventListener('click', () => {
  downloadModal.style.display = 'none';
});

guidanceBtn.addEventListener('click', () => {
  guidanceModal.style.display = 'block';
});

closeGuidanceModal.addEventListener('click', () => {
  guidanceModal.style.display = 'none';
});

openDownloadModalFromGuidance.addEventListener('click', () => {
  guidanceModal.style.display = 'none';
  downloadModal.style.display = 'block';
});

// Feedback Modal Listeners
feedbackBtn.addEventListener('click', () => {
  feedbackModal.style.display = 'block';
  feedbackSuccessMessage.style.display = 'none';
  feedbackForm.reset();
});

closeFeedbackModal.addEventListener('click', () => {
  feedbackModal.style.display = 'none';
});

// Replace the feedbackForm submit event listener with:
feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const feedbackData = {
        username: currentUser || 'Anonymous',
        name: document.getElementById('feedbackName').value,
        email: document.getElementById('feedbackEmail').value,
        feedbackType: document.getElementById('feedbackType').value,
        message: document.getElementById('feedbackMessage').value,
        consent: document.getElementById('feedbackConsent').checked ? 'Yes' : 'No'
    };

    try {
        const response = await fetch(`${APPS_SCRIPT_URL}?action=feedback&` + new URLSearchParams(feedbackData));
        const data = await response.json();
        
        if(data.status === 'success') {
            feedbackForm.style.display = 'none';
            feedbackSuccessMessage.style.display = 'block';
            
            setTimeout(() => {
                feedbackModal.style.display = 'none';
                feedbackForm.style.display = 'block';
                feedbackForm.reset();
            }, 3000);
        } else {
            addMessage('Failed to submit feedback! Please try again.', 'bot');
        }
    } catch (error) {
        console.error('Feedback submission error:', error);
        addMessage('Failed to submit feedback! Please try again later.', 'bot');
    }
});


function showComingSoonMessage() {
    downloadMessage.textContent = 'Coming Soon!';
    downloadMessage.style.display = 'block';
    setTimeout(() => {
        downloadMessage.style.display = 'none';
    }, 3000);
}

linuxDownloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showComingSoonMessage();
});

macDownloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showComingSoonMessage();
});

ollamaDownloadBtn.addEventListener('click', (e) => {
    e.preventDefault();

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


window.addEventListener('click', (event) => {
    if (event.target == loginModal) {
        loginModal.style.display = 'none';
    }
    if (event.target == downloadModal) {
        downloadModal.style.display = 'none';
    }
    if (event.target == guidanceModal) {
        guidanceModal.style.display = 'none';
    }
    if (event.target == feedbackModal) {
        feedbackModal.style.display = 'none';
    }
    if (event.target == forgotPasswordModal) {
        forgotPasswordModal.style.display = 'none';
    }
    if (event.target == userProfileModal) {
        userProfileModal.style.display = 'none';
    }
});

// Replace the loginForm submit event listener with:
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!checkConnectivity()) {
        addMessage('No internet connection. Please check your network and try again.', 'bot');
        return;
    }

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Show loading state
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Logging in...';
    submitButton.disabled = true;

    try {
        const encodedUsername = encodeURIComponent(username);
        const encodedPassword = encodeURIComponent(password);
        const url = `${APPS_SCRIPT_URL}?action=login&username=${encodedUsername}&password=${encodedPassword}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            currentUser = username;
            userData[username] = userData[username] || {
                password: password,
                email: '',
                fullName: '',
                bio: '',
                location: '',
                profilePicture: ''
            };
            saveUserData();
            checkLoginStatus();

            loginModal.style.display = 'none';
            loginForm.reset();
            addMessage(`Welcome back, ${currentUser}!`, 'bot');
            speak(`Welcome back, ${currentUser}!`);
        } else {
            addMessage(`Login failed: ${data.message || 'Invalid credentials'}`, 'bot');
            speak('Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Unable to connect to the server. Please try again later.';
        if (error.message.includes('HTTP error')) {
            errorMessage = 'Server error occurred. Please try again later.';
        }
        
        addMessage(errorMessage, 'bot');
        speak(errorMessage);
    } finally {
        // Reset button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
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
    } else if (guidanceModal.style.display === 'block') {
        guidanceModal.style.display = 'none';
    } else if (feedbackModal.style.display === 'block') {
        feedbackModal.style.display = 'none';
    } else if (forgotPasswordModal.style.display === 'block') {
        forgotPasswordModal.style.display = 'none';
    } else if (userProfileModal.style.display === 'block') {
        userProfileModal.style.display = 'none';
    }
  }
});

queryInput.focus();

// Add this function near the top with other utility functions
function checkConnectivity() {
  return navigator.onLine;
}
