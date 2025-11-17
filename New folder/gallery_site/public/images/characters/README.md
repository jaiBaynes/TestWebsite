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

## File Format:
- Recommended: PNG or JPG
- File names must match exactly (lowercase)
- Use underscores for multiple images

## How It Works:

### Single Image (Default)
If you only have one image per character, just use the main name:
- `kat.png` - Will display as a single image

### Multiple Images (Carousel)
Add multiple images and they'll automatically appear in a carousel:
- `kat_1.png` - First image in carousel
- `kat_2.png` - Second image in carousel
- `kat_3.png` - Third image in carousel

**The carousel will:**
- Show navigation arrows (< >)
- Display dots for each image
- Auto-advance every 5 seconds
- Support keyboard navigation (arrow keys)
- Loop endlessly

## Image URLs:
Once placed, images will be accessible at:
- `/images/characters/kat.png`
- `/images/characters/kat_1.png`
- `/images/characters/python.png`
- etc.

These URLs will work both in development and when the site is deployed live!

## Setup Instructions:

1. Download your images from Google Drive
2. Rename them following the naming convention above
3. Place them in this folder: `public/images/characters/`
4. Run this command to register them in the database:
   ```bash
   rails runner "script to add images" # See seeds.rb for examples
   ```
5. Refresh your browser at http://localhost:3002

