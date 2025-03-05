from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)


class ApiKeyManager:
    """Manages API keys and their usage limits"""

    def __init__(self, max_usage: int = 10):
        self.api_keys: Dict[str, int] = {
            "test_key": 0  # Default test key with 0 usage
        }
        self.admin_key = "admin_secret"  # Admin key for authentication
        self.max_usage = max_usage
        logger.info(
            f"API Key Manager initialized with max usage of {max_usage}")

    def validate_admin_key(self, admin_key: str) -> bool:
        """Validate the admin key"""
        return admin_key == self.admin_key

    def validate_key(self, api_key: str) -> bool:
        """Check if API key exists and has not exceeded usage limit"""
        if api_key not in self.api_keys:
            logger.warning(f"Invalid API key attempted: {api_key}")
            return False

        if self.api_keys[api_key] >= self.max_usage:
            logger.warning(f"API key usage limit exceeded: {api_key}")
            return False

        return True

    def increment_usage(self, api_key: str) -> int:
        """Increment usage count for an API key and return new count"""
        if api_key in self.api_keys:
            self.api_keys[api_key] += 1
            usage = self.api_keys[api_key]
            logger.info(f"API key {api_key} used ({usage}/{self.max_usage})")
            return usage
        return 0

    def reset_usage(self, api_key: str) -> bool:
        """Reset usage count for an API key"""
        if api_key in self.api_keys:
            self.api_keys[api_key] = 0
            logger.info(f"API key usage reset: {api_key}")
            return True
        return False

    def add_key(self, api_key: str) -> bool:
        """Add a new API key"""
        if api_key in self.api_keys:
            return False
        self.api_keys[api_key] = 0
        logger.info(f"New API key added: {api_key}")
        return True

    def remove_key(self, api_key: str) -> bool:
        """Remove an API key"""
        if api_key in self.api_keys:
            del self.api_keys[api_key]
            logger.info(f"API key removed: {api_key}")
            return True
        return False

    def get_usage(self, api_key: str) -> Optional[int]:
        """Get current usage count for an API key"""
        return self.api_keys.get(api_key)

    def get_all_keys(self) -> Dict[str, int]:
        """Get all API keys and their usage counts"""
        return self.api_keys.copy()


# Create a global instance
api_key_manager = ApiKeyManager()
