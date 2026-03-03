#!/usr/bin/env python3
"""
Test script for Python AI Scoring Server
Verifies that the Python scoring server is working correctly
"""

import requests
import json
import sys
import time

def test_health():
    """Test the health endpoint"""
    try:
        response = requests.get('http://localhost:5001/health')
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_speaking_evaluation():
    """Test speaking evaluation endpoint"""
    try:
        payload = {
            "action": "evaluate_speaking",
            "prompt": "Describe the image showing a busy city street.",
            "transcript": "The image shows a busy city street with cars and people walking. There are tall buildings and traffic lights. It seems to be daytime.",
            "questionType": "describe_image"
        }
        
        response = requests.post('http://localhost:5001/api/test-evaluation', json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Speaking evaluation test passed")
            print(f"Response: {json.dumps(result, indent=2)[:500]}...")
            return True
        else:
            print(f"❌ Speaking evaluation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Speaking evaluation error: {e}")
        return False

def test_writing_evaluation():
    """Test writing evaluation endpoint"""
    try:
        payload = {
            "action": "evaluate_writing",
            "prompt": "Write an essay about the benefits of learning English.",
            "response": "Learning English has many benefits. It is a global language that opens up opportunities for education, career advancement, and travel. English is widely spoken around the world and is the language of international business.",
            "questionType": "write_essay"
        }
        
        response = requests.post('http://localhost:5001/api/test-evaluation', json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Writing evaluation test passed")
            print(f"Response: {json.dumps(result, indent=2)[:500]}...")
            return True
        else:
            print(f"❌ Writing evaluation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Writing evaluation error: {e}")
        return False

def test_webhook_endpoint():
    """Test the main webhook endpoint"""
    try:
        payload = {
            "action": "evaluate_speaking",
            "prompt": "Simple test prompt",
            "transcript": "This is a simple test response.",
            "questionType": "practice"
        }
        
        response = requests.post('http://localhost:5001/webhook/pte-scoring', json=payload)
        
        if response.status_code in [200, 400]:  # 400 is expected if API keys are missing
            result = response.json()
            print("✅ Webhook endpoint test passed")
            print(f"Response: {json.dumps(result, indent=2)[:300]}...")
            return True
        else:
            print(f"❌ Webhook endpoint failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Webhook endpoint error: {e}")
        return False

def main():
    print("Testing Python AI Scoring Server...")
    print("=" * 50)
    
    # Wait a moment to ensure server is ready
    time.sleep(2)
    
    tests = [
        ("Health Check", test_health),
        ("Speaking Evaluation", test_speaking_evaluation),
        ("Writing Evaluation", test_writing_evaluation),
        ("Webhook Endpoint", test_webhook_endpoint),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\nRunning {test_name}...")
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 50)
    print("Test Results:")
    all_passed = True
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if not result:
            all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 All tests passed! Python scoring server is ready.")
    else:
        print("⚠️ Some tests failed. Check the server setup and configuration.")
        print("Make sure the Python server is running on port 5001.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)