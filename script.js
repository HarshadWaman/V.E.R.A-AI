const form = document.getElementById('searchForm');
const queryInput = document.getElementById('queryInput');
const responseBox = document.getElementById('responseBox');
const userQuestion = document.getElementById('userQuestion');
const answerText = document.getElementById('answerText');

form.addEventListener('submit', async function(event) {
  event.preventDefault();
  const query = queryInput.value.trim();
  if (!query) return;

  // Open Google Search in new tab
  window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');

  // Speak the query
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(`Searching for ${query} in your browser`);
  utter.rate = 1;
  synth.speak(utter);

  // Show question
  userQuestion.textContent = query;

  // Try to fetch answer from DuckDuckGo
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
    answerText.textContent = answer;

    const speakAnswer = new SpeechSynthesisUtterance(answer);
    synth.speak(speakAnswer);
  } catch (e) {
    const fallback = "Sorry, I couldn't fetch the answer.";
    answerText.textContent = fallback;
    synth.speak(new SpeechSynthesisUtterance(fallback));
  }

  responseBox.style.display = 'block';
});
