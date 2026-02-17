#!/usr/bin/env python3
"""
GWD Dashboard API Server
Serves the dashboard with real-time budget and model usage data
"""

import http.server
import socketserver
import json
import subprocess
import os
from pathlib import Path

PORT = 8080
DASHBOARD_DIR = Path(__file__).parent

class APIHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DASHBOARD_DIR, **kwargs)
    
    def do_GET(self):
        if self.path.startswith('/api/'):
            if self.path == '/api/budget':
                self.serve_budget()
            elif self.path == '/api/models':
                self.serve_models()
            elif self.path == '/api/news':
                self.serve_news()
            else:
                self.send_error(404)
        else:
            super().do_GET()
    
    def serve_budget(self):
        try:
            result = subprocess.run(
                ['node', 'budget-tracker.js', 'status'],
                capture_output=True,
                text=True,
                cwd=DASHBOARD_DIR
            )
            data = json.loads(result.stdout)
            self.send_json(data)
        except Exception as e:
            self.send_json({
                "used": "0.00",
                "budget": "5.00",
                "remaining": "5.00",
                "percentage": "0.0",
                "calls": 0,
                "alert": False,
                "error": str(e)
            })
    
    def serve_models(self):
        try:
            result = subprocess.run(
                ['node', 'budget-tracker.js', 'models'],
                capture_output=True,
                text=True,
                cwd=DASHBOARD_DIR
            )
            data = json.loads(result.stdout)
            self.send_json(data)
        except Exception as e:
            self.send_json([])
    
    def serve_news(self):
        # Return empty array - news is fetched client-side
        self.send_json([])
    
    def send_json(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

if __name__ == '__main__':
    with socketserver.TCPServer(("0.0.0.0", PORT), APIHandler) as httpd:
        print(f"GWD Dashboard API Server running at http://0.0.0.0:{PORT}")
        httpd.serve_forever()
