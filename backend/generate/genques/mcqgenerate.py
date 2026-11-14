from services import get_services


services = get_services()

async def generate_mcq(text: str, question_type: str = "mcq", num_questions: int = 5):
    prompt = f"""
You are a quiz generator. Create ONLY multiple-choice questions 
from the text below.

Text:
{text}

Generate exactly {num_questions} MCQs with:
- question
- 4 options (A, B, C, D)
- correct answer letter

Output ONLY valid JSON, in this exact format:

{{
  "mcq": [
    {{
      "question": "...",
      "options": ["A...", "B...", "C...", "D..."],
      "answer": "A"
    }}
  ]
}}
"""

    raw = services["call_ai"](prompt)
    cleaned = services["extract_json"](raw)
    
    print(f"\n=== MCQ Generation Debug ===")
    print(f"Raw AI response (first 500 chars): {raw[:500]}")
    print(f"Cleaned JSON: {cleaned}")
    print(f"Type of cleaned: {type(cleaned)}")
    
    # If error in extraction, return empty array
    if isinstance(cleaned, dict) and "error" in cleaned:
        print(f"ERROR: JSON extraction failed")
        return {"quiz": []}
    
    # Extract the mcq array from the response
    if isinstance(cleaned, dict) and "mcq" in cleaned:
        mcq_array = cleaned["mcq"]
        print(f"Found 'mcq' key, returning array of {len(mcq_array) if isinstance(mcq_array, list) else 0} items")
        return {"quiz": mcq_array}
    
    # If cleaned itself is an array, return it directly
    if isinstance(cleaned, list):
        print(f"Cleaned is already an array of {len(cleaned)} items")
        return {"quiz": cleaned}
    
    print(f"WARNING: Unexpected format, returning empty array")
    return {"quiz": []}
