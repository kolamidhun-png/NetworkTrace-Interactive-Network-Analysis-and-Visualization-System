
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.graph.engine import (
    analyze_graph,
    build_graph_from_csv,
    create_demo_graph,
)

app = FastAPI(
    title="NetworkTrace API",
    description="Graph analytics and community detection API",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

MAX_UPLOAD_BYTES = 5 * 1024 * 1024


@app.get("/")
def root():
    return {
        "name": "NetworkTrace",
        "status": "running",
        "version": "2.0.0",
    }


@app.get("/api/health")
def health():
    return {"status": "healthy"}


@app.get("/api/graph/demo")
def demo_graph():
    graph, entities = create_demo_graph()
    return analyze_graph(graph, entities)


@app.post("/api/graph/upload")
async def upload_graph(file: UploadFile = File(...)):
    filename = file.filename or ""

    if not filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a .csv file.",
        )

    try:
        content = await file.read(MAX_UPLOAD_BYTES + 1)

        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=413,
                detail="File too large. Maximum upload size is 5 MB.",
            )

        graph, entities, import_stats = build_graph_from_csv(content)
        result = analyze_graph(graph, entities)

        result["upload"] = {
            "filename": filename,
            **import_stats,
        }

        return result

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    finally:
        await file.close()
