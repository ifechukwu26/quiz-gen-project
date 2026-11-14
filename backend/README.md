# BetterLearn Backend

The backend contains independent FastAPI services for quiz generation and document text extraction, plus an optional local authentication API. The frontend expects the first two services to run on ports 8000 and 8001.

## Requirements

- Python 3.10 or later
- The configured Ollama-compatible model endpoint must be reachable for quiz generation

## Install dependencies

From the repository root, create and activate a virtual environment and install the backend dependencies:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If PowerShell blocks activation, allow it for the current terminal and activate again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

Install dependencies once. For each API, open a separate terminal and activate the same environment before starting it.

## Start the services

### Quiz generation API

In a terminal, from the `backend` directory:

```powershell
cd generate
..\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --port 8000
```

The API is at <http://localhost:8000>; interactive documentation is at <http://localhost:8000/docs>. The root health check is <http://localhost:8000/>.

Quiz requests use `POST /generate/{type}`. Supported types are `mcq`, `tf` (true/false), `sa` (short answer), and `fb` (fill in the blank). The JSON body contains `text`, an optional `type`, and an optional `num_questions` (defaults to 5). Quiz export is available at `POST /generate/export-word`.

The model endpoint and model name are configured in `generate/services.py`. Ensure that endpoint is reachable and serving the configured `gpt-oss:20b` model.

### Text extraction API

In a second terminal, from the `backend` directory:

```powershell
cd extract_text
..\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --port 8001
```

Interactive documentation is at <http://localhost:8001/docs>. Upload a PDF, DOCX, or PPTX file as multipart form data named `file` to `POST /upload`; the response contains the extracted text.

### Optional local authentication API

The frontend currently authenticates directly with Supabase, so this service is not needed for the normal app flow. To run it for development, open a third terminal from the `backend` directory:

```powershell
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --port 8002
```

Interactive documentation is at <http://localhost:8002/docs>. This service creates/uses the local SQLite database `users.db`. Its `/me` endpoint verifies Supabase tokens and requires `SUPABASE_URL` to be set in the environment.

## Stop a service

Press `Ctrl+C` in the terminal running that service. Keep the two required APIs running while using the frontend.
