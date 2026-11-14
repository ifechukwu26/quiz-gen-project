from fastapi import FastAPI, Depends
from pydantic import BaseModel

app = FastAPI()

class QuizData(BaseModel):
    title: str
    questions: list
    # Add other fields your quiz needs

@app.post("/mcq")
def save_quiz(data: QuizData, user_id: str = Depends(get_current_user)):
    return {
        "message": "Quiz saved",
        "user_id": user_id,
        "quiz": data
    }