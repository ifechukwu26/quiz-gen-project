from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from genques.mcqgenerate import generate_mcq
from genques.export_word import export_quiz_to_word
from genques.truefalsegenerate import generate_true_false
from genques.shortanswergenerate import generate_short_answer
from genques.fillblankgenerate import generate_fill_blank

router = APIRouter()

class GenerateRequest(BaseModel):
    text: str
    type: str = "mcq"  # Options: "mcq", "true_false", "short_answer", "fill_blank"
    num_questions: int = 5

class ExportRequest(BaseModel):
    quiz: dict

@router.post("/export-word")
async def export_word_route(req: ExportRequest):
    """Export quiz to Word document"""
    word_file = export_quiz_to_word(req.quiz)
    
    return StreamingResponse(
        word_file,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": "attachment; filename=quiz.docx"
        }
    )


@router.post("/{type}")
async def generate_quiz_route(req: GenerateRequest):
    """Generate quiz based on question type"""

    if req.type == "mcq":
        quiz_result = await generate_mcq(req.text, req.type, req.num_questions)
    elif req.type == "tf":
        quiz_result = await generate_true_false(req.text, req.type, req.num_questions)
    elif req.type == "sa":
        quiz_result = await generate_short_answer(req.text, req.type, req.num_questions)
    elif req.type == "fb":
        quiz_result = await generate_fill_blank(req.text, req.type, req.num_questions)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported question type: {req.type}")

    return quiz_result
