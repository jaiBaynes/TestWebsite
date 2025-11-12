# Gallery Site - Ruby on Rails Image Gallery Application

A beginner-friendly Ruby on Rails web application for managing image galleries with captions. Perfect for learning Rails fundamentals including models, controllers, views, and Active Storage.

## 🎯 Features

- **Create Galleries**: Organize images into themed galleries with title and description
- **Upload Images**: Add images to galleries with custom captions
- **Manage Content**: Edit gallery information and delete galleries or images
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Clean Interface**: Simple and intuitive user interface

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Ruby 3.0 or higher
- Rails 7.1 or higher
- SQLite3
- Git

## 🚀 Getting Started

### 1. Navigate to the Project

```bash
cd gallery_site
```

### 2. Install Dependencies

```bash
bundle install
```

### 3. Set Up the Database

```bash
rails db:create
rails db:migrate
```

### 4. Start the Rails Server

```bash
rails server
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
gallery_site/
├── app/
│   ├── controllers/
│   │   ├── home_controller.rb           # Home page controller
│   │   ├── galleries_controller.rb      # Galleries management
│   │   └── images_controller.rb         # Images management
│   ├── models/
│   │   ├── gallery.rb                   # Gallery model with validations
│   │   └── image.rb                     # Image model with file attachment
│   ├── views/
│   │   ├── galleries/
│   │   │   ├── index.html.erb          # List all galleries
│   │   │   ├── show.html.erb           # View gallery with images
│   │   │   ├── new.html.erb            # Create new gallery form
│   │   │   └── edit.html.erb           # Edit gallery form
│   │   ├── home/
│   │   │   └── index.html.erb          # Home page
│   │   └── layouts/
│   │       └── application.html.erb    # Main layout with navigation
│   └── assets/
│       └── stylesheets/
│           └── application.css         # Application styles
├── config/
│   ├── routes.rb                        # Application routes
│   └── database.yml                     # Database configuration
├── db/
│   ├── migrate/
│   │   ├── 001_create_galleries.rb     # Galleries table migration
│   │   └── 002_create_images.rb        # Images table migration
│   └── seeds.rb                        # Database seeds
└── Gemfile                             # Ruby dependencies
```

## 🏗️ Database Schema

### Galleries Table
```sql
CREATE TABLE galleries (
  id INTEGER PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  created_at DATETIME,
  updated_at DATETIME
);
```

### Images Table
```sql
CREATE TABLE images (
  id INTEGER PRIMARY KEY,
  gallery_id INTEGER NOT NULL,
  caption VARCHAR NOT NULL,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (gallery_id) REFERENCES galleries(id)
);
```

**Note**: Images are stored using Rails Active Storage. File references are in the `active_storage_blobs` table.

## 🎨 Features Explained

### Home Page
- Welcome message and feature overview
- Quick link to explore galleries

### Galleries Index
- View all created galleries
- See number of images in each gallery
- Create, edit, or delete galleries
- Quick preview of gallery descriptions

### Gallery Show
- View all images in a gallery
- See gallery title and description
- Add new images with captions
- Delete individual images
- Edit or delete the gallery itself

### Image Upload
- Drag and drop file selection
- Caption input for image description
- Validation for required fields
- Success/error feedback

## 📝 Usage Guide

### Creating a Gallery

1. Click "Create Gallery" in the navigation or on the home page
2. Enter a gallery title (required)
3. Enter a gallery description (required)
4. Click "Create Gallery"

### Adding Images to a Gallery

1. Navigate to a gallery by clicking its title
2. Scroll to "Add New Image" section
3. Select an image file from your computer
4. Enter a caption for the image
5. Click "Add Image"

### Editing a Gallery

1. Go to the gallery you want to edit
2. Click "Edit Gallery" button
3. Modify the title or description
4. Click "Update Gallery"

### Deleting Content

- **Delete Gallery**: Click "Delete" on the gallery card or in the gallery view
- **Delete Image**: Click "Delete" button on the image card

## 🛠️ Learning Path

This project is perfect for learning Rails concepts:

1. **Models**: Understand relationships (`has_many`, `belongs_to`)
2. **Controllers**: Learn CRUD operations and RESTful routing
3. **Views**: Create forms with `form_with` helper and display data
4. **Active Storage**: Implement file uploads
5. **Routing**: Learn nested resources
6. **Validation**: Add model validations
7. **Styling**: Create responsive CSS layouts

## 🔧 Customization

### Change Database
To use PostgreSQL instead of SQLite:
```bash
bundle remove sqlite3
bundle add pg
# Update config/database.yml
rails db:create db:migrate
```

### Add More Image Properties
1. Add new columns to the images table migration
2. Update the Image model validations
3. Update the form and views

### Enhance Styling
- Modify `app/assets/stylesheets/application.css`
- Add Tailwind CSS or Bootstrap for easier styling

## 🚨 Common Issues

### Images Not Uploading
- Check that the `storage/` directory exists and is writable
- Verify file permissions
- Check file size limits in Rails configuration

### Migration Errors
```bash
rails db:reset  # Reset the database (be careful in production!)
```

### Port Already in Use
```bash
rails server -p 3001  # Use a different port
```

## 📚 Additional Resources

- [Rails Guides](https://guides.rubyonrails.org/)
- [Active Record Associations](https://guides.rubyonrails.org/association_basics.html)
- [Active Storage Overview](https://guides.rubyonrails.org/active_storage_overview.html)
- [Rails Routing](https://guides.rubyonrails.org/routing.html)

## 📄 License

This project is provided as-is for educational purposes.

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

---

**Happy Coding!** 🎉
