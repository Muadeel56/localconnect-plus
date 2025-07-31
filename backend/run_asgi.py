#!/usr/bin/env python
"""
Simple script to run Django with WebSocket support using daphne
Usage: python run_asgi.py
"""
import os
import sys
import subprocess

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'localconnect_backend.settings')
    
    # Check if daphne is available
    try:
        import daphne
    except ImportError:
        print("Error: daphne is not installed. Install it with: pip install daphne")
        sys.exit(1)
    
    print("Starting Django server with WebSocket support...")
    print("Server will be available at: http://localhost:8000")
    print("WebSocket connections supported at: ws://localhost:8000/ws/")
    print("Press Ctrl+C to stop the server")
    print()
    
    # Run daphne with correct syntax
    try:
        subprocess.run([
            'daphne', 
            '-b', '0.0.0.0',  # Bind to all interfaces
            '-p', '8000',     # Port
            'localconnect_backend.asgi:application'  # ASGI application
        ])
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1) 