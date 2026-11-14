import { supabase } from "../supabaseClient";

export async function generateMCQ(text) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  const res = await fetch("http://localhost:8000/generate/mcq", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error("MCQ generation failed");
  }

  return res.json();
}
