import os
import secrets
import requests
from flask import Flask, render_template, jsonify, request, redirect, url_for, session, flash

app = Flask(__name__)
app.secret_key = secrets.token_hex(24)

# API endpoint URLs
faq_api_url = "http://10.15.5.191:5454/api/method/faq_chatgpt.most_asked_question.call_Faq"
response_api_url = "http://10.15.5.191:5454/api/method/faq_chatgpt.faq_api.call_Faq"
auth_api_url = "http://10.15.5.191:5454/api/method/faq_chatgpt.user_authentication.flutter_login"

@app.route('/')
def index():
    if 'logged_in' in session:
        return render_template('index.html')
    else:
        return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Construct the URL with query parameters, ensuring they are URL-encoded
        auth_url = f"{auth_api_url}?username={requests.utils.quote(username)}&password={requests.utils.quote(password)}"

        try:
            # Make the GET request to the API
            response = requests.get(auth_url)
            response.raise_for_status()
            data = response.json()

            # Debugging: Print the response for debugging
            print(f"API Response: {data}")

            # Check if authentication was successful
            if 'token' in data.get('message', ''):
                session['logged_in'] = True
                return redirect(url_for('index'))
            else:
                flash('Invalid credentials, please try again.')
        except requests.exceptions.RequestException as e:
            print(f"Error during authentication: {e}")
            flash('An error occurred. Please try again later.')

        return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('login'))

@app.route('/get_faqs')
def get_faqs():
    if 'logged_in' not in session:
        return redirect(url_for('login'))

    try:
        response = requests.get(faq_api_url)
        response.raise_for_status()
        faq_data = response.json().get('data', [])
        return jsonify(faq_data)
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from API: {e}")
        return jsonify([])

@app.route('/get_response', methods=['GET'])
def get_response():
    if 'logged_in' not in session:
        return redirect(url_for('login'))

    question = request.args.get('question')
    try:
        response = requests.get(response_api_url)
        response.raise_for_status()
        faq_data = response.json().get('data', [])

        question_tokens = tokenize(question.lower())
        all_matches = []

        for item in faq_data:
            key_tokens = tokenize(item['q1'].lower())
            similarity = cosine_similarity(question_tokens, key_tokens)
            if similarity >= 0.5:
                all_matches.append({'question': item['q1'], 'answer': item['a1'], 'similarity': similarity})

        all_matches.sort(key=lambda x: x['similarity'], reverse=True)

        if len(all_matches) == 1:
            best_match = all_matches[0]
            return jsonify([best_match])
        elif len(all_matches) > 1:
            top_suggestions = [{'question': match['question'], 'answer': match['answer']} for match in all_matches[:5]]
            return jsonify(top_suggestions)
        else:
            return jsonify([])

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from API: {e}")
        return jsonify([])

def tokenize(text):
    return text.split()

def cosine_similarity(tokens1, tokens2):
    token_set1 = set(tokens1)
    token_set2 = set(tokens2)
    intersection = token_set1 & token_set2
    similarity = len(intersection) / (len(token_set1) * len(token_set2)) ** 0.5
    return similarity

if __name__ == '__main__':
    app.run(debug=True, port=5001)

