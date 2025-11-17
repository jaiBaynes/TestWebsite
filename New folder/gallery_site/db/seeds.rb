# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Clear existing data
Gallery.destroy_all
Image.destroy_all

# Create Characters Gallery
characters_gallery = Gallery.create!(
  title: "Main Characters",
  description: "Meet the main characters from our world. Click on each character to learn more about them.",
  category: "characters"
)

# Character 1: Kat
Image.create!(
  gallery: characters_gallery,
  name: "Kat",
  quote: "Curiosity is my greatest strength",
  biography: "Kat is a mysterious and intelligent character known for their keen observation skills and strategic thinking. With a background in problem-solving, Kat often finds unconventional solutions to complex challenges. Their calm demeanor and analytical mind make them an invaluable member of any team.",
  image_url: "/images/characters/kat.png"
)

# Character 2: Python
Image.create!(
  gallery: characters_gallery,
  name: "Python",
  quote: "Every loop leads somewhere new",
  biography: "Python is an innovative and forward-thinking character who thrives on continuous learning and adaptation. With a natural gift for seeing patterns and connections, Python excels at breaking down complex problems into manageable parts. Their flexibility and quick thinking make them an asset in any situation.",
  image_url: "/images/characters/python.png"
)

# Character 3: Cerberus
Image.create!(
  gallery: characters_gallery,
  name: "Cerberus",
  quote: "Loyalty is everything",
  biography: "Cerberus is a formidable and protective character known for unwavering loyalty and fierce determination. With a commanding presence and strong moral compass, Cerberus serves as both guardian and mentor. Their courage and dedication inspire those around them to be their best selves.",
  image_url: "/images/characters/cerberus.png"
)

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

puts "✅ Created Characters gallery with Kat, Python, and Cerberus!"
puts "✅ Created Locations gallery (ready for content)"
puts "✅ Created Items gallery (ready for content)"