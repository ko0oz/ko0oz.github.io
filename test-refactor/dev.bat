@echo off
echo Starting development server...
start "" cmd /c "npm run watch"
start "" cmd /c "npx http-server dist -p 3000 -o"
echo Development server running at http://localhost:3000
echo Press Ctrl+C in both windows to stop
