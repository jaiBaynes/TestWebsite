# Adding New Fields to Characters

This guide explains how to add new information fields to characters in the Gallery Site.

## 📋 Quick Reference

**Current Character Fields:**
- `name` - Character name
- `quote` - Character's signature quote
- `biography` - Character background story
- `image_url` - Main image path
- `artist` - Artist(s) who created the character art
- `family` - Character's family relationships
- `myth_inspiration` - Mythological basis for the character
- `powers` - Character abilities and powers
- `home` - Where the character lives

## 🔧 Steps to Add a New Field

### Step 1: Generate a Migration

Create a database migration to add the new column:

```bash
cd "/Users/jaidenbaynes/Documents/GitHub/TestWebsite/New folder/gallery_site"
rails generate migration AddFieldNameToImages field_name:type
```

**Field Types:**
- `string` - Short text (< 255 characters) - Use for: artist, home, name
- `text` - Long text (unlimited) - Use for: biography, powers, family, myth_inspiration
- `integer` - Whole numbers
- `boolean` - True/false values
- `date` - Date values

**Examples:**
```bash
# Add a short text field
rails generate migration AddNicknameToImages nickname:string

# Add a long text field
rails generate migration AddWeaknessesToImages weaknesses:text

# Add a number field
rails generate migration AddAgeToImages age:integer

# Add a true/false field
rails generate migration AddIsVillainToImages is_villain:boolean
```

### Step 2: Run the Migration

Apply the database changes:

```bash
rails db:migrate
```

**What this does:** Creates the new column in the `images` table in the database.

### Step 3: Update Seeds File

Add the new field to `db/seeds.rb` for each character:

```ruby
# Character 1: Kat
kat = Image.create!(
  gallery: characters_gallery,
  name: "Kat",
  quote: "Curiosity is my greatest strength",
  family: "Python (twin brother), Cerberus (older sister)...",
  nickname: "The Observer",  # ← Your new field
  # ... other fields
)
```

**Tips:**
- Add the field to ALL characters (use "Todo" for incomplete data)
- Keep the same format for consistency
- Use quotes for string/text values

### Step 4: Display the Field (Optional)

Update `app/views/images/show.html.erb` to display the new field on character pages.

**Location:** Find the "character-details-section" around line 47-74.

**Add this code:**

```erb
<div class="detail-item">
  <strong>Your Field Label:</strong>
  <p><%= @image.field_name %></p>
</div>
```

**For multi-line text fields, use `simple_format`:**

```erb
<div class="detail-item">
  <strong>Your Field Label:</strong>
  <p><%= simple_format(@image.field_name) %></p>
</div>
```

**Full Example:**

```erb
<div class="detail-item">
  <strong>Nickname:</strong>
  <p><%= @image.nickname %></p>
</div>

<div class="detail-item">
  <strong>Weaknesses:</strong>
  <p><%= simple_format(@image.weaknesses) %></p>
</div>
```

**Where to place it:**
- Inside the `.character-details-section` div
- Between other detail items
- Order doesn't matter, choose what makes sense!

### Step 5: Seed the Database

Populate the database with your new data:

```bash
rails db:seed
```

**What happens:**
- Clears existing data
- Creates all galleries and characters
- Loads all character images automatically
- Includes your new field data

### Step 6: Verify

Refresh your browser and check a character page:
```
http://localhost:3002/galleries/[id]/images/[id]
```

You should see your new field displayed!

## 📚 Complete Example: Adding "Alignment" Field

Let's walk through a complete example of adding an "alignment" field (Good/Neutral/Evil):

### 1. Generate Migration
```bash
rails generate migration AddAlignmentToImages alignment:string
```

### 2. Run Migration
```bash
rails db:migrate
```

### 3. Update Seeds (`db/seeds.rb`)
```ruby
kat = Image.create!(
  gallery: characters_gallery,
  name: "Kat",
  quote: "Curiosity is my greatest strength",
  alignment: "Chaotic Neutral",  # ← New field
  # ... rest of fields
)

python = Image.create!(
  gallery: characters_gallery,
  name: "Python",
  quote: "Every loop leads somewhere new",
  alignment: "Lawful Good",  # ← New field
  # ... rest of fields
)

cerberus = Image.create!(
  gallery: characters_gallery,
  name: "Cerberus",
  quote: "Loyalty is everything",
  alignment: "Lawful Good",  # ← New field
  # ... rest of fields
)
```

### 4. Update View (`app/views/images/show.html.erb`)

Find the character-details-section and add:

```erb
<div class="detail-item">
  <strong>Alignment:</strong>
  <p><%= @image.alignment %></p>
</div>
```

### 5. Seed Database
```bash
rails db:seed
```

### 6. Done! 
Open a character page and see your new "Alignment" field displayed.

## 🎨 Styling Tips

The detail items automatically inherit styling from `.detail-item` in the view file.

**Current styling:**
- Labels are purple (`color: #667eea`)
- Labels are bold and slightly smaller
- Content has nice line spacing
- Consistent margins between items

**To customize a specific field**, you can add a custom class:

```erb
<div class="detail-item special-field">
  <strong>Your Field:</strong>
  <p><%= @image.field_name %></p>
</div>
```

Then add CSS in `app/views/images/show.html.erb` after the existing styles:

```css
.special-field strong {
  color: #ff6b6b;  /* Custom color */
  font-size: 1.1em;
}
```

## 🔍 Troubleshooting

### Error: "unknown attribute 'field_name'"
**Problem:** Migration hasn't been run.
**Solution:** Run `rails db:migrate`

### Field doesn't appear on page
**Problem 1:** Forgot to update the view file.
**Solution:** Add the field display code to `app/views/images/show.html.erb`

**Problem 2:** Forgot to seed the database.
**Solution:** Run `rails db:seed`

### Data not showing after seeding
**Problem:** Seeds file has the field in the wrong format.
**Solution:** Check that field names match exactly (use underscore, not camelCase)

**Wrong:**
```ruby
mythInspiration: "text"  # ❌ Wrong
```

**Right:**
```ruby
myth_inspiration: "text"  # ✅ Correct
```

## 📝 Field Naming Conventions

**Database/Model:**
- Use `snake_case`: `myth_inspiration`, `home_world`, `power_level`

**Display Labels:**
- Use Title Case: "Mythological Inspiration", "Home World", "Power Level"

**Example:**
```ruby
# In seeds.rb
myth_inspiration: "Based on Apollo"

# In view
<strong>Mythological Inspiration:</strong>
<p><%= simple_format(@image.myth_inspiration) %></p>
```

## 🚀 Quick Command Reference

```bash
# 1. Generate migration
rails generate migration AddFieldNameToImages field_name:type

# 2. Run migration
rails db:migrate

# 3. Seed database (after updating seeds.rb)
rails db:seed

# 4. Check everything loaded
rails "images:list"

# 5. Undo last migration (if you made a mistake)
rails db:rollback

# 6. Check database structure
rails db:schema:dump
```

## 💡 Best Practices

1. **Always use migrations** - Never manually edit the database
2. **Use descriptive field names** - `alignment` not `a`, `home_world` not `hw`
3. **Choose the right type** - `text` for long content, `string` for short
4. **Update all characters** - Use "Todo" if you don't have data yet
5. **Test after adding** - View a character page to verify it works
6. **Keep documentation updated** - Add new fields to this list

## 📊 Field Type Guide

| Type | Max Size | Best For | Example |
|------|----------|----------|---------|
| `string` | 255 chars | Names, short labels | artist, home, nickname |
| `text` | Unlimited | Long descriptions | biography, powers, myth_inspiration |
| `integer` | Standard int | Numbers, counts | age, power_level, kill_count |
| `boolean` | true/false | Yes/No questions | is_villain, can_fly, is_immortal |
| `date` | Date | Dates only | birth_date, death_date |
| `datetime` | Date+Time | Date and time | created_at, updated_at |

## 🎯 Common Fields to Consider Adding

**Character Details:**
- `nickname` - Character's nickname or alias
- `alignment` - Moral alignment (Good/Evil/Neutral)
- `species` - What type of being they are
- `age` - Character's age
- `height` - Character's height
- `weapon` - Primary weapon
- `affiliation` - Group/faction they belong to

**Story Elements:**
- `backstory` - Additional background information
- `goals` - Character's motivations
- `fears` - What the character fears
- `strengths` - Character strengths (non-power)
- `weaknesses` - Character vulnerabilities

**Meta Information:**
- `debut_date` - When character was first introduced
- `voice_actor` - If applicable
- `theme_song` - Character's theme music

Remember: Each new field requires all 5 steps above!

