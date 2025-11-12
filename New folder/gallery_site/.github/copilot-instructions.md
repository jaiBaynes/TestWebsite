# Gallery Site - Ruby on Rails Project Documentation

## Project Overview

A beginner-friendly Ruby on Rails web application for managing image galleries with captions. This project demonstrates core Rails concepts including models, controllers, views, routing, and Active Storage file uploads.

## Architecture

### Models
- **Gallery**: Represents a collection of images with `title` and `description`
- **Image**: Represents individual images with `caption` and file attachment

### Controllers
- **HomeController**: Handles home page
- **GalleriesController**: Manages CRUD operations for galleries
- **ImagesController**: Manages image uploads and deletion

### Key Features
- Nested RESTful routing (images nested under galleries)
- Active Storage for file uploads
- Model validations
- Responsive CSS styling
- Error handling and user feedback

## Getting Started

### Prerequisites
- Ruby 3.0+
- Rails 7.1+
- SQLite3
- Node.js 16+ (for asset pipeline)

### Setup Steps
1. Navigate to the project: `cd gallery_site`
2. Install gems: `bundle install`
3. Create database: `rails db:create`
4. Run migrations: `rails db:migrate`
5. Start server: `rails server`
6. Open browser: http://localhost:3000

## Project Structure

```
app/
├── controllers/
│   ├── home_controller.rb
│   ├── galleries_controller.rb
│   └── images_controller.rb
├── models/
│   ├── gallery.rb
│   └── image.rb
├── views/
│   ├── galleries/
│   │   ├── index.html.erb
│   │   ├── show.html.erb
│   │   ├── new.html.erb
│   │   └── edit.html.erb
│   ├── home/
│   │   └── index.html.erb
│   └── layouts/
│       └── application.html.erb
└── assets/
    └── stylesheets/
        └── application.css

config/
├── routes.rb
└── database.yml

db/
└── migrate/
    ├── 001_create_galleries.rb
    └── 002_create_images.rb
```

## Routes

```
GET  /                          # Home page
GET  /galleries                 # List all galleries
POST /galleries                 # Create gallery
GET  /galleries/new             # New gallery form
GET  /galleries/:id             # View gallery
PATCH /galleries/:id            # Update gallery
DELETE /galleries/:id           # Delete gallery
GET  /galleries/:id/edit        # Edit gallery form
POST /galleries/:gallery_id/images    # Create image
DELETE /galleries/:gallery_id/images/:id  # Delete image
```

## Development Tips

### Adding a New Field to Gallery
1. Create migration: `rails generate migration AddFieldToGalleries field_name:string`
2. Run migration: `rails db:migrate`
3. Update model validation in `app/models/gallery.rb`
4. Update form in `app/views/galleries/new.html.erb`
5. Update view to display new field

### Customizing Styling
- Main stylesheet: `app/assets/stylesheets/application.css`
- Uses CSS Grid for responsive layouts
- Mobile-first responsive design

### Debugging
- Server logs visible in terminal
- Rails console: `rails console`
- Database browser: `rails dbconsole`

## Common Commands

```bash
rails server              # Start development server
rails db:create          # Create database
rails db:migrate         # Run migrations
rails db:reset           # Reset database (development only)
rails console            # Open Rails console
rails generate           # Generate scaffolding
rails destroy            # Remove generated files
bundle install           # Install/update gems
```

## Troubleshooting

### Images Not Showing
- Check `storage/` directory exists and is readable
- Verify file upload succeeded in server logs
- Check `public/system/` permissions

### Database Errors
- Run: `rails db:reset` (development only)
- Or: `rails db:drop db:create db:migrate`

### Port Already in Use
- Use different port: `rails server -p 3001`
- Or kill process: `lsof -i :3000` then `kill <PID>`

## Next Steps for Enhancement

1. Add user authentication (Devise gem)
2. Add image tagging/categories
3. Implement image search
4. Add pagination to gallery index
5. Add ratings/comments to images
6. Deploy to Heroku or similar platform
7. Add image optimization/compression
8. Add API endpoints (JSON responses)

## Learning Resources

- Rails Guides: https://guides.rubyonrails.org/
- Active Record Basics: https://guides.rubyonrails.org/active_record_basics.html
- Active Storage: https://guides.rubyonrails.org/active_storage_overview.html
- Routing: https://guides.rubyonrails.org/routing.html
- Controllers: https://guides.rubyonrails.org/action_controller_overview.html
- Views: https://guides.rubyonrails.org/action_view_overview.html

## Development Status

✅ Project setup complete
✅ Database models and migrations
✅ Controllers and views created
✅ Styling and layout implemented
✅ Active Storage configured
✅ Documentation complete

Ready for:
- Local development
- Learning Rails concepts
- Customization and enhancement
- Deployment preparation
