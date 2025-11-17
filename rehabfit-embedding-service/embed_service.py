# Save as embed_service.py
import os
from sentence_transformers import SentenceTransformer
from flask import Flask, request, jsonify

app = Flask(__name__)
model = SentenceTransformer('all-MiniLM-L6-v2')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

@app.route('/embed', methods=['POST'])
def embed():
    data = request.json
    text = data['text']
    embedding = model.encode(text).tolist()
    return jsonify({'embedding': embedding})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5005))
    app.run(host="0.0.0.0", port=port)