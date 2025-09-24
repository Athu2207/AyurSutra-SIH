# main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
from transformers import pipeline

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load NLP model
analyzer = pipeline("text2text-generation", model="google/flan-t5-small")

# Ayurvedic knowledge base (simplified for demo)
ayurvedic_knowledge = {
    "vata": {
        "imbalance": "Vata Dosha imbalance",
        "recommendations": "Warm, moist, and grounding foods; regular routine; gentle exercise; oil massage; avoid cold, dry foods",
        "herbs": ["Ashwagandha", "Bala", "Shatavari", "Ginger", "Cinnamon"],
        "lifestyle": ["Maintain regular sleep schedule", "Practice gentle yoga", "Meditate daily", "Stay warm in cold weather"]
    },
    "pitta": {
        "imbalance": "Pitta Dosha imbalance",
        "recommendations": "Cool, refreshing foods; avoid spicy, oily foods; moderate exercise; cooling pranayama",
        "herbs": ["Shatavari", "Amla", "Brahmi", "Coriander", "Fennel"],
        "lifestyle": ["Avoid excessive heat", "Practice cooling breathing exercises", "Swim or spend time near water", "Avoid excessive competition"]
    },
    "kapha": {
        "imbalance": "Kapha Dosha imbalance",
        "recommendations": "Light, warm, and dry foods; vigorous exercise; stimulating herbs; avoid heavy, oily foods",
        "herbs": ["Turmeric", "Ginger", "Black Pepper", "Trikatu", "Pippali"],
        "lifestyle": ["Wake up early", "Engage in regular exercise", "Seek variety and new experiences", "Avoid daytime sleep"]
    }
}

def detect_dosha_from_text(text):
    text = text.lower()
    vata_keywords = ["vata", "dry", "cold", "light", "mobile", "irregular", "anxiety", "constipation"]
    pitta_keywords = ["pitta", "hot", "sharp", "intense", "inflammatory", "acidic", "anger", "irritation"]
    kapha_keywords = ["kapha", "heavy", "slow", "cold", "damp", "oily", "congestion", "lethargy"]
    
    vata_count = sum(1 for word in vata_keywords if word in text)
    pitta_count = sum(1 for word in pitta_keywords if word in text)
    kapha_count = sum(1 for word in kapha_keywords if word in text)
    
    if max(vata_count, pitta_count, kapha_count) == 0:
        return "vata"  # Default if no keywords found
    
    if vata_count > pitta_count and vata_count > kapha_count:
        return "vata"
    elif pitta_count > vata_count and pitta_count > kapha_count:
        return "pitta"
    else:
        return "kapha"

@app.get("/")
def root():
    return {"message": "Ayurvedic Report Analyzer Backend is running!"}

@app.post("/analyze_ayurveda_report/")
async def analyze_ayurveda_report(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files allowed"}

    # Extract text from PDF
    pdf_reader = PyPDF2.PdfReader(file.file)
    text = " ".join([page.extract_text() for page in pdf_reader.pages])
    
    # Detect dominant dosha
    dominant_dosha = detect_dosha_from_text(text)
    dosha_info = ayurvedic_knowledge[dominant_dosha]
    
    # AI analysis with Ayurvedic context
    condition = analyzer(f"Based on this health report, what Ayurvedic condition might be indicated? {text}", max_length=200)[0]['generated_text']
    
    # Ayurvedic practitioner recommendation
    practitioners = [
        {"name": "Dr. S. Sharma", "specialty": "Ayurvedic Physician", "location": "Kerala"},
        {"name": "Vaidya R. Patel", "specialty": "Panchakarma Specialist", "location": "Mumbai"},
        {"name": "Dr. A. Iyer", "specialty": "Ayurvedic Nutrition", "location": "Chennai"}
    ]

    return {
        "dosha_imbalance": dosha_info["imbalance"],
        "condition": condition,
        "recommendations": dosha_info["recommendations"],
        "herbal_remedies": ", ".join(dosha_info["herbs"]),
        "lifestyle_changes": dosha_info["lifestyle"],
        "recommended_practitioners": practitioners
    }