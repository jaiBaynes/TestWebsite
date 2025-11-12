# 📑 Gallery Site - Complete File Index

## Project Overview
**Ruby on Rails Image Gallery Application** - A beginner-friendly project demonstrating core Rails concepts with an image gallery system.

---

## 📂 Directory Structure

### 🏠 Root Level Files

| File | Purpose |
|------|---------|
| `Gemfile` | Ruby gem dependencies (Rails, SQLite3, etc.) |
| `Gemfile.lock` | Locked gem versions for reproducible builds |
| `Rakefile` | Rails task runner configuration |
| `config.ru` | Rack application entry point |
| `.gitignore` | Git ignore patterns |
| `.ruby-version` | Ruby version specification (3.4.7) |
| `README.md` | 📚 Complete user guide with features and usage |
| `DEVELOPMENT.md` | 📚 Developer guide with learning objectives |
| `SETUP_COMPLETE.md` | 📚 Project completion summary |
| `QUICKSTART.bat` | ⚡ Windows setup script |
| `QUICKSTART.sh` | ⚡ macOS/Linux setup script |
| `Dockerfile` | 🐳 Docker configuration |

---

## 📁 app/ Directory

### 🎮 Controllers
**Location**: `app/controllers/`

```
├── application_controller.rb
│   └── Base controller for all controllers
├── home_controller.rb
│   └── Handles home page (GET /home#index)
├── galleries_controller.rb
│   └── CRUD for galleries (RESTful routes)
└── images_controller.rb
    └── Create/Delete images nested under galleries
```

**Key Methods**:
- `GalleriesController`: index, show, new, create, edit, update, destroy
- `ImagesController`: create, destroy (nested under galleries)
- `HomeController`: index (home page)

### 🗂️ Models
**Location**: `app/models/`

```
├── application_record.rb
│   └── Base model for all models (Active Record)
├── gallery.rb
│   └── Gallery model with validations and associations
│   ├── has_many :images, dependent: :destroy
│   ├── validates :title, :description presence
│   └── Strong parameters handling
└── image.rb
    └── Image model with file attachment
    ├── belongs_to :gallery
    ├── has_one_attached :image_file
    └── validates :caption, :image_file presence
```

### 👁️ Views
**Location**: `app/views/`

#### Home Page
```
home/
└── index.html.erb (Landing page with features)
    ├── Hero section
    ├── Feature cards
    └── Call-to-action buttons
```

#### Gallery Views
```
galleries/
├── index.html.erb (List all galleries)
│   ├── Gallery cards grid
│   ├── Gallery stats (image count)
│   └── CRUD buttons
├── show.html.erb (View gallery with images)
│   ├── Gallery information
│   ├── Image upload form
│   ├── Images grid with captions
│   └── Image deletion
├── new.html.erb (Create gallery form)
│   ├── Title input
│   ├── Description textarea
│   └── Submit button
└── edit.html.erb (Edit gallery form)
    ├── Title input (pre-filled)
    ├── Description textarea (pre-filled)
    └── Submit button
```

#### Layout
```
layouts/
└── application.html.erb (Master layout)
    ├── DOCTYPE and meta tags
    ├── CSS stylesheet link
    ├── Navigation header
    ├── Alert messages
    └── Content yield
```

### 🎨 Assets
**Location**: `app/assets/`

```
stylesheets/
└── application.css (Complete styling)
    ├── Global styles (fonts, colors, spacing)
    ├── Layout components (containers, grid)
    ├── Button styles (primary, secondary, danger)
    ├── Form styles (inputs, validation)
    ├── Gallery grid layouts
    ├── Image cards with hover effects
    ├── Responsive media queries
    └── Mobile-first design

images/
└── .keep (Placeholder for image assets)
```

---

## ⚙️ config/ Directory

| File | Purpose |
|------|---------|
| `routes.rb` | URL routing configuration |
| `application.rb` | Rails application configuration |
| `boot.rb` | Rails boot sequence |
| `environment.rb` | Environment initialization |
| `database.yml` | Database connection settings |
| `puma.rb` | Puma web server configuration |
| `cable.yml` | Action Cable configuration |
| `storage.yml` | Active Storage configuration |

### Key Config Files

#### `config/routes.rb`
```ruby
root "home#index"              # Root route
resources :galleries do        # Gallery CRUD routes
  resources :images,           # Nested image routes
    only: [:create, :destroy]
end
get "home/index"              # Home page route
```

#### `config/database.yml`
```yaml
development:
  adapter: sqlite3
  database: db/development.sqlite3
  
test:
  adapter: sqlite3
  database: db/test.sqlite3
  
production:
  adapter: sqlite3
  database: db/production.sqlite3
```

---

## 🗄️ db/ Directory

### Migrations
**Location**: `db/migrate/`

```
├── 001_create_galleries.rb
│   ├── Creates galleries table
│   ├── Columns: id, title, description, timestamps
│   └── Validations: NOT NULL constraints
│
└── 002_create_images.rb
    ├── Creates images table
    ├── Columns: id, gallery_id, caption, timestamps
    ├── Foreign key to galleries
    └── Validations: NOT NULL constraints
```

**Schema Created**:
```sql
galleries:
  - id (PRIMARY KEY)
  - title (STRING, NOT NULL)
  - description (TEXT, NOT NULL)
  - created_at (DATETIME)
  - updated_at (DATETIME)

images:
  - id (PRIMARY KEY)
  - gallery_id (INTEGER, NOT NULL, FOREIGN KEY)
  - caption (STRING, NOT NULL)
  - created_at (DATETIME)
  - updated_at (DATETIME)

active_storage_blobs:
  - id (PRIMARY KEY)
  - key (STRING)
  - filename (STRING)
  - content_type (STRING)
  - metadata (JSON)
  - byte_size (INTEGER)
```

### Database Seeds
**Location**: `db/seeds.rb`

```ruby
# Empty by default
# Add sample data here for development
```

---

## 📚 bin/ Directory (Scripts)

| File | Purpose |
|------|---------|
| `rails` | Rails command runner |
| `rake` | Rake task runner |
| `setup` | Initial project setup |

---

## 🧪 test/ Directory

```
├── controllers/
├── models/
├── integration/
├── system/
├── fixtures/
└── test_helper.rb
```

---

## 📦 storage/ Directory

**Purpose**: Local file storage for uploaded images
- Created automatically when images are uploaded
- Contains Active Storage blobs
- Used in development mode only

---

## 📝 Documentation Files

### 1. README.md
**Target**: End users / Gallery managers
**Content**:
- Project features overview
- Installation instructions
- Database schema explanation
- Usage guide
- Customization options
- Troubleshooting guide
- Additional resources

### 2. DEVELOPMENT.md
**Target**: Developers / Learners
**Content**:
- Project structure overview
- Learning objectives
- Common development tasks
- Debugging tips
- Enhancement ideas
- Best practices
- Common errors & solutions

### 3. SETUP_COMPLETE.md
**Target**: New users
**Content**:
- Quick start guide
- Project summary
- What's included
- Available routes
- Next steps
- Troubleshooting

### 4. .github/copilot-instructions.md
**Target**: AI assistants / Developers
**Content**:
- Project architecture
- Technology stack
- Setup procedures
- Routes documentation
- Development workflow
- Enhancement roadmap

---

## 🎯 Quick Reference

### Creating a Gallery
1. Navigate to `/galleries/new`
2. Fill in title and description
3. Submit form
4. Redirects to gallery show page

### Uploading an Image
1. Go to gallery page
2. Fill in caption
3. Select image file
4. Submit form
5. Image appears in gallery grid

### Editing Content
1. Navigate to gallery
2. Click "Edit Gallery"
3. Modify fields
4. Submit to update

### Deleting Content
1. Gallery: Click "Delete" button → Confirms deletion
2. Image: Click "Delete" on image card → Deletes image

---

## 🔗 Relationships Map

```
User (Browser)
    ↓
Routes (config/routes.rb)
    ↓
Controllers (app/controllers/)
    ├── GalleriesController
    │   ├── → app/models/gallery.rb
    │   ├── → app/views/galleries/*.erb
    │   └── → Database: galleries table
    │
    ├── ImagesController
    │   ├── → app/models/image.rb
    │   ├── → Database: images table
    │   └── → Active Storage: blobs
    │
    └── HomeController
        └── → app/views/home/index.erb

Models (app/models/)
    ├── Gallery
    │   └── has_many :images
    │
    └── Image
        └── belongs_to :gallery

Database (SQLite)
    ├── galleries table
    ├── images table
    └── active_storage_blobs table
```

---

## 📊 File Statistics

- **Total Controllers**: 3
- **Total Models**: 2
- **Total Views**: 6
- **Total Migrations**: 2
- **Total CSS Selectors**: 50+
- **Total Documentation**: 4 files
- **Total Lines of Code**: ~2000+

---

## 🚀 Deployment Files

- `Dockerfile` - Docker container configuration
- `.dockerignore` - Files to exclude from Docker
- `bin/docker-entrypoint` - Docker entry point script

---

## 🔐 Configuration Files

- `.gitignore` - Git ignore patterns
- `.gitattributes` - Git attributes
- `.ruby-version` - Ruby version lock
- `config/master.key` - Encryption master key

---

## 💾 Environment Files

- `config/environments/development.rb` - Development settings
- `config/environments/production.rb` - Production settings
- `config/environments/test.rb` - Test settings
- `config/initializers/*.rb` - Rails initializers

---

## 📋 Summary

| Category | Count | Key Files |
|----------|-------|-----------|
| Controllers | 3 | galleries, images, home |
| Models | 2 | gallery, image |
| Views | 6 | index, show, new, edit, home |
| Migrations | 2 | create_galleries, create_images |
| Stylesheets | 1 | application.css |
| Documentation | 4 | README, DEVELOPMENT, SETUP_COMPLETE |
| Config Files | 5+ | routes, database, application |

---

This complete file index should help you navigate the Gallery Site project and understand where each piece of functionality is located.

**Last Updated**: November 11, 2025
**Rails Version**: 7.1.6
**Ruby Version**: 3.4.7
