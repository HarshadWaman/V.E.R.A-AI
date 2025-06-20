from flask import Flask, render_template, request
import pyttsx3
import webbrowser
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

def search_and_speak(query):
    # Initialize TTS
    voice = pyttsx3.init()
    voice.setProperty('rate', 150)
    for v in voice.getProperty('voices'):
        if 'female' in v.name.lower():
            voice.setProperty('voice', v.id)
            break

    # Set Firefox path (modify if needed)
    firefox_path = "C:/Program Files/Mozilla Firefox/firefox.exe"
    try:
        webbrowser.register('firefox', None, webbrowser.BackgroundBrowser(firefox_path))
        url = f"https://www.google.com/search?q={query}"
        webbrowser.get('firefox').open(url)
        voice.say(f"Searching for {query} in Firefox.")
        voice.runAndWait()
    except Exception as e:
        print("Browser error:", e)
        voice.say("Sorry, I couldn't open Firefox.")
        voice.runAndWait()

    # DuckDuckGo fallback for quick answer
    try:
        duck_url = f"https://duckduckgo.com/html/?q={query}"
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(duck_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')

        snippet = soup.find('a', {'class': 'result__snippet'})
        if snippet:
            answer = snippet.text.strip()
            voice.say(answer)
            voice.runAndWait()
            return answer
        else:
            msg = "Sorry, I couldn't find a clear answer."
            voice.say(msg)
            voice.runAndWait()
            return msg
    except Exception as e:
        print("Error while fetching answer:", e)
        msg = "Sorry, I couldn't fetch the answer."
        voice.say(msg)
        voice.runAndWait()
        return msg

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query = request.form['query']
    answer = search_and_speak(query)
    return render_template('index.html', question=query, answer=answer)

if __name__ == '__main__':
    app.run(debug=True)
