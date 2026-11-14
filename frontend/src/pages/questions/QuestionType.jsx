import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const QUESTION_TYPES = [
  { value: "mcq", label: "Multiple Choice (Single Answer)" },
  { value: "tf", label: "True / False" },
  { value: "sa", label: "Short Answer" },
  { value: "fb", label: "Fill in the Blanks" },
];

export default function ChooseQuestionType() {
  const location = useLocation();
  const navigate = useNavigate();

  // Coming from upload page:
  const extractedText = location.state?.text || "";

  const [type, setType] = useState("mcq");
  const [count, setCount] = useState(5);

  const preview = useMemo(() => {
    if (!extractedText) return "";
    return extractedText.length > 800 ? extractedText.slice(0, 800) + "..." : extractedText;
  }, [extractedText]);

  const handleGenerate = () => {
    navigate("/generate", {
      state: { text: extractedText, type, count },
    });
  };

  if (!extractedText) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p className="text-red-600">
          No extracted text found. Go back to upload and extract text first.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Extracted text preview</h1>
      <div className="bg-white border rounded p-4 shadow-sm mb-6">
        <div className="text-sm whitespace-pre-wrap text-gray-700 max-h-64 overflow-auto">
          {preview}
        </div>
      </div>

      <div className="bg-white border rounded p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-2">Question type</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">Number of questions</label>
            <input
              type="number"
              min={5}
              max={50}
              className="w-full border rounded px-3 py-2"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
            >
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
