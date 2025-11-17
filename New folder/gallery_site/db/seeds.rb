# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Clear existing data to prevent ID bloat during development
puts "🧹 Clearing existing data..."
CharacterImage.destroy_all
Image.destroy_all
Gallery.destroy_all

# Reset ID counters for SQLite
puts "🔄 Resetting ID counters..."
if ActiveRecord::Base.connection.adapter_name == 'SQLite'
  ActiveRecord::Base.connection.execute("DELETE FROM sqlite_sequence WHERE name='character_images'")
  ActiveRecord::Base.connection.execute("DELETE FROM sqlite_sequence WHERE name='images'")
  ActiveRecord::Base.connection.execute("DELETE FROM sqlite_sequence WHERE name='galleries'")
else
  # For PostgreSQL/MySQL
  ActiveRecord::Base.connection.reset_pk_sequence!('character_images')
  ActiveRecord::Base.connection.reset_pk_sequence!('images')
  ActiveRecord::Base.connection.reset_pk_sequence!('galleries')
end

puts "✨ Starting fresh seed...\n"

# Helper method to load carousel images for a character
def load_character_images(character)
  base_name = character.name.downcase
  images_dir = Rails.root.join('public', 'images', 'characters')
  
  # Find all matching image files
  all_files = Dir.glob(images_dir.join("#{base_name}_*.{png,jpg,jpeg,gif,webp}"))
                 .sort
                 .map { |f| File.basename(f) }
  
  return if all_files.empty?
  
  # Separate preview/thumbnail from carousel images
  preview_file = all_files.find { |f| f.match?(/_preview|_thumb/) }
  image_files = all_files.reject { |f| f.match?(/_preview|_thumb/) }
  
  position = 0
  
  # Add preview/thumbnail first (position -1 for priority)
  if preview_file
    character.character_images.create!(
      image_path: "/images/characters/#{preview_file}",
      position: -1
    )
    puts "  📸 Added preview: #{preview_file}"
  end
  
  # Add carousel images
  image_files.each do |filename|
    character.character_images.create!(
      image_path: "/images/characters/#{filename}",
      position: position
    )
    puts "  🎠 Added carousel: #{filename}"
    position += 1
  end
end

# Clear existing data
Gallery.destroy_all
Image.destroy_all

# Create Characters Gallery
characters_gallery = Gallery.create!(
  title: "Underworld",
  description: "Meet the many residents of the Underworld. Click on each character to learn more about them.",
  category: "characters"
)

# Character 1: Hades
hades = Image.create!(
  gallery: characters_gallery,
  name: "Hades",
  quote: "TODO",
  family: "TODO",
  biography: "TODO",
  image_url: "/images/characters/hades.png",
  artist: "TODO",
  myth_inspiration: "TODO",
  powers: "TODO",
  home: "TODO"
)
load_character_images(hades)

# Character 2: Cerberus
cerberus = Image.create!(
  gallery: characters_gallery,
  name: "Cerberus",
  quote: "Loyalty is everything",
  family: "Kat (younger sister), Python (younger brother), Hades (adoptive father), Typhon (biological father), Echidna (biological mother)",
  biography: "Cerberus is a formidable and protective character known for unwavering loyalty and fierce determination. With a commanding presence and strong moral compass, Cerberus serves as both guardian and mentor. Their courage and dedication inspire those around them to be their best selves.",
  image_url: "/images/characters/cerberus.png",
  artist: "bentejam (BENTE), the.creature.keeper (Patricio Perez)",
  myth_inspiration: "In mythology, Cerberus is the three headed dog that guards the entrance to the underworld. Most know that Cerberus is the son of Typhon and Echidna and but few know that he has a 2 headed dog brother named Orthrus. This Cerberus adaptation is a 'What-If' Hades adopted yet another multi-headed dog sibling, this time female instead of two headed. As the adopted daughter of Hades, this Cerberus is also heavily influenced by Athena, the daughter of Zeus.",
  powers: "Shapeshifting, Shadow Manipulation, Familiar Creation,Teleportation, Hellfire, Microcosm: Doghouse, Extra Lives",
  home: "Underworld"
)
load_character_images(cerberus)

# Character 3: Kat
kat = Image.create!(
  gallery: characters_gallery,
  name: "Kat",
  quote: "Curiosity is my greatest strength",
  family: "Python (twin brother),Cerberus (older sister), Hades (adoptive father), Typhon (biological father), Echidna (biological mother)",
  biography: "Kat is a mysterious and intelligent character known for their keen observation skills and strategic thinking. With a background in problem-solving, Kat often finds unconventional solutions to complex challenges. Their calm demeanor and analytical mind make them an invaluable member of any team.",
  image_url: "/images/characters/kat.png",
  artist: "bentejam (BENTE), samiraim_ (San), kat_kay_tee (Kaytee)",
  myth_inspiration: "No direct mythological basis; original character. Instead Kat is based on the concept of Schroddingers Cat: a cat that is both alive and dead until it is observed. Since her twin brother Python is a parallel to Apollo, Kat has some parallels to Artemis (Apollo's twin sister).",
  powers: "Probability Offseting, Life and Death, Superposition, Teleportation, Hellfire",
  home: "Elysium"
)
load_character_images(kat)

# Character 4: Python
python = Image.create!(
  gallery: characters_gallery,
  name: "Python",
  quote: "Every loop leads somewhere new",
  family: "Kat (twin sister), Cerberus (older sister), Hades (adoptive father), Typhon (biological father), Echidna (biological mother)",
  artist: "Meiko (meikkochi_)",
  myth_inspiration: "Python the original god of delphi that took the form of a giant snake. Over time the character of Python went from being a female goddess with future sight to being reimagined as the evil monster brother of Typhon.",
  powers: "Python has the ability to glimpse the near future using his AI called Oracle. Python as a genius inventor has many powerful automatons, suits of armor and weapons at his disposal. Python has the ability to create and control 'hellfire' a supernatural flame that can burn even intagible targets and negate healing.",
  home: "Elysium",
  biography: "Python is an innovative and forward-thinking character who thrives on continuous learning and adaptation. With a natural gift for seeing patterns and connections, Python excels at breaking down complex problems into manageable parts. Their flexibility and quick thinking make them an asset in any situation.",
  image_url: "/images/characters/python.png"
)
load_character_images(python)




# Character 5: Megaera
megaera = Image.create!(
  gallery: characters_gallery,
  name: "Megaera",
  quote: "TODO",
  family: "TODO",
  biography: "TODO",
  image_url: "/images/characters/megaera.png",
  artist: "TODO",
  myth_inspiration: "TODO",
  powers: "TODO",
  home: "TODO"
)
load_character_images(megaera)

# Create Locations Gallery (placeholder)
locations_gallery = Gallery.create!(
  title: "Key Locations",
  description: "Explore the mystical places and diverse worlds where our adventures unfold.",
  category: "locations"
)

# Create Items Gallery (placeholder)
items_gallery = Gallery.create!(
  title: "Legendary Items",
  description: "Discover powerful artifacts, weapons, and treasures from across the realms.",
  category: "items"
)

puts "\n✅ Created Characters gallery with Kat, Python, Cerberus, Hades, and Megaera!"
puts "✅ Created Locations gallery (ready for content)"
puts "✅ Created Items gallery (ready for content)"
puts "\n🎉 All character carousel images loaded automatically!"