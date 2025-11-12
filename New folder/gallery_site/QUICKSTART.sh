#!/usr/bin/env bash
# Quick Start Guide for Gallery Site

echo "🎨 Gallery Site - Rails Image Gallery"
echo "======================================"
echo ""
echo "📦 Installing dependencies..."
bundle install

echo ""
echo "🗄️  Setting up database..."
rails db:create
rails db:migrate

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server, run:"
echo "   rails server"
echo ""
echo "🌐 Then open your browser to: http://localhost:3000"
echo ""
echo "📚 Quick tips:"
echo "   - Create a gallery on the 'Create Gallery' page"
echo "   - Upload images to galleries with captions"
echo "   - Edit or delete galleries and images"
echo ""
echo "📖 For more help, see README.md"
