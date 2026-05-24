# DocMind – RAG PDF Chatbot
## React + FastAPI + LangChain + OpenAI

---

## Project Structure

```
rag-pdf-chatbot/
├── backend/
│   ├── main.py            ← FastAPI app
│   ├── requirements.txt   ← Python dependencies
│   └── .env               ← Your OpenAI API key
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── App.css
        └── components/
            ├── UploadPanel.jsx / .css
            ├── ChatWindow.jsx / .css
            └── ChatInput.jsx / .css
```

---

## Prerequisites

Install these before starting:

| Tool       | Download Link                          | Min Version |
|------------|----------------------------------------|-------------|
| Python     | https://python.org/downloads           | 3.10+       |
| Node.js    | https://nodejs.org                     | 18+         |
| VS Code    | https://code.visualstudio.com          | Any         |

---

## Step 1 — Open the Project in VS Code

1. Copy the `rag-pdf-chatbot` folder to your preferred location (e.g. Desktop)
2. Open VS Code
3. Go to **File → Open Folder** and select `rag-pdf-chatbot`

---

## Step 2 — Set Up the Backend

### 2a. Open a terminal in VS Code
Press `` Ctrl+` `` (backtick) to open the integrated terminal.

### 2b. Navigate to the backend folder
```bash
cd backend
```

### 2c. Create a Python virtual environment
```bash
python -m venv venv
```

### 2d. Activate the virtual environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac / Linux:**
```bash
source venv/bin/activate
```

You should see `(venv)` appear at the start of your terminal prompt.

### 2e. Install Python dependencies
```bash
pip install -r requirements.txt
```
This may take 2–3 minutes.

### 2f. Add your OpenAI API key

Open `backend/.env` and replace the placeholder:
```
OPENAI_API_KEY=your_openai_api_key_here
```

Get your key from: https://platform.openai.com/api-keys

---

## Step 3 — Start the Backend Server

Still inside the `backend` folder with `(venv)` active:

```bash
uvicorn main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

✅ Leave this terminal running. Open a **new terminal** for the next step.

---

## Step 4 — Set Up the Frontend

### 4a. Open a new terminal in VS Code
Press `` Ctrl+` `` or click the **+** icon in the terminal panel.

### 4b. Navigate to the frontend folder
```bash
cd frontend
```

### 4c. Install Node.js dependencies
```bash
npm install
```

---

## Step 5 — Start the Frontend

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

---

## Step 6 — Open the App

Open your browser and go to:
```
http://localhost:5173
```

---

## How to Use

1. **Upload a PDF** — drag and drop or click "Drop PDF here" in the sidebar
2. **Wait** for the "✓ Processed" confirmation (takes 5–15 seconds)
3. **Ask questions** — type in the chat box and press Enter
4. The AI remembers your previous questions in the conversation (chat memory)
5. Click **"Upload new PDF"** to start over with a different document

---

## API Endpoints (for reference)

| Method | Endpoint                  | Description                     |
|--------|---------------------------|---------------------------------|
| POST   | `/upload`                 | Upload & process a PDF          |
| POST   | `/chat`                   | Send a message, get an answer   |
| GET    | `/history/{session_id}`   | Retrieve chat history           |
| DELETE | `/session/{session_id}`   | Delete a session                |

Interactive API docs: http://localhost:8000/docs

---

## Troubleshooting

**`ModuleNotFoundError`** → Make sure `(venv)` is active and you ran `pip install -r requirements.txt`

**`OPENAI_API_KEY` error** → Check your `.env` file has the correct key with no spaces

**CORS error in browser** → Make sure the backend is running on port 8000

**`npm: command not found`** → Install Node.js from https://nodejs.org

**Port already in use** → Kill the existing process or change the port in `vite.config.js`
