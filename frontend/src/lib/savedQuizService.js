import { supabase } from "./supabaseClient";

/**
 * Save a quiz to the database
 * @param {string} title - Quiz title
 * @param {Array} quizData - Array of quiz questions
 * @returns {Promise<Object>} - Saved quiz record
 */
export async function saveQuiz(title, quizPayload, quizType, sourceText) {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!userData?.user) throw new Error("Not authenticated");

  const { error } = await supabase.from("quizzes").insert({
    title,
    quiz: quizPayload,
    quiz_type: quizType,
    source_text: sourceText,
    user_id: userData.user.id,
  });

  if (error) throw error;
}

/**
 * Get all saved quizzes for the current user
 * @returns {Promise<Array>} - Array of saved quizzes
 */
export async function getSavedQuizzes() {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get a single saved quiz by ID
 * @param {string} quizId - Quiz ID
 * @returns {Promise<Object>} - Quiz record
 */
export async function getQuizById(quizId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .eq("user_id", user.id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a saved quiz
 * @param {string} quizId - Quiz ID
 * @returns {Promise<void>}
 */
export async function deleteQuiz(quizId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", quizId)
    .eq("user_id", user.id);

  if (error) throw error;
}

/**
 * Update a saved quiz
 * @param {string} quizId - Quiz ID
 * @param {string} title - New title
 * @param {Array} quizData - New quiz data
 * @returns {Promise<Object>} - Updated quiz record
 */
export async function updateQuiz(quizId, title, quizData) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("quizzes")
    .update({
      title: title,
      quiz_data: quizData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", quizId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
