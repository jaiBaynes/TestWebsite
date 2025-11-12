# Gallery Site - Update v2.0: Character Gallery

## What's Changed

The Gallery Site has been transformed from a user-upload image gallery into a **curated character gallery** with rich character profiles. This update makes it perfect for displaying pre-existing characters with detailed information.

## 🎭 New Features

### 1. **Character Profiles**
- Each character now has:
  - **Name**: Character's display name
  - **Quote**: An inspirational or iconic quote
  - **Biography**: Detailed character description
  - **Image**: Character artwork from Google Drive or placeholder

### 2. **Google Drive Image Integration**
- Images are loaded from Google Drive using direct URLs
- Fallback to SVG placeholder if image fails to load
- No need to upload images manually
- Easy to update character images by changing the Google Drive URL

### 3. **Character Detail Page**
- Click on any character to see their full profile
- Large character image display
- Full biography text
- Character quote in styled section
- Navigation back to gallery

### 4. **Pre-seeded Characters**
Database comes with 3 sample characters:
- **Kat** - "Curiosity is my greatest strength"
- **Python** - "Every loop leads somewhere new"
- **Cerberus** - "Loyalty is everything"

## 📁 Database Changes

### Images Table
**Old Fields:**
- caption
- image_file (file attachment)

**New Fields:**
- name (character name)
- quote (character quote)
- biography (full character description)
- image_url (Google Drive image URL)

### No More File Uploads
- Removed `has_one_attached :image_file`
- No upload forms in the UI
- Images loaded from URLs instead

## 🛣️ Route Changes

### New Routes
```
GET /galleries/:gallery_id/images/:id  → Show character detail page
```

### Removed Routes
```
POST /galleries/:gallery_id/images     → Create image (REMOVED)
```

## 📄 File Changes

### Models
- `app/models/image.rb` - Updated validations for character fields

### Controllers
- `app/controllers/images_controller.rb` - Removed create action, added show action

### Views
- `app/views/galleries/show.html.erb` - Removed upload form, updated to show character cards
- `app/views/images/show.html.erb` - NEW character detail page

### Styling
- Updated CSS for character cards with quote preview
- Added styling for character detail page

### Database
- `db/seeds.rb` - NEW file with 3 character samples

## 🔗 Google Drive Integration

### How It Works
Images are referenced using Google Drive's direct access URLs format:
```
https://drive.google.com/uc?export=view&id=FILE_ID
```

### How to Add Your Images
1. Upload images to your Google Drive folder
2. Right-click image → Get link
3. Copy the file ID from the shareable link
4. Update the image_url in seeds.rb or database with: `https://drive.google.com/uc?export=view&id=YOUR_FILE_ID`

### Fallback Placeholder
If Google Drive image fails to load, an SVG placeholder appears:
```
[Character Image]
```

This ensures the gallery always displays properly, even if links break.

## 🚀 Setting Up

### First Time Setup
```bash
cd gallery_site
bundle install
rails db:create
rails db:migrate
rails db:seed
rails server
```

### Reset Database
If you want to reseed with fresh character data:
```bash
rails db:reset
rails db:seed
```

### Update Character Images
Edit `db/seeds.rb` and change the `image_url` values:
```ruby
Image.create!(
  gallery: gallery,
  name: "Kat",
  quote: "Curiosity is my greatest strength",
  biography: "...",
  image_url: "https://drive.google.com/uc?export=view&id=YOUR_FILE_ID"
)
```

Then reseed:
```bash
rails db:seed
```

## 📸 Example Character Data

### Kat
- **Quote:** "Curiosity is my greatest strength"
- **Bio:** Mysterious and intelligent, known for observation skills
- **Image:** From Google Drive (customize with your image)

### Python
- **Quote:** "Every loop leads somewhere new"
- **Bio:** Innovative and forward-thinking, thrives on learning
- **Image:** From Google Drive (customize with your image)

### Cerberus
- **Quote:** "Loyalty is everything"
- **Bio:** Formidable and protective, unwavering loyalty
- **Image:** From Google Drive (customize with your image)

## 🎨 Character Card Display

Each character appears as a card showing:
```
┌─────────────────────┐
│   Character Image   │
├─────────────────────┤
│ Character Name (large)
│ "Character quote"
│ [View Profile]
└─────────────────────┘
```

Clicking "View Profile" opens the full character detail page.

## 📋 Character Detail Page

Shows:
- Large character image (500x600px)
- Character name as heading
- Inspirational quote in colored section
- Full biography text
- Gallery navigation

## 🔐 Admin Delete (Future)

Admin function to delete characters is prepared but currently disabled:
```erb
<% if current_user_admin? %>
  <%= button_to 'Delete', gallery_image_path(@gallery, @image), 
                method: :delete, class: 'btn btn-danger' %>
<% end %>
```

To enable, implement user authentication and update `current_user_admin?` helper.

## 🔧 Customization

### Change Gallery Title
Edit `db/seeds.rb`:
```ruby
gallery = Gallery.create!(
  title: "Your Gallery Title",
  description: "Your gallery description"
)
```

### Add More Characters
Add to `db/seeds.rb`:
```ruby
Image.create!(
  gallery: gallery,
  name: "New Character",
  quote: "Character quote",
  biography: "Character bio...",
  image_url: "https://drive.google.com/uc?export=view&id=FILE_ID"
)
```

Then reseed: `rails db:seed`

### Style Changes
- Character card styling: `app/assets/stylesheets/application.css`
- Character detail page: Inline CSS in `app/views/images/show.html.erb`

## 📱 Responsive Design

- **Desktop**: Character cards in responsive grid
- **Tablet**: 2-3 columns
- **Mobile**: Single column layout

## ✅ Testing

To test locally:
1. Start server: `rails server`
2. Open: http://localhost:3000
3. Click "Galleries" or navigate to /galleries
4. Click on a character card
5. View their full profile

## 🔄 Migration from Old Version

If upgrading from v1:
1. Run `rails db:reset` - this drops old tables and creates new ones
2. Run `rails db:seed` - seeds with new character data
3. Old uploaded images are lost - use Google Drive URLs instead

## 📚 Next Enhancements

Possible future features:
- User authentication for admin deletion
- Character search/filter
- Character relationships/interactions
- Character tags/categories
- Comment system on characters
- Rating system
- Character statistics/attributes
- Timeline or story progression

## 🎯 Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| Image Source | File upload | Google Drive URL |
| Character Info | Just caption | Name, quote, bio |
| Upload Forms | Yes | No |
| Character Detail | Simple | Full profile page |
| Sample Data | None | Kat, Python, Cerberus |
| Image Display | Active Storage | Direct URL |
| Fallback | None | SVG placeholder |

---

**Version:** 2.0
**Date:** November 11, 2025
**Status:** Ready for customization with your Google Drive images
