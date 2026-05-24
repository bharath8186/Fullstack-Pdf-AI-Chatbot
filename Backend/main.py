from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import io
import uuid

from dotenv import load_dotenv
from pypdf import PdfReader

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="RAG PDF Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://fullstack-pdf-ai-chatbot.vercel.app"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions = {}


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    answer: str
    session_id: str


class Message(BaseModel):
    role: str
    content: str


class HistoryResponse(BaseModel):
    messages: List[Message]


@app.get("/")
def root():
    return {"status": "RAG PDF Chatbot API is running"}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    contents = await file.read()
    reader = PdfReader(io.BytesIO(contents))

    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(text)

    embeddings = OpenAIEmbeddings(api_key=OPENAI_API_KEY)
    vector_db = FAISS.from_texts(chunks, embeddings)
    retriever = vector_db.as_retriever(search_kwargs={"k": 3})

    llm = ChatOpenAI(
        api_key=OPENAI_API_KEY,
        model="gpt-3.5-turbo",
        temperature=0,
    )

    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        output_key="answer",
    )

    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        memory=memory,
        return_source_documents=False,
        verbose=False,
    )

    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "chain": chain,
        "messages": [],
        "filename": file.filename,
    }

    return {
        "session_id": session_id,
        "filename": file.filename,
        "chunks": len(chunks),
        "message": "PDF processed successfully!",
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found. Please upload a PDF first.")

    session = sessions[request.session_id]
    chain = session["chain"]

    session["messages"].append({"role": "user", "content": request.message})

    try:
        result = chain.invoke({"question": request.message})
        answer = result.get("answer", "I could not find an answer in the PDF.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

    session["messages"].append({"role": "assistant", "content": answer})

    return ChatResponse(answer=answer, session_id=request.session_id)


@app.get("/history/{session_id}", response_model=HistoryResponse)
async def get_history(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found.")

    messages = sessions[session_id]["messages"]
    return HistoryResponse(messages=[Message(**m) for m in messages])


@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    if session_id in sessions:
        del sessions[session_id]
        return {"message": "Session deleted."}
    raise HTTPException(status_code=404, detail="Session not found.")