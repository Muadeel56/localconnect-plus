#!/usr/bin/env python3
"""
Simple WebSocket test script to verify chat WebSocket connections
Usage: python test_websocket.py
"""

import asyncio
import websockets
import json

async def test_websocket():
    """Test WebSocket connection without authentication"""
    uri = "ws://localhost:8000/ws/chat/test-room-id/"
    
    try:
        print(f"Attempting to connect to {uri}")
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connection established!")
            
            # Wait for any incoming messages
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                print(f"📨 Received: {message}")
            except asyncio.TimeoutError:
                print("⏰ No messages received within 5 seconds")
                
    except Exception as e:
        print(f"❌ WebSocket connection failed: {e}")

if __name__ == "__main__":
    print("🧪 Testing WebSocket connection...")
    asyncio.run(test_websocket()) 