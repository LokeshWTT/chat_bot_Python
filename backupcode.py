from flask import Flask, render_template, jsonify, request
import requests

app = Flask(__name__)

# API endpoint URLs
faq_api_url = "http://10.15.5.191:8000/api/method/faq_chatgpt.most_asked_question.call_Faq"
response_api_url = "http://10.15.5.191:8000/api/method/faq_chatgpt.faq_api.call_Faq"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_faqs')
def get_faqs():
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
    question = request.args.get('question')
    try:
        response = requests.get(response_api_url)
        response.raise_for_status()
        faq_data = response.json().get('data', [])

        # Tokenize user's question
        question_tokens = tokenize(question.lower())

        # Collect all matches
        all_matches = []

        for item in faq_data:
            key_tokens = tokenize(item['q1'].lower())  # Adjust according to your API response structure
            similarity = cosine_similarity(question_tokens, key_tokens)
            if similarity >= 0.5:  # Adjust similarity threshold as needed
                all_matches.append({'question': item['q1'], 'answer': item['a1'], 'similarity': similarity})

        # Sort matches by similarity in descending order
        all_matches.sort(key=lambda x: x['similarity'], reverse=True)

        if len(all_matches) == 1:
            # Return the best match's answer if only one match
            best_match = all_matches[0]
            return jsonify([best_match])
        elif len(all_matches) > 1:
            # Return top N suggestions if more than one match
            top_suggestions = [{'question': match['question'], 'answer': match['answer']} for match in all_matches[:5]]
            return jsonify(top_suggestions)
        else:
            return jsonify([])  # Return empty list if no matches

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from API: {e}")
        return jsonify([])  # Return empty list if there's an error

def tokenize(text):
    return text.split()  # Basic tokenization for demonstration

def cosine_similarity(tokens1, tokens2):
    token_set1 = set(tokens1)
    token_set2 = set(tokens2)
    intersection = token_set1 & token_set2
    similarity = len(intersection) / (len(token_set1) * len(token_set2)) ** 0.5
    return similarity

if __name__ == '__main__':
    app.run(debug=True)
