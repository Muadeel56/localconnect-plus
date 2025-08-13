#!/usr/bin/env python3
"""
Test script for email verification API endpoints
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def test_registration():
    """Test user registration"""
    print("Testing user registration...")
    
    registration_data = {
        "username": "testuser_verification",
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User",
        "password": "testpass123",
        "password2": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/accounts/register/", json=registration_data)
    print(f"Registration Status: {response.status_code}")
    print(f"Registration Response: {response.json()}")
    
    if response.status_code == 201:
        print("✅ Registration successful!")
        return response.json()
    else:
        print("❌ Registration failed!")
        return None

def test_email_verification(token):
    """Test email verification"""
    print(f"\nTesting email verification with token: {token[:20]}...")
    
    verification_data = {
        "token": token
    }
    
    response = requests.post(f"{BASE_URL}/accounts/verify-email/", json=verification_data)
    print(f"Verification Status: {response.status_code}")
    print(f"Verification Response: {response.json()}")
    
    if response.status_code == 200:
        print("✅ Email verification successful!")
    else:
        print("❌ Email verification failed!")

def get_verification_token_from_db():
    """Get the verification token from the database (for testing)"""
    import os
    import django
    
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'localconnect_backend.settings')
    django.setup()
    
    from accounts.models import EmailVerificationToken
    
    # Get the most recent token for our test user
    token_obj = EmailVerificationToken.objects.filter(
        user__username='testuser_verification',
        is_used=False
    ).first()
    
    if token_obj:
        return token_obj.token
    return None

if __name__ == "__main__":
    print("🧪 Testing Email Verification API")
    print("=" * 50)
    
    # Test registration
    result = test_registration()
    
    if result:
        # Wait a moment for the token to be created
        time.sleep(1)
        
        # Get the token from database (in real scenario, this would come from email)
        token = get_verification_token_from_db()
        
        if token:
            # Test email verification
            test_email_verification(token)
        else:
            print("❌ No verification token found in database!")
    
    print("\n" + "=" * 50)
    print("Test completed!") 