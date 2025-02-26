import uvicorn
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info("Starting FastAPI server...")
    uvicorn.run(
        "main:app",
        host="localhost",  
        port=5001,  
        reload=True,
        log_level="info"
    )