import { useState, useEffect } from "react";
import { getSavedQuizzes } from "../lib/savedQuizService";
import { useNavigate } from "react-router-dom";

// Helper: pick the first quiz type key and return { type, questions }
function extractQuiz(quizObj) {
  if (!quizObj || typeof quizObj !== "object") return { type: null, questions: [] };
  const type = Object.keys(quizObj)[0] || null;
  const val = quizObj[type];
  return { type, questions: val };
}

export default function SavedQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { loadQuizzes(); }, []);

  const loadQuizzes = async () => {
    try {
      const data = await getSavedQuizzes();
      setQuizzes(data || []);
    } catch (err) {
      console.error("Load error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuiz = (quiz) => setSelectedQuiz(quiz);
  const handleBackToDashboard = () => navigate("/dashboard");
  const handleBackToList = () => setSelectedQuiz(null);

  if (loading) return <p className="p-6 text-center">Loading saved quizzes...</p>;
  if (error) return <p className="p-6 text-center text-red-600">Error: {error}</p>;

  // If viewing a specific quiz
  if (selectedQuiz) {
    const { type, questions } = extractQuiz(selectedQuiz.quiz);
    const createdAt = selectedQuiz.created_at ? new Date(selectedQuiz.created_at) : null;

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{selectedQuiz.title}</h1>
            {type && <p className="text-sm text-blue-600 mt-1">Type: {type.toUpperCase()}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={handleBackToList}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition">
              Back to List
            </button>
            <button onClick={handleBackToDashboard}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition">
              Back to Dashboard
            </button>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">
          Created: {createdAt ? createdAt.toLocaleString() : "Unknown"}
        </p>

        {!questions || (Array.isArray(questions) && questions.length === 0) ? (
          <p className="text-gray-600">No questions in this quiz.</p>
        ) : type === "matching" ? (
          <div className="border p-4 rounded bg-white shadow">
            <p className="font-semibold mb-2">{questions.prompt || "Matching question"}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium mb-1">Left</p>
                <ul className="list-disc ml-6">
                  {(questions.left || []).map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Right</p>
                <ul className="list-disc ml-6">
                  {(questions.right || []).map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </div>
            </div>
            <pre className="bg-gray-50 border rounded p-3 mt-3 text-sm overflow-auto">
              Answer map: {JSON.stringify(questions.answer || {}, null, 2)}
            </pre>
          </div>
        ) : (
          (Array.isArray(questions) ? questions : []).map((q, index) => (
            <div key={index} className="mb-4 border p-4 rounded bg-white shadow">
              <p className="font-semibold">
                {index + 1}. {q.question || q.statement || q.prompt}
              </p>

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

              {q.explanation && (
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Explanation:</strong> {q.explanation}
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
          ))
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Saved Quizzes</h1>
        <button
          onClick={handleBackToDashboard}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Back to Dashboard
        </button>
      </div>
      
      {quizzes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No saved quizzes yet.</p>
          <button
            onClick={handleBackToDashboard}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            Create Your First Quiz
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => {
            const { type, questions } = extractQuiz(quiz.quiz);
            const count = Array.isArray(questions)
              ? questions.length
              : type === "matching" && questions
              ? 1
              : 0;

            return (
              <div key={quiz.id} className="border p-4 rounded shadow hover:shadow-lg transition bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{quiz.title}</h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Created: {quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : "Unknown"}
                    </p>
                    <p className="text-sm mt-2 text-blue-600 font-medium">
                      {count} question{count === 1 ? "" : "s"}{type ? ` (${type.toUpperCase()})` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewQuiz(quiz)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
                  >
                    View Quiz
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
