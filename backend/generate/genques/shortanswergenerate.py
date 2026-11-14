from services import get_services


services = get_services()

async def generate_short_answer(text: str, question_type: str = "short_answer", num_questions: int = 5):
    prompt = f"""
You are a quiz generator. Create ONLY short answer questions 
from the text below.

Text:
{text}

Generate exactly {num_questions} short answer questions with:
- question
- expected answer (1-2 sentences)
- key points that should be mentioned

Output ONLY valid JSON, in this exact format:

{{
  "short_answer": [
    {{
      "question": "...",
      "answer": "...",
      "key_points": ["point 1", "point 2", "point 3"]
    }}
  ]
}}
"""

    raw = services["call_ai"](prompt)
    cleaned = services["extract_json"](raw)
    
    print(f"\n=== Short Answer Generation Debug ===")
    print(f"Raw AI response (first 500 chars): {raw[:500]}")
    print(f"Cleaned JSON: {cleaned}")
    print(f"Type of cleaned: {type(cleaned)}")
    
    if isinstance(cleaned, dict) and "error" in cleaned:
        print(f"ERROR: JSON extraction failed")
        return {"quiz": []}
    
    if isinstance(cleaned, dict) and "short_answer" in cleaned:
        sa_array = cleaned["short_answer"]
        print(f"Found 'short_answer' key, returning array of {len(sa_array) if isinstance(sa_array, list) else 0} items")
        return {"quiz": sa_array}
    
    if isinstance(cleaned, list):
        print(f"Cleaned is already an array of {len(cleaned)} items")
        return {"quiz": cleaned}
    
    print(f"WARNING: Unexpected format, returning empty array")
    return {"quiz": []}