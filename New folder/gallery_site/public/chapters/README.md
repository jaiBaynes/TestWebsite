# Chapter System Guide

## Overview

The chapter system allows you to create rich, themed story content with:
- **Markdown formatting** for beautiful text layout
- **Automatic character linking** - character names are automatically linked to their profiles
- **Image support** - embed artwork and illustrations
- **Text-to-speech** - readers can listen to chapters being read aloud
- **Themed styling** - dark background with golden text matching your site aesthetic

## Directory Structure

```
public/chapters/
  ├── bonus chapters/
  │   └── Hercules vs Apollo.md
  ├── act1/
  ├── act2/
  └── act3/

public/images/chapters/
  ├── hercules_armor.png
  ├── battle_scene.png
  └── ...
```

## Creating a New Chapter

### Step 1: Write Your Chapter (Markdown File)

Create a `.md` file in the appropriate folder:

```markdown
*Myth 1.5: Hercules at Delphi

Jupiter had charged Zeus with upholding Fate. Zeus at once...got someone else to do it. But who could accomplish such a monumental task? Who else but the rising star: Hercules, the son of Zeus!

Artwork: Hercules by bentejam

After his latest victory over Zeus's enemies, Hercules arrived victorious in Delphi, the city of Apollo.

![Hercules in golden armor](/images/chapters/hercules_armor.png)

The ground trembled as Hercules stepped into the clearing...
```

### Step 2: Add Images (Optional)

Place any chapter images in `public/images/chapters/`:

```markdown
![Image description](/images/chapters/your_image.png)
```

### Step 3: Register in Database

Add the chapter to `db/seeds.rb`:

```ruby
chapter_name = Chapter.create!(
  title: "Your Chapter Title",
  slug: "your-chapter-title",  # URL-friendly version
  category: "bonus_chapters",  # or "act1", "act2", "act3"
  chapter_number: 1,          # optional, for sequential chapters
  file_path: "chapters/bonus chapters/Your Chapter.md",
  published: true
)

puts "  ✅ Created chapter: #{chapter_name.title}"
```

Then run:

```bash
rails db:seed
```

### Step 4: Link Characters to Unlock (Optional)

If your chapter should unlock specific characters when completed:

```ruby
# After creating the chapter, link it to unlockable characters
apollo = Image.find_by(name: "Apollo")
if apollo
  your_chapter.unlockable_characters << apollo
  puts "  🔓 Your chapter will unlock: Apollo"
end
```

**Example from seeds.rb:**

```ruby
hercules_vs_apollo = Chapter.create!(
  title: "Myth 1.5: Hercules at Delphi",
  slug: "hercules-at-delphi",
  category: "bonus_chapters",
  file_path: "chapters/bonus chapters/Hercules vs Apollo.md",
  published: true
)

# Link Apollo as an unlockable character
apollo_char = Image.find_by(name: "Apollo")
if apollo_char
  hercules_vs_apollo.unlockable_characters << apollo_char
  puts "  🔓 Hercules at Delphi will unlock: Apollo"
end
```

**How it works:**
1. Reader navigates to the chapter and reads it
2. At the bottom, they see: "💎 Complete this chapter to unlock: Apollo"
3. When they click "✨ Complete Chapter", Apollo is unlocked
4. The unlock modal appears showing Apollo's preview image
5. Apollo now appears in the Olympia gallery and can be visited

## Markdown Features

### Basic Formatting

```markdown
**Bold text**
*Italic text*
```

### Headers

```markdown
# Main Title
## Section Header
### Subsection
```

### Images with Artwork Credits

To display an image with a centered artwork caption below it:

```markdown
![Alt text for image](/images/characters/hercules_preview.png)
Artwork: Hercules by bentejam
```

**Important:** The "Artwork:" line must immediately follow the image with no blank line between them.

This will create a beautifully centered display with:
- The image centered on the page
- Golden artwork credit caption below
- Hover effects and proper styling
- Max width of 600px for optimal viewing

**Example from Hercules at Delphi:**

```markdown
![Hercules, the legendary hero](/images/characters/hercules_preview.png)
Artwork: Hercules by bentejam

After his latest victory over Zeus's enemies, Hercules arrived victorious in Delphi...
```

**Result:** The image appears centered with "Hercules by bentejam" in golden italics directly below it.

### Character Names (Auto-Linking)

Just write character names naturally in your text:

```markdown
Hercules challenged Apollo to a duel. Zeus watched from Olympus.
```

The system will automatically:
- Find "Hercules", "Apollo", and "Zeus" in your character database
- Turn them into clickable links to their profile pages
- Style them with the character-link CSS

## Categories

- **bonus_chapters**: Standalone stories, side stories, myths
- **act1**: Main story Act 1 chapters
- **act2**: Main story Act 2 chapters
- **act3**: Main story Act 3 chapters

## Tips

1. **Character Names**: Make sure character names in your markdown exactly match names in your database
2. **Image Paths**: Always use absolute paths starting with `/images/chapters/`
3. **File Naming**: Use descriptive names for markdown files (e.g., `Hercules vs Apollo.md`)
4. **Artwork Credits**: Use the "Artwork:" format to credit artists

## Example Full Chapter

```markdown
*Myth 2: The Hydra's Fall

Long ago, in the swamps of Lerna, a terrible beast made its lair. The Hydra, with nine serpentine heads, terrorized the countryside. No hero dared approach—until Hercules accepted the challenge.

Artwork: Hydra by giknow.art

![The Hydra in its swamp lair](/images/chapters/hydra_lair.png)

Hercules arrived at dawn, his club in hand. The Hydra sensed the hero's presence and rose from the murky waters, all nine heads hissing in unison.

"So, you're the monster terrorizing these lands," Hercules called out.

The Hydra's center head laughed. "And you're the fool who will become my breakfast!"

The battle was fierce. Each time Hercules cut off a head, two more grew in its place. It seemed hopeless—until Cerberus arrived with a burning torch.

![Epic battle scene](/images/chapters/hercules_hydra_battle.png)

"Brother!" Cerberus called out. "Burn the stumps before they regenerate!"

Working together, they finally defeated the beast. Hercules severed the heads while Cerberus cauterized the wounds with hellfire.

Victory was theirs.
```

## Updating Existing Chapters

1. Edit the markdown file directly in `public/chapters/`
2. Changes appear immediately (no need to reseed)
3. Refresh the page to see updates

## Troubleshooting

**Characters not linking?**
- Verify character name spelling matches database exactly
- Check that character is unlocked and exists

**Images not showing?**
- Verify image path is correct: `/images/chapters/filename.png`
- Check file exists in `public/images/chapters/`
- Ensure proper image format (png, jpg, jpeg, gif, webp)

**Chapter not appearing?**
- Make sure `published: true` in seeds.rb
- Verify you ran `rails db:seed`
- Check category is one of: bonus_chapters, act1, act2, act3

