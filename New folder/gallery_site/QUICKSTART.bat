@echo off
REM Quick Start Guide for Gallery Site on Windows

echo.
echo 🎨 Gallery Site - Rails Image Gallery
echo ======================================
echo.
echo 📦 Installing dependencies...
call bundle install

echo.
echo 🗄️  Setting up database...
call rails db:create
call rails db:migrate

echo.
echo ✅ Setup complete!
echo.
echo 🚀 To start the development server, run:
echo    rails server
echo.
echo 🌐 Then open your browser to: http://localhost:3000
echo.
echo 📚 Quick tips:
echo    - Create a gallery on the 'Create Gallery' page
echo    - Upload images to galleries with captions
echo    - Edit or delete galleries and images
echo.
echo 📖 For more help, see README.md
echo.
pause
