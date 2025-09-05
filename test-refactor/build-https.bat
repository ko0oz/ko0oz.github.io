@echo off
echo Building portfolio with HTTPS redirect...
echo.

REM Copy HTTPS templates
copy templates\index-https.html templates\index.html
copy templates\project-https.html templates\project.html

REM Build with HTTPS templates
npm run build

REM Restore original templates
copy templates\index.html templates\index-original.html
copy templates\project.html templates\project-original.html

echo.
echo ✅ Build with HTTPS redirect complete!
echo Ready for hosting!
echo.
echo Original templates backed up as:
echo - templates\index-original.html
echo - templates\project-original.html
pause
