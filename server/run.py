import uvicorn
import logging
import os
import signal
import sys
from main import app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def signal_handler(sig, frame):
    logger.info("Received shutdown signal, exiting...")
    sys.exit(0)

if __name__ == "__main__":
    logger.info("Starting FastAPI server...")
    try:
        # Register signal handlers
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)

        # Get port from environment or use default
        port = 5001  # Fixed port for FastAPI
        logger.info(f"Using port {port}")

        # Start the server
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=port,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        logger.error(f"Failed to start server: {e}")