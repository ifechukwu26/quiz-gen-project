import json
import re
import os
from pathlib import Path

import requests
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

MODEL_URL = (
    "https://generativelanguage.googleapis.com/v1beta/"
    "models/gemini-3.6-flash:generateContent"
)


def call_ai(prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY is missing. Add it to backend/.env and restart the API.",
        )

    try:
        response = requests.post(
            MODEL_URL,
            headers={"x-goog-api-key": api_key},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"maxOutputTokens": 2048},
            },
            timeout=90,
        )
        response.raise_for_status()
    except requests.HTTPError as exc:
        status_code = exc.response.status_code if exc.response is not None else 502
        try:
            provider_error = exc.response.json().get("error", {}).get("message")
        except (AttributeError, ValueError):
            provider_error = None
        detail = f"Gemini API returned HTTP {status_code}"
        if provider_error:
            detail += f": {provider_error}"
        raise HTTPException(
            status_code=502,
            detail=detail,
        ) from exc
    except requests.Timeout as exc:
        raise HTTPException(
            status_code=504,
            detail="Gemini API request timed out. Try again with shorter source text.",
        ) from exc
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to the Gemini API. Check the backend's internet connection.",
        ) from exc

    return response.json()["candidates"][0]["content"]["parts"][0]["text"]


def extract_json(raw: str):
    match = re.search(r"\{[\s\S]*\}", raw)
    if not match:
        return {"error": "JSON not found", "raw": raw}

    try:
        return json.loads(match.group(0))
    except Exception as e:
        return {
            "error": "Invalid JSON",
            "details": str(e),
            "raw_json": match.group(0),
        }


def get_services():
    return {
        "call_ai": call_ai,
        "extract_json": extract_json,
    }
