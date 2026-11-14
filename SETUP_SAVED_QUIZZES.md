# Quiz Save Feature - Setup Instructions

## Setup Supabase Database

1. **Go to your Supabase project** at https://supabase.com
2. **Navigate to SQL Editor**
3. **Run the SQL script** from `supabase-schema.sql` in the root folder

This will create:
- `saved_quizzes` table to store quiz data
- Row Level Security (RLS) policies to ensure users can only access their own quizzes
- Indexes for better performance

## Configure Environment Variables

Make sure you have these environment variables in your frontend `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

## Features

### Save Quiz
- When viewing a generated quiz, click the "Save Quiz" button
- Enter a title for your quiz
- Quiz is saved to your Supabase database

### View Saved Quizzes
- Click on your user menu (top right)
- Select "Saved Quizzes"
- See all your saved quizzes with titles and creation dates

### Delete Quiz
- In the Saved Quizzes page, click "Delete" on any quiz
- Confirm the deletion

## How It Works

1. **Authentication**: Users must be logged in to save/view quizzes
2. **Row Level Security**: Each user can only see their own saved quizzes
3. **Data Storage**: Quiz data is stored as JSON in the `quiz_data` column
4. **User Association**: Each quiz is linked to a user via `user_id`

## Testing

1. Log in to your account
2. Generate a quiz from text
3. Click "Save Quiz" and enter a title
4. Go to user menu → "Saved Quizzes"
5. You should see your saved quiz listed
6. Click "View" to see the quiz again
7. Click "Delete" to remove it

## Troubleshooting

### "User not authenticated" error
- Make sure you're logged in
- Check that Supabase auth is configured properly

### "Permission denied" error
- Verify the SQL script ran successfully
- Check that RLS policies were created

### Quizzes not showing up
- Check browser console for errors
- Verify your Supabase URL and anon key are correct
- Make sure the table was created properly
