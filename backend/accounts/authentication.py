from rest_framework_simplejwt.authentication import JWTAuthentication
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

class CSRFExemptJWTAuthentication(JWTAuthentication):
    """
    JWT Authentication that bypasses CSRF for API endpoints
    """
    def authenticate(self, request):
        # Set CSRF exempt flag
        setattr(request, '_dont_enforce_csrf_checks', True)
        return super().authenticate(request) 