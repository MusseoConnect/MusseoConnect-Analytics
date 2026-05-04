from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analytics_routes import router as analytics_router

app = FastAPI(
    title="Museum Analytics API",
    description="Delhi Museum Visitor Analytics Backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Museum Analytics API is running."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)