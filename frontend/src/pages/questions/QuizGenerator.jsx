import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveQuiz } from "../../lib/savedQuizService";

export default function QuizGenerator() {
  const location = useLocation();
  const navigate = useNavigate();

  const text = location.state?.text;
  const type = location.state?.type || "mcq";
  const count = location.state?.count;

  const [quiz, setQuiz] = useState(null); // this will be an array OR object depending on type
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const hasGenerated = React.useRef(false);

  const generateQuiz = useCallback(async () => {
    setError(null);

    try {
      const res = await fetch(`http://localhost:8000/generate/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type, num_questions: count }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        const detail = errorBody?.detail || `${res.status} ${res.statusText}`;
        throw new Error(`Request failed: ${detail}`);
      }

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("Failed to parse JSON from backend:", jsonErr);
        throw new Error("Backend did not return valid JSON.");
      }

      console.log("BACKEND RESPONSE:", data);

      const returnedType = data?.type || type;
      const payload = data?.quiz;

      if (!payload || typeof payload !== "object") {
        throw new Error("The AI returned an invalid quiz format. Please try again.");
      }

      const extracted =
        payload?.[returnedType] ??
        payload?.mcq ??
        payload?.tf ??
        payload?.sa ??
        payload?.fb ??
        payload;

      if (!Array.isArray(extracted)) {
        throw new Error("The AI returned an invalid quiz format. Please try again.");
      }
      setQuiz(extracted);
    } catch (err) {
      console.error("Quiz generation error:", err);
      setError(err.message || "Unknown error");
      setQuiz([]);
    }
  }, [text, type, count]);

  useEffect(() => {
    if (!text || hasGenerated.current) return;
    hasGenerated.current = true;
    generateQuiz();
  }, [text, generateQuiz]);

  const handleSaveQuizClick = async () => {
    // Validate quiz exists
    const isEmpty =
      quiz == null ||
      (Array.isArray(quiz) && quiz.length === 0) ||
      (typeof quiz === "object" && !Array.isArray(quiz) && Object.keys(quiz).length === 0);

    if (isEmpty) return;

    const title = prompt("Enter a title for this quiz:");
    if (!title || !title.trim()) return;

    setIsSaving(true);
    try {
      // Save as a consistent JSON shape: { [type]: ... }
      const quizPayload = { [type]: quiz };
      await saveQuiz(title.trim(), quizPayload, type, text);

      const goToSaved = window.confirm("Quiz saved successfully! Go to saved quizzes?");
      if (goToSaved) navigate("/questions/view");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save quiz: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportToWord = async () => {
    if (quiz == null) return;

    setIsExporting(true);
    try {
      // Send consistent payload: { quiz: { [type]: ... } }
      const res = await fetch("http://localhost:8000/generate/export-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz: { [type]: quiz }, type }),
      });

      if (!res.ok) {
        throw new Error(`Export failed: ${res.status} ${res.statusText}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-quiz.docx`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export quiz: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  if (error) return <p className="p-6 text-center text-red-600">Error: {error}</p>;
  if (quiz === null) return <p className="p-6 text-center">Generating quiz…</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Generated Quiz ({type.toUpperCase()})</h1>

        <div className="flex gap-2">
          <button
            onClick={handleSaveQuizClick}
            disabled={isSaving || quiz === null}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isSaving ? "Saving..." : "Save Quiz"}
          </button>

          <button
            onClick={handleExportToWord}
            disabled={isExporting || quiz === null}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isExporting ? "Exporting..." : "Export to Word"}
          </button>
        </div>
      </div>

      {/* Render based on type */}
      <QuizRenderer quiz={quiz} />
    </div>
  );
}

/** Simple renderer. You can expand this per type later. */
function QuizRenderer({ quiz }) {
  return (
    <>
      {quiz.map((q, index) => (
        <div key={index} className="mb-4 border p-4 rounded">
          <p className="font-semibold">{index + 1}. {q.question || q.prompt}</p>

          {Array.isArray(q.options) && (
            <ul className="mt-2 ml-4 list-disc">
              {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
            </ul>
          )}

          {"answer" in q && (
            <p className="mt-2 text-green-600">
              Answer: {Array.isArray(q.answer) ? q.answer.join(", ") : String(q.answer)}
            </p>
          )}

          {Array.isArray(q.key_points) && (
            <div className="mt-2 text-sm">
              <p className="font-medium">Key points:</p>
              <ul className="list-disc ml-6">
                {q.key_points.map((kp, i) => <li key={i}>{kp}</li>)}
              </ul>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
