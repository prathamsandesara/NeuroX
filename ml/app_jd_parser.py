from flask import Flask, request, jsonify
import joblib
import os

app = Flask(__name__)

# -------------------------------------------------
# Load ML Model (PATH SAFE)
# -------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "jd_parser.pkl")

model_data = joblib.load(MODEL_PATH)

pipeline = model_data["model"]
mlb = model_data["skill_binarizer"]

# -------------------------------------------------
# Utility: Final Difficulty from Experience (LOCKED)
# -------------------------------------------------
def get_final_difficulty(exp_min: int, exp_max: int) -> str:
    """
    Final authority for difficulty based on industry-standard experience bands.
    """
    if exp_max <= 1:
        return "JUNIOR"
    elif exp_min >= 2 and exp_max <= 4:
        return "INTERMEDIATE"
    else:
        return "SENIOR"


# -------------------------------------------------
# Root Route (IMPORTANT FOR RENDER)
# -------------------------------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "OK",
        "service": "NeuroX JD Parser API",
        "message": "Service is running successfully"
    }), 200


# -------------------------------------------------
# Health Check
# -------------------------------------------------
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "UP",
        "service": "Job Description Intelligence"
    }), 200


# -------------------------------------------------
# JD Parsing Endpoint (LOCKED CONTRACT)
# -------------------------------------------------
@app.route("/parse-jd", methods=["POST"])
def parse_jd():
    data = request.get_json()

    # ----- Input Validation -----
    required_fields = [
        "jd_text",
        "job_title",
        "experience_min",
        "experience_max",
        "domain"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "error": f"Missing required field: {field}"
            }), 400

    jd_text = data["jd_text"]

    # ----- ML Prediction (SKILLS ONLY) -----
    prediction = pipeline.predict([jd_text])
    predicted_skills = mlb.inverse_transform(prediction[:, :-1])[0]

    # ----- Final Difficulty (RULE-BASED) -----
    final_difficulty = get_final_difficulty(
        data["experience_min"],
        data["experience_max"]
    )

    # ----- Skill Weight Normalization -----
    skills_output = []
    if predicted_skills:
        weight = round(1 / len(predicted_skills), 3)
        for skill in predicted_skills:
            skills_output.append({
                "skill_id": skill,
                "skill_name": skill.replace("_", " ").title(),
                "weight": weight,
                "category": "technical"
            })

    # ----- Assessment Distribution (LOCKED) -----
    assessment_distribution = {
        "mcq": 30,
        "subjective": 30,
        "coding": 40
    }

    # ----- Final Response (CLEAN) -----
    response = {
        "normalized_role": data["job_title"],
        "difficulty_level": final_difficulty,
        "skills": skills_output,
        "assessment_distribution": assessment_distribution
    }

    return jsonify(response), 200


# -------------------------------------------------
# Run Server (RENDER SAFE)
# -------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5005))
    app.run(host="0.0.0.0", port=port)
