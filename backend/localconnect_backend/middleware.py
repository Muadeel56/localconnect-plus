import os
import django
import logging
from django.conf import settings

# Set up logging
logger = logging.getLogger(__name__)

# Configure Django settings first
if not settings.configured:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'localconnect_backend.settings')
    django.setup()

from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponse

# JWT WebSocket Authentication
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from urllib.parse import parse_qs
import jwt

User = get_user_model()

class DisableCSRFMiddleware(MiddlewareMixin):
    """
    Middleware to disable CSRF for API endpoints
    """
    def process_request(self, request):
        # Disable CSRF for API endpoints
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return None

    def process_response(self, request, response):
        return response

class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware to authenticate WebSocket connections using JWT tokens
    """
    
    def __init__(self, inner):
        super().__init__(inner)
    
    async def __call__(self, scope, receive, send):
        # Get token from query string
        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]
        
        logger.info(f"WebSocket middleware - Query string: {query_string}")
        logger.info(f"WebSocket middleware - Token found: {'Yes' if token else 'No'}")
        
        # Get token from headers if not in query string
        if not token:
            headers = dict(scope.get("headers", []))
            auth_header = headers.get(b"Authorization", b"").decode()
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                logger.info("WebSocket middleware - Token found in Authorization header")
        
        # Authenticate user
        user = await self.get_user_from_token(token)
        scope["user"] = user
        logger.info(f"WebSocket middleware - User authenticated: {user.username if user.is_authenticated else 'Anonymous'}")
        
        return await super().__call__(scope, receive, send)
    
    @database_sync_to_async
    def get_user_from_token(self, token):
        """
        Get user from JWT token
        """
        if not token:
            logger.warning("WebSocket middleware - No token provided")
            return AnonymousUser()
        
        try:
            # Decode and verify the token
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
            logger.info(f"WebSocket middleware - Token valid for user: {user.username}")
            return user
        except (InvalidToken, TokenError) as e:
            logger.error(f"WebSocket middleware - Invalid token: {e}")
            return AnonymousUser()
        except User.DoesNotExist:
            logger.error("WebSocket middleware - User from token does not exist")
            return AnonymousUser()

# Function to create the JWT auth middleware stack
def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner) 