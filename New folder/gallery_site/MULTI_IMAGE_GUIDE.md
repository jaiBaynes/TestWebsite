# Multi-Image Carousel Guide

Your character pages now support multiple images that automatically display in a carousel!

## 🎨 Features

- **Multiple Images per Character**: Show different poses, outfits, or angles
- **Automatic Carousel**: Images rotate automatically every 5 seconds
- **Navigation Controls**: Previous/Next buttons and dot indicators
- **Keyboard Support**: Use arrow keys to navigate
- **Seamless Loop**: Carousel loops endlessly
- **Responsive**: Works on desktop and mobile

## 📁 Setup Instructions

### Step 1: Prepare Your Images

1. Download/create multiple images for each character
2. Name them following this pattern:
   - `charactername_1.png` - First carousel image
   - `charactername_2.png` - Second carousel image
   - `charactername_3.png` - Third carousel image
   - etc.

**Example for Kat:**
```
kat_1.png  (Kat in standing pose)
kat_2.png  (Kat in action pose)
kat_3.png  (Kat in casual outfit)
```

### Step 2: Place Images in Folder

Put all images in:
```
public/images/characters/
```

### Step 3: Register Images in Database

Run this command for each character:

```bash
cd "/Users/jaidenbaynes/Documents/GitHub/TestWebsite/New folder/gallery_site"
rails "images:add_to_character[Kat]"
rails "images:add_to_character[Python]"
rails "images:add_to_character[Cerberus]"
```

**Note:** Use quotes around the task name for zsh shell!

### Step 4: View Your Carousel

Visit the character page:
```
http://localhost:3002/galleries/2/images/4  (Kat)
http://localhost:3002/galleries/2/images/5  (Python)
http://localhost:3002/galleries/2/images/6  (Cerberus)
```

## 🛠️ Useful Commands

### List all character images
```bash
rails "images:list"
```

### Add images to a specific character
```bash
rails "images:add_to_character[CharacterName]"
```

### Clear images from a character
```bash
rails "images:clear[CharacterName]"
```

### Clear all character images
```bash
rails "images:clear"
```

## 📝 Image Naming Examples

### Kat (3 poses)
```
public/images/characters/
├── kat.png         (main image - shown on gallery page)
├── kat_1.png       (carousel image 1)
├── kat_2.png       (carousel image 2)
└── kat_3.png       (carousel image 3)
```

### Python (5 poses)
```
public/images/characters/
├── python.png      (main image)
├── python_1.png    (carousel image 1)
├── python_2.png    (carousel image 2)
├── python_3.png    (carousel image 3)
├── python_4.png    (carousel image 4)
└── python_5.png    (carousel image 5)
```

## 🎯 How It Works

1. **Single Image**: If no additional images are added, shows just the main image (no carousel)
2. **Multiple Images**: Automatically detects additional images and creates carousel
3. **Gallery Page**: Always shows the main image (`kat.png`)
4. **Character Page**: Shows carousel with all additional images (`kat_1.png`, `kat_2.png`, etc.)

## 💡 Tips

- **Image Quality**: Use consistent image sizes for best results (recommended: 400x500px)
- **File Formats**: Supports PNG, JPG, GIF, WEBP
- **Naming**: Keep names lowercase and use underscores
- **Order**: Images are sorted by number (1, 2, 3...), not alphabetically
- **Performance**: Limit to 10-15 images per character for best performance

## 🐛 Troubleshooting

### Images not showing?
1. Check file names match exactly (case-sensitive)
2. Ensure files are in `public/images/characters/`
3. Run `rails "images:list"` to verify database entries
4. Refresh your browser (Cmd+Shift+R)

### Carousel not working?
1. Verify you have multiple images (carousel requires 2+)
2. Check browser console for JavaScript errors
3. Ensure images are registered: `rails "images:add_to_character[Name]"`

### Need to update images?
1. Replace the image files in the folder
2. Re-run: `rails "images:add_to_character[CharacterName]"`
3. Refresh your browser

## 🎉 Example Workflow

```bash
# 1. Place your images
# Put kat_1.png, kat_2.png, kat_3.png in public/images/characters/

# 2. Register them
cd "/Users/jaidenbaynes/Documents/GitHub/TestWebsite/New folder/gallery_site"
rails "images:add_to_character[Kat]"

# Output:
# Found 3 images for Kat:
#   - kat_1.png
#   - kat_2.png
#   - kat_3.png
# 
# ✅ Added: kat_1.png (position 0)
# ✅ Added: kat_2.png (position 1)
# ✅ Added: kat_3.png (position 2)
# 
# 🎉 Successfully added 3 images to Kat!

# 3. View the carousel
# Open http://localhost:3002/galleries/2/images/4
```

That's it! Your character now has a beautiful image carousel! 🚀

