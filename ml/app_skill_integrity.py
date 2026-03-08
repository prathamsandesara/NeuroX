from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os

# -------------------------------------------------
# Initialize FastAPI app
# -------------------------------------------------
app = FastAPI(
    title="Skill Integrity Evaluation API",
    description="Detects fake or inconsistent job applications",
    version="1.0"
)

# -------------------------------------------------
# Load trained ML model (Safe Path Handling)
# -------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "skill_integrity_model.pkl")

model = None

try:
    print("Loading model from:", MODEL_PATH)
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    print("Model loading failed:", str(e))


# -------------------------------------------------
# Input Schema
# -------------------------------------------------
class IntegrityInput(BaseModel):
    resume_skill_coverage: float
    assessment_skill_score: float
    mcq_guess_rate: float
    avg_time_per_question: float
    time_variance: float
    coding_similarity_score: float


# -------------------------------------------------
# Health Check Endpoint
# -------------------------------------------------
@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "Skill Integrity Evaluation",
    }

@app.get("/")
def root():
    return {"message": "Skill Integrity API is running"}


# -------------------------------------------------
# Skill Integrity Evaluation Endpoint
# -------------------------------------------------
@app.post("/evaluate-integrity")
def evaluate_integrity(payload: IntegrityInput):

    if model is None:
        raise HTTPException(
            status_code=500,
            detail="Model not loaded properly."
        )

    try:
        # Convert payload to DataFrame
        df = pd.DataFrame([payload.model_dump()])

        # Model prediction
        prediction = int(model.predict(df)[0])
        probability = float(model.predict_proba(df)[0][1])  # Probability of fake

        # Risk level logic
        if probability < 0.55:
            risk_level = "LOW"
        elif probability < 0.75:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"

        # Integrity score (inverse of fake probability)
        skill_integrity_score = round(1 - probability, 2)

        return {
            "skill_integrity_score": skill_integrity_score,
            "risk_level": risk_level,
            "flagged": bool(prediction)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction error: {str(e)}"
        )


# -------------------------------------------------
# For Local Development Only
# -------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app_skill_integrity:app",
        host="0.0.0.0",
        port=5001
    )
