from services import get_services


services = get_services()

async def generate_true_false(text: str, question_type: str = "true_false", num_questions: int = 5):
    prompt = f"""
You are a quiz generator. Create ONLY true/false questions 
from the text below.

Text:
{text}

Generate exactly {num_questions} True/False questions with:
- question
- correct answer (True or False)
- brief explanation

Output ONLY valid JSON, in this exact format:

{{
  "true_false": [
    {{
      "question": "...",
      "answer": true,
      "explanation": "..."
    }}
  ]
}}
"""

    raw = services["call_ai"](prompt)
    cleaned = services["extract_json"](raw)
    
    print(f"\n=== True/False Generation Debug ===")
    print(f"Raw AI response (first 500 chars): {raw[:500]}")
    print(f"Cleaned JSON: {cleaned}")
    print(f"Type of cleaned: {type(cleaned)}")
    
    if isinstance(cleaned, dict) and "error" in cleaned:
        print(f"ERROR: JSON extraction failed")
        return {"quiz": []}
    
    if isinstance(cleaned, dict) and "true_false" in cleaned:
        tf_array = cleaned["true_false"]
        print(f"Found 'true_false' key, returning array of {len(tf_array) if isinstance(tf_array, list) else 0} items")
        return {"quiz": tf_array}
    
    if isinstance(cleaned, list):
        print(f"Cleaned is already an array of {len(cleaned)} items")
        return {"quiz": cleaned}
    
    print(f"WARNING: Unexpected format, returning empty array")
    return {"quiz": []}