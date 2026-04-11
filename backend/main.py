from fastapi import FastAPI
from routes.analytics_routes import router as analytics_router

app = FastAPI(
    title="Museum Analytics API",
    version="1.0"
)

app.include_router(analytics_router, prefix="/analytics")

@app.get("/")
def root():
    return {"message": "Museum Analytics Backend Running"}