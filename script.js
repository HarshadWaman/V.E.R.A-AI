const form = document.getElementById('searchForm');
const queryInput = document.getElementById('queryInput');
const chatBox = document.getElementById('chatBox');

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  const query = queryInput.value.trim();
  if (!query) return;

  addMessage(query, 'user');
  queryInput.value = '';

  const synth = window.speechSynthesis;
  const lowerQuery = query.toLowerCase();

  // Time
  if (lowerQuery.includes("time")) {
    const time = new Date().toLocaleTimeString();
    addMessage(`Current time is ${time}`, 'bot');
    synth.speak(new SpeechSynthesisUtterance(`Current time is ${time}`));
    return;
  }

  // Date
  if (lowerQuery.includes("date")) {
    const date = new Date().toLocaleDateString();
    addMessage(`Today's date is ${date}`, 'bot');
    synth.speak(new SpeechSynthesisUtterance(`Today's date is ${date}`));
    return;
  }

  // Simple Math Calculation
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

  // Speak user query before searching
  synth.speak(new SpeechSynthesisUtterance(`Searching for ${query}`));

  // DuckDuckGo quick answer
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
  const bubble = document.createElement('div');
  bubble.classList.add('chat-bubble', sender === 'user' ? 'user-message' : 'bot-message');
  bubble.textContent = text;
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}
