# BetterLearn Quiz Generator

BetterLearn is a React web app for uploading PDF, DOCX, and PPTX files, extracting their text, and generating quizzes. The app uses Supabase for sign-in and saved quizzes, a FastAPI service for text extraction, and another FastAPI service for quiz generation.

## Requirements

- Node.js and npm
- Python 3.10 or later
- A Supabase project
- Network access to the configured quiz-generation model endpoint (see [Quiz generation](#quiz-generation))

## Configure Supabase

1. In the Supabase dashboard, copy the project URL and anon/public key from **Project Settings → API**.
2. Create `frontend/.env.local` with:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

   Replace both example values with your project's values. Do not put a Supabase service-role key in the frontend.
3. To enable saving and viewing quizzes, open the Supabase SQL Editor and run [`supabase-schema.sql`](./supabase-schema.sql). See [`SETUP_SAVED_QUIZZES.md`](./SETUP_SAVED_QUIZZES.md) for details.

## Install dependencies

Run these commands from the repository root in PowerShell:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
cd ..\frontend
npm install
```

If PowerShell prevents virtual-environment activation, allow it for the current terminal only, then activate again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## Run the whole app

Start each service in its own terminal. Keep all three terminals running while using the app.

### 1. Quiz-generation API — port 8000

From the repository root:

```powershell
cd backend\generate
..\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --port 8000
```

API docs: <http://localhost:8000/docs>

### 2. Text-extraction API — port 8001

In a second terminal, from the repository root:

```powershell
cd backend\extract_text
..\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --port 8001
```

API docs: <http://localhost:8001/docs>

### 3. Frontend — port 5173

In a third terminal, from the repository root:

```powershell
cd frontend
npm run dev
```

Open the URL Vite prints, usually <http://localhost:5173>. Sign in or create an account using the configured Supabase project.

## Quiz generation

The generation API currently sends prompts to an Ollama-compatible endpoint configured in `backend/generate/services.py` and requests the `gpt-oss:20b` model. That endpoint must be reachable and serving the model for quiz generation to work. If your environment uses a different model server, update that configuration.

## Optional: local authentication API

The separate API in `backend/app/main.py` provides local `/register` and `/login` routes and a Supabase-protected `/me` route. The current frontend uses Supabase directly, so this API is not required for the normal app flow. To run it for development, open another terminal from the repository root:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --port 8002
```

Its API docs are at <http://localhost:8002/docs>. The `/me` route also requires `SUPABASE_URL` to be set in that terminal's environment.

## Useful frontend commands

Run these from `frontend`:

```powershell
npm run lint
npm run build
```

## Troubleshooting

- **Supabase configuration warning or sign-in errors:** confirm `frontend/.env.local` contains the correct project URL and anon key, then restart Vite after changing it.
- **File uploads fail:** check that the text-extraction API is running on port 8001.
- **Quiz generation fails:** check that the generation API is running on port 8000 and that its configured model endpoint is reachable.
- **Saved quizzes do not appear:** confirm [`supabase-schema.sql`](./supabase-schema.sql) was run in the correct Supabase project.
