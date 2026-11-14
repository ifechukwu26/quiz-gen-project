from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
from io import BytesIO


def export_quiz_to_word(quiz_data):
    """Export a generated quiz payload to a Word document."""
    doc = Document()

    quiz_type, questions = next(iter(quiz_data.items()), ("quiz", []))
    titles = {
        "mcq": "Multiple Choice Questions",
        "tf": "True or False Questions",
        "sa": "Short Answer Questions",
        "fb": "Fill in the Blank Questions",
        "matching": "Matching Questions",
    }
    title = doc.add_heading(f"Quiz - {titles.get(quiz_type, quiz_type.title())}", level=1)
    title.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER

    if isinstance(questions, dict):
        questions = [questions]
    if not isinstance(questions, list):
        questions = []

    if not questions:
        doc.add_paragraph('No questions available.')

    for idx, question in enumerate(questions, 1):
        if not isinstance(question, dict):
            question = {"question": str(question)}

        q_paragraph = doc.add_paragraph()
        q_run = q_paragraph.add_run(
            f"Question {idx}: {question.get('question', question.get('prompt', ''))}"
        )
        q_run.bold = True
        q_run.font.size = Pt(12)

        options = question.get("options", [])
        for option in options:
            option_paragraph = doc.add_paragraph(option, style='List Bullet')
            option_paragraph.paragraph_format.left_indent = Pt(20)

        for key, value in question.items():
            if key in {"question", "prompt", "options"} or value in (None, ""):
                continue
            label = "Correct Answer" if key == "answer" else key.replace("_", " ").title()
            if isinstance(value, list):
                value = ", ".join(str(item) for item in value)
            answer_paragraph = doc.add_paragraph()
            answer_run = answer_paragraph.add_run(f"{label}: {value}")
            if key == "answer":
                answer_run.font.color.rgb = RGBColor(0, 128, 0)
                answer_run.bold = True

        doc.add_paragraph()

    file_stream = BytesIO()
    doc.save(file_stream)
    file_stream.seek(0)

    return file_stream
