import requests
from jose import jwt
from fastapi import Header, HTTPException

SUPABASE_PROJECT_URL = "https://hocyptmjkpcdiokdwslz.supabase.co"
JWKS_URL = f"{SUPABASE_PROJECT_URL}/auth/v1/.well-known/jwks.json"
ALGORITHMS = ["RS256"]

# Cache JWKS keys (performance)
jwks = requests.get(JWKS_URL).json()


def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")

    token = authorization.replace("Bearer ", "")

    try:
        # Decode & verify using public keys
        payload = jwt.decode(
            token,
            jwks,
            algorithms=ALGORITHMS,
            audience="authenticated",
            options={"verify_exp": True},
        )
        return payload["sub"]  # Supabase user_id

    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
