from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import speech_recognition as sr
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)

# === Database Setup ===
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///crop_analysis.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class Analysis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    disease = db.Column(db.String(100))
    confidence = db.Column(db.Float)
    solution = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


with app.app_context():
    db.create_all()


# === ROUTE: Analyze Crop ===
@app.route('/analyze', methods=['POST'])
def analyze_crop():
    print("✅ /analyze route triggered successfully!")
    print("Files received:", request.files.keys())

    diseases = [
        {"name": "Tomato Leaf Blight", "confidence": 80, "solution": "Spray Mancozeb 75% WP and avoid overwatering."},
        {"name": "Powdery Mildew", "confidence": 88, "solution": "Use sulfur-based fungicide and prune infected leaves."},
        {"name": "Mildly Leaf", "confidence": 92, "solution": "No action needed — your crop is healthy!"},
        {"name": "Root Rot", "confidence": 80, "solution": "Apply copper fungicide and improve airflow."}
    ]

    import random
    result = random.choice(diseases)

    return jsonify(result)



# === ROUTE: Speech-to-Text ===
@app.route("/speech", methods=["POST"])
def speech_to_text():
    # 🔹 TEMP FIX: Skip real recognition and return dummy text
    import random

    sample_texts = [
        "The leaves are turning yellow, possible nitrogen deficiency.",
        "Brown spots observed, maybe fungal infection.",
        "Healthy crop, no issues detected.",
        "Pests visible on leaves, spraying recommended."
    ]

    text = random.choice(sample_texts)
    return jsonify({"text": text})



# === ROUTE: Get All Analysis History ===
@app.route("/history", methods=["GET"])
def history():
    records = Analysis.query.all()
    data = []
    for r in records:
        data.append({
            "id": r.id,
            "disease": r.disease,
            "confidence": r.confidence,
            "solution": r.solution,
            "timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        })
    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=True)
