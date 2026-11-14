from services import get_services


services = get_services()

async def generate_fill_blank(text: str, question_type: str = "fill_blank", num_questions: int = 5):
    prompt = f"""
You are a quiz generator. Create ONLY fill-in-the-blank questions 
from the text below.

Text:
{text}

Generate exactly {num_questions} fill-in-the-blank questions with:
- question with _____ for the blank
- correct answer
- optional hint

Output ONLY valid JSON, in this exact format:

{{
  "fill_blank": [
    {{
      "question": "The capital of France is _____.",
      "answer": "Paris",
      "hint": "It's known as the City of Light"
    }}
  ]
}}
"""

    raw = services["call_ai"](prompt)
    cleaned = services["extract_json"](raw)
    
    print(f"\n=== Fill in the Blank Generation Debug ===")
    print(f"Raw AI response (first 500 chars): {raw[:500]}")
    print(f"Cleaned JSON: {cleaned}")
    print(f"Type of cleaned: {type(cleaned)}")
    
    if isinstance(cleaned, dict) and "error" in cleaned:
        print(f"ERROR: JSON extraction failed")
        return {"quiz": []}
    
    if isinstance(cleaned, dict) and "fill_blank" in cleaned:
        fb_array = cleaned["fill_blank"]
        print(f"Found 'fill_blank' key, returning array of {len(fb_array) if isinstance(fb_array, list) else 0} items")
        return {"quiz": fb_array}
    
    if isinstance(cleaned, list):
        print(f"Cleaned is already an array of {len(cleaned)} items")
        return {"quiz": cleaned}
    
    print(f"WARNING: Unexpected format, returning empty array")
    return {"quiz": []}