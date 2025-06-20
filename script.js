const form = document.getElementById('searchForm');
const queryInput = document.getElementById('queryInput');
const chatMessages = document.getElementById('chatMessages');
const sendButton = document.getElementById('sendButton');
const micButton = document.getElementById('micButton');
const welcomeSection = document.getElementById('welcomeSection');

let recognition;
let isRecording = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = function () {
    isRecording = true;
    micButton.classList.add('recording');
    micButton.textContent = '🔴';
  };

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    queryInput.value = transcript;
    updateSendButton();
  };

  recognition.onend = function () {
    isRecording = false;
    micButton.classList.remove('recording');
    micButton.textContent = '🎤';
  };

  recognition.onerror = function (event) {
    console.error('Speech recognition error:', event.error);
    isRecording = false;
    micButton.classList.remove('recording');
    micButton.textContent = '🎤';
  };
}

queryInput.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  updateSendButton();
});

queryInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (queryInput.value.trim()) {
      form.dispatchEvent(new Event('submit'));
    }
  }
});

function updateSendButton() {
  if (queryInput.value.trim()) {
    sendButton.classList.add('active');
  } else {
    sendButton.classList.remove('active');
  }
}

micButton.addEventListener('click', function () {
  if (!recognition) {
    alert('Speech recognition is not supported in this browser.');
    return;
  }

  if (isRecording) {
    recognition.stop();
  } else {
    recognition.start();
  }
});

function fillPrompt(text) {
  queryInput.value = text;
  updateSendButton();
  queryInput.focus();
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  const query = queryInput.value.trim();
  if (!query) return;

  chatMessages.classList.add('has-messages');

  addMessage(query, 'user');
  queryInput.value = '';
  queryInput.style.height = 'auto';
  updateSendButton();

  const synth = window.speechSynthesis;
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("time")) {
    const time = new Date().toLocaleTimeString();
    addMessage(`Current time is ${time}`, 'bot');
    synth.speak(new SpeechSynthesisUtterance(`Current time is ${time}`));
    return;
  }

  if (lowerQuery.includes("date")) {
    const date = new Date().toLocaleDateString();
    addMessage(`Today's date is ${date}`, 'bot');
    synth.speak(new SpeechSynthesisUtterance(`Today's date is ${date}`));
    return;
  }

  const mathPattern = /^[\d+\-*/ ().]+$/;
  if (mathPattern.test(query)) {
    try {
      const result = eval(query);
      addMessage(`The answer is ${result}`, 'bot');
      synth.speak(new SpeechSynthesisUtterance(`The answer is ${result}`));
      return;
    } catch {
      const errorMsg = "Sorry, I couldn't calculate that.";
      addMessage(errorMsg, 'bot');
      synth.speak(new SpeechSynthesisUtterance(errorMsg));
      return;
    }
  }

  synth.speak(new SpeechSynthesisUtterance(`Searching for ${query}`));

  try {
    const proxy = 'https://api.allorigins.win/get?url=';
    const duckUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(proxy + encodeURIComponent(duckUrl));
    const data = await response.json();
    const html = data.contents;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const snippet = doc.querySelector('.result__snippet');

    let answer = snippet ? snippet.textContent.trim() : "Sorry, I couldn't find a clear answer.";
    addMessage(answer, 'bot');
    synth.speak(new SpeechSynthesisUtterance(answer));
  } catch (e) {
    const fallback = "Sorry, I couldn't fetch the answer.";
    addMessage(fallback, 'bot');
    synth.speak(new SpeechSynthesisUtterance(fallback));
  }
});

function addMessage(text, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', `${sender}-message`);

  const avatar = document.createElement('div');
  avatar.classList.add('message-avatar', `${sender}-avatar`);
  avatar.textContent = sender === 'user' ? 'You' : 'V';

  const content = document.createElement('div');
  content.classList.add('message-content');
  content.textContent = text;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);
  chatMessages.appendChild(messageDiv);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

window.fillPrompt = fillPrompt;
