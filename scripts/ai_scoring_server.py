#!/usr/bin/env python3
"""
AI Scoring Server for PTE Mock Test
Flask server that handles n8n webhook requests and provides AI scoring
"""

import os
import json
import asyncio
from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_scoring_service import handle_n8n_request, PTEScoringService
import threading
import sys
from dotenv import load_dotenv

import logging
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure logging
os.makedirs('logs', exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(f"logs/scoring_server_{datetime.now().strftime('%Y%m%d')}.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/webhook/pte-scoring', methods=['POST'])
def webhook_handler():
    """
    Main webhook endpoint for n8n integration
    Handles all PTE scoring requests from n8n
    """
    try:
        # Get JSON payload from n8n
        payload = request.get_json()
        
        if not payload:
            return jsonify({
                "error": "No JSON payload received",
                "success": False
            }), 400
        
        logger.info(f"Received webhook request: {payload.get('action', 'unknown')}")
        
        # Process the request asynchronously
        result = asyncio.run(handle_n8n_request(payload))
        
        logger.info(f"Processing completed, success: {result['success']}")
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e),
            "result": None
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "PTE AI Scoring Server",
        "timestamp": str(__import__('datetime').datetime.now())
    }), 200


@app.route('/api/test-evaluation', methods=['POST'])
def test_evaluation():
    """Test endpoint for manual evaluation testing"""
    try:
        data = request.get_json()
        action = data.get('action', '')
        
        scoring_service = PTEScoringService()
        
        if action == 'evaluate_speaking':
            prompt = data.get('prompt', '')
            transcript = data.get('transcript', '')
            question_type = data.get('question_type', 'speaking')
            
            result = asyncio.run(scoring_service.evaluate_speaking(prompt, transcript, question_type))
            return jsonify({
                "success": True,
                "result": result.details,
                "score": result.score,
                "feedback": result.feedback
            })
        
        elif action == 'evaluate_writing':
            prompt = data.get('prompt', '')
            response = data.get('response', '')
            question_type = data.get('question_type', 'writing')
            
            result = asyncio.run(scoring_service.evaluate_writing(prompt, response, question_type))
            return jsonify({
                "success": True,
                "result": result.details,
                "score": result.score,
                "feedback": result.feedback
            })
        
        else:
            return jsonify({
                "success": False,
                "error": f"Unsupported action: {action}"
            }), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


def run_server():
    """Run the Flask server"""
    port = int(os.environ.get('PORT', 5001))  # Use port 5001 to avoid conflict with main server
    logger.info(f"Starting PTE AI Scoring Server on port {port}...")
    logger.info(f"Webhook endpoint: http://localhost:{port}/webhook/pte-scoring")
    
    # Use threaded mode to handle concurrent requests
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)


if __name__ == '__main__':
    # Check if required dependencies are installed
    try:
        import flask
        from flask_cors import CORS
        import aiohttp
    except ImportError as e:
        logger.error(f"Missing dependency: {e}")
        logger.info("Please install required packages:")
        logger.info("pip install flask flask-cors aiohttp python-dotenv")
        sys.exit(1)
    
    # Start the server
    run_server()