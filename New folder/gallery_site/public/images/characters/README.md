# Character Images

Place your character images in this folder.

## Naming Convention:

### Main Character Images (shown on gallery page):
1. **kat.png** - Main image for Kat character
2. **python.png** - Main image for Python character  
3. **cerberus.png** - Main image for Cerberus character

### Multiple Images Per Character (for carousel):
Add numbered variations for different poses/outfits:
- **kat_1.png**, **kat_2.png**, **kat_3.png**, etc.
- **python_1.png**, **python_2.png**, **python_3.png**, etc.
- **cerberus_1.png**, **cerberus_2.png**, **cerberus_3.png**, etc.

### Preview/Thumbnail Images (for gallery card):
Add a special preview image for better gallery display:
- **kat_preview.png** or **kat_thumb.png** - Cropped/zoomed for gallery card
- **python_preview.png** or **python_thumb.png**
- **cerberus_preview.png** or **cerberus_thumb.png**

**Note:** Preview images are shown on the gallery card but NOT in the carousel!

## File Format:
- Recommended: PNG or JPG
- File names must match exactly (lowercase)
- Use underscores for multiple images

## How It Works:

### Single Image (Default)
If you only have one image per character, just use the main name:
- `kat.png` - Will display everywhere

### Multiple Images (Carousel)
Add multiple images and they'll automatically appear in a carousel:
- `kat_1.png` - First image in carousel
- `kat_2.png` - Second image in carousel
- `kat_3.png` - Third image in carousel

### Preview + Carousel (Best Option!)
For the best display, use a preview image for the gallery card:
- `python_preview.png` - Cropped for gallery card (face/upper body)
- `python_1.png` - Full body shot in carousel
- `python_2.png` - Action pose in carousel
- `python_3.png` - Alternate outfit in carousel

**The carousel will:**
- Show navigation arrows (< >)
- Display dots for each image
- Auto-advance every 5 seconds
- Support keyboard navigation (arrow keys)
- Loop endlessly
- Exclude preview images (they're only for gallery cards!)

## Image URLs:
Once placed, images will be accessible at:
- `/images/characters/kat.png`
- `/images/characters/kat_1.png`
- `/images/characters/python.png`
- etc.

These URLs will work both in development and when the site is deployed live!

## Setup Instructions:

### For Main Images (Single image per character):
1. Download your images from Google Drive
2. Rename them to: `kat.png`, `python.png`, `cerberus.png`
3. Place them in this folder: `public/images/characters/`
4. Refresh your browser at http://localhost:3002

### For Multiple Images (Carousel):
1. Download/create multiple images for each character
2. Rename them to: `kat_1.png`, `kat_2.png`, `kat_3.png`, etc.
3. Place them in this folder: `public/images/characters/`
4. Run this command to register them:
   ```bash
   cd "/Users/jaidenbaynes/Documents/GitHub/TestWebsite/New folder/gallery_site"
   rails "images:add_to_character[Kat]"
   ```
   Note: Use quotes around the task name for zsh shell!
5. Refresh the character page at http://localhost:3002

