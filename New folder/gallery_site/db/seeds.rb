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

# Create the Character Galleries

# Olympia Gallery
underworld_gallery = Gallery.create!(
  title: "Olympia",
  description: "Meet the many residents of the mortal city ofOlympia and the divine city of Olympus that floats above it. Click on each character to learn more about them.",
  category: "characters"
)

# Underworld Gallery
underworld_gallery = Gallery.create!(
  title: "Underworld",
  description: "Meet the many residents of the 'Underworld'. You might be surprised to find that they are different from what Zeus' myths would have you believe. Click on each character to learn more about them.",
  category: "characters"
)

# Character 1: Hades
hades = Image.create!(
  gallery: underworld_gallery,
  name: "Hades",
  quote: "A myth is a fiction, a king is a despot and a hero is anything but a hero is anything but a glory-hungry, bloodthirsty, rapacious evildoer...",
  family: "Terra Solaris/ Persephone (wife), Hecate ('sister'), Nyx (ex-lover), Cerberus (adoptive daughter), Kat (adoptive daughter), Python (adoptive son)",
  biography: "According to Olympus, Hades is the evil god of the 'Underworld' and arch-rival of Zeus. In truth he is a once obscure god of the Molossian mines that rose in prominance after marrying Terra Solaris. With his new clout he founded his own nation, the first democracy: Elysium and his since then fought for his ideals and to expand Elysium's prosperity across the Kosmos, no matter how much it violates the 'fated role' Hades is supposed to play.",
  image_url: "/images/characters/hades_preview.png",
  artist: "Me (Placeholder), Bentejam (BENTE), the.creature.keeper (Patricio Perez), akkurara (ramsha)",
  myth_inspiration: "In Mythology,Hades is the god of the underworld and the king of the dead. He is the son of Cronus and Rhea and the brother of Zeus and Poseidon. He is married to Persephone. A thing that interested me was the fact that according to some versions of myth, Hades was sterile and had no children. So I thought it would be cool to have Hades adopt lots of children and love them all despite no blood connection as a contrast to Zeus who has many biological children but is a complete asshole to most of them. Hades' character being focused on fatherhood is one of the many inspirtions I took from Odin, the Norse 'Allfather' as a fellow death god who I mixed with Hades. Third major inspiration from myth is the clever Greek hero Odysseus as a more positive reflection of the idea that the devil is an unreliable trickster(Zeus = Agamemnon, Poseidon = Diomedes and Hades = Odysseus).",
  powers: "Invisibility, Intangibility, Hellfire, Cthonic manipulation, Reanimation of the dead,Extra Lives, Fate Prediction",
  home: "Elysium",
  personality: "Clever, Cunning, Determineed/ Stubborn, Kind, Modest and Understated, Fatherly, Wise, Doting, Repentant",
  first_appearance: "Act 1",
  race: "Molossian Cthonic God (Immortal)",
  goal: "For the world to be a just and peaceful place... and for people to believe him when he says that."
)
load_character_images(hades)

# Character 2: Cerberus
cerberus = Image.create!(
  gallery: underworld_gallery,
  name: "Cerberus",
  quote: "I crushed a hundred like you today. I felled thousands before that... and I will continue putting invaders like you in the ground... until my home is finally safe.",
  family: "Kat (younger sister), Python (younger brother), Hades (adoptive father), Typhon (biological father), Echidna (biological mother)",
  biography: "Cerberus is a formidable and protective character known for unwavering loyalty and fierce determination. With a commanding presence and strong moral compass, Cerberus serves as both guardian and mentor. Their courage and dedication inspire those around them to be their best selves.",
  image_url: "/images/characters/cerberus_preview.png",
  artist: "bentejam (BENTE), giknnow.art (Gino Gaba), the.creature.keeper (Patricio Perez)",
  myth_inspiration: "In mythology, Cerberus is the three headed dog that guards the entrance to the underworld. Most know that Cerberus is the son of Typhon and Echidna and but few know that he has a 2 headed dog brother named Orthrus. This Cerberus adaptation is a 'What-If' Hades adopted yet another multi-headed dog sibling, this time female instead of two headed. As the adopted daughter of Hades, this Cerberus is also heavily influenced by Athena, the daughter of Zeus.",
  powers: "Invisibility, Intangibility, Shapeshifting, Shadow Manipulation, Familiar Creation,Teleportation, Hellfire, Microcosm: Doghouse, Extra Lives",
  home: "Underworld",
  personality: "Loyal, Stoic, Protective/ Overprotective, Brave, Secretly Doting, Concerned with image and reputation",
  first_appearance: "Act 1",
  race: "Demi-human Monster (Immortal)",
  goal: "To protect her home the Underworld and everyone in it."
)
load_character_images(cerberus)

# Character 3: Kat
kat = Image.create!(
  gallery: underworld_gallery,
  name: "Kat",
  quote: "Like my papa always says, curiosity is the key to success.",
  family: "Python (twin brother),Cerberus (older sister), Hades (adoptive father), Typhon (biological father), Echidna (biological mother)",
  biography: "Kat is a mysterious and intelligent character known for their keen observation skills and strategic thinking. With a background in problem-solving, Kat often finds unconventional solutions to complex challenges. Their calm demeanor and analytical mind make them an invaluable member of any team.",
  image_url: "/images/characters/kat_preview.png",
  artist: "bentejam (BENTE), samiraim_ (San), kat_kay_tee (Kaytee)",
  myth_inspiration: "No direct mythological basis; original character. Instead Kat is based on the concept of Schroddingers Cat: a cat that is both alive and dead until it is observed. Since her twin brother Python is a parallel to Apollo, Kat has some parallels to Artemis (Apollo's twin sister).",
  powers: "Invisibility, Intangibility, Probability Offseting, Life and Death, Superposition, Teleportation, Hellfire",
  home: "Elysium",
  personality: "Kind, Clever, Extroverted, Nerdy, Passionate, Idolizes Others/ lacks true self confidence, Nosy",
  first_appearance: "Act 1",
  race: "Demi-human Monster (Immortal)",
  goal: "To become a beloved Kosmonarch just like her father Hades. Then to retire and be a Diolkos conductor."
)
load_character_images(kat)

# Character 4: Python
python = Image.create!(
  gallery: underworld_gallery,
  name: "Python",
  quote: "I am a genius!",
  family: "Kat (twin sister), Cerberus (older sister), Hades (adoptive father), Typhon (biological father), Echidna (biological mother)",
  artist: "Meiko (meikkochi_), the.creature.keeper (Patricio Perez)",
  myth_inspiration: "Python the original god of delphi that took the form of a giant snake. Over time the character of Python went from being a female goddess with future sight to being reimagined as the evil monster brother of Typhon.",
  powers: "Future Sight, Hellfire, Mental link to his machines and automatons, Shapeshifting",
  home: "Elysium",
  biography: "Python is an innovative and forward-thinking character who thrives on continuous learning and adaptation. With a natural gift for seeing patterns and connections, Python excels at breaking down complex problems into manageable parts. Their flexibility and quick thinking make them an asset in any situation.",
  image_url: "/images/characters/python_preview.png",
  personality: "Arrogant, bratty, insecure, self-centered, Idolizes others, petty, dense/ ignorant of feelings",
  first_appearance: "Act 1",
  race: "Humanoid/ Monster (Immortal)",
  goal: "To be popular and cool."
)
load_character_images(python)

# Character 5: Terra Solaris
terra = Image.create!(
  gallery: underworld_gallery,
  name: "Terra Solaris",
  quote: "Why can't we all just get along?",
  family: "Hades (husband), Kat (daughter), Python (son), Cerberus (daughter), Mercury (brother), Venus (sister), Mars (brother), Jupiter (brother), Uranus (sister), Neptune (brother), Giants (creations)",
  biography: "A Solaris being that does not belong in Greek Mythology. Despite her terrifying power and unnatural existance, Terra Solaris is a disarmingly warm and kind woman to be around. She inserted herself into this Kosmos and assumed the roles of Gaia, Persephone, Hera and other goddesses. She wants to bring peace between her brother Jupiter (who has assumed the role of Zeus) and her husband Hades.",
  image_url: "/images/characters/terra solaris_preview.png",
  artist: "mortis_xyz (bokobunbun), bentejam (BENTE), darianelll (Dari Demchuk)",
  myth_inspiration: "Terra, Gaia, Persephone, Hera, Rhea",
  powers: "Power Cosmic (mastery of all natural forces)",
  home: "Elysium",
  personality: "Kind, Modest and Understated, Motherly, Wise, Doting, Repentant",
  first_appearance: "Act 3",
  race: "Solaris",
  goal: "For the world to be a just and peaceful place... and for people to believe her husband when he says the same."
)
load_character_images(terra)

# Character 6: Megaera
megaera = Image.create!(
  gallery: underworld_gallery,
  name: "Megaera",
  quote: "Injustice anywhere is a threat to justice everywhere.",
  family: "Nyx (mother), Erebus (father), Tisiphone (triplet sister), Alecto (triplet sister), Thanatos (brother), Hypnos (brother)",
  biography: "Megaera is one of the three Furies, the daughters of Nyx, the goddess of the night. She is the leader of the Furies and is known for her fiery temper and ruthless pursuit of justice. Megaera is the chief enforcer of Elysium, pursuing and punishing the worst of the worst both within and without the boundaries of Elysium. She is extremely close to Cerberus.",
  image_url: "/images/characters/megaera.png",
  artist: "bentejam (BENTE)",
  myth_inspiration: "Megaera the leader of the Furies and daughter of Nyx, the goddess of the night. In some art work Nyx was depicted with skin that was dark blue or black (the literal color) so I thought it would be cool to have Megaera have black (as in African American) skin to reflect this. Her clothes are the starry night sky itself.",
  powers: "Shapeshifting, Shadow Manipulation, Familiar Creation, Hellfire, Morpheus Familiar, Microcosm: Nightmare, Fury Fusion",
  home: "Underworld",
  personality: "Aggressive, boistrous, friendly, passionate, extreme love or hate, humorous, eccentric/ insane, sadistic",
  first_appearance: "Bonus Chapters",
  race: "Goddess/ Child of Nyx (Immortal)",
  goal: "To protect her home the Underworld and punish all evildoers who threaten people everywhere."
)
load_character_images(megaera)

# Character 6: Hecate
hecate = Image.create!(
  gallery: underworld_gallery,
  name: "Hecate",
  quote: "You don't have to be crazy to work with me, but it helps.",
  family: "Hades ('brother')",
  biography: "Hades' oldest friend and sworn 'sister' from prehistoric times. When chthonic gods fell out of favor, she, Hades and Thanatos hunted monsters to pay the bills. When Hades founded Elysium she moved there to help out. After Echidna destroyed Elysium and Hecate learned that Zeus had sent her, she swore revenge. She infiltrated Olympus as the Goddess Angelus to investigate and expose Zeus. She still frequently returns to Elysium where she is a beloved celebrity and aunt figure to Hades' children.",
  image_url: "/images/characters/hecate_preview.png",
  artist: "anne.cherry, the.creature.keeper (Patricio Perez)",
  myth_inspiration: "Hecate the goddess of magic and witchcraft.",
  powers: "Chthonic Manipulation, Hellfire, Illusions",
  home: "Elysium",
  personality: "Silly, Cheerful, Mischievous, Eccentric, Clever, Tricky, Manipulative, Vengeful",
  first_appearance: "Act 1",
  race: "Anatolian Chthonic Goddess (Immortal)",
  goal: "To avenge the originally destroyed Elysium and protect the new city from meeting the same fate."
)
load_character_images(hecate)

# Character 6: Echidna
echidna = Image.create!(
  gallery: underworld_gallery,
  name: "Echidna",
  quote: "I kill therefore I am.",
  family: "KAOS (creator), Typhon (lover), Cerberus (daughter), Hydra (son), Kat (daughter), Python (son)",
  biography: "Echidna is a primordial monster with an unstoppable drive to seek and destroy any life she encounters. Her nature compels her to kill anything she encounters and failing that, to mate with whatever she is unable to kill in order to produce stronger monsters that could succeed where she failed. This only happened once when she finally met her match Typhon. While Echidna was away giving birth/ recovering from the ordeal Typhon was defeated and Echidna swore revenge. She sought out Zeus who was known to have defeated Typhon, however he convinced Echidna that Terra was the one she sought since she sealed Typhon away. Just as Zeus hoped, Echidna attacked Terra's new home with Hades in Elysium and destroyed it before being defeated by Terra (taking care of 2 of Zeus' problems at once). The survivors of Elysium's destruction rebuilt the city and imprisoned Echidna in Tartarus Prison.",
  image_url: "/images/characters/echidna_preview.png",
  artist: "versionK, Darianelll (Dari Demchuk), the.creature.keeper (Patricio Perez)",
  myth_inspiration: "Echidna in Greek mythology is the mother of all monsters by her lover Typhon. In regular myth she doesn't do much other than give birth, however in some versions of Greek myth she is created by one of the oldest gods Phanes, who is like Chaos. That made me want to reimagine her as a powerful, primordial monster who is still the mother of monsters, but also a fearsome monster herself on par with her lover Typhon.",
  powers: "Hyper-Evolution and Adaptation, Gains powers/ nature from whatever she eats, Monster Creation, Monster Control, Shape Shifting, Mind Control",
  home: "Tartarus Prison",
  personality: "Sadistic, compulsive, selfish, perverted, cruel, unpredictable",
  first_appearance: "Bonus Chapters",
  race: "Protogenoi Monster (Immortal)",
  goal: "To escape prison so she can kill and eat strong prey to her heart's content."
)
load_character_images(echidna)

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

puts "\n✅ Created Characters gallery with all characters!"
puts "✅ Created Locations gallery (ready for content)"
puts "✅ Created Items gallery (ready for content)"
puts "\n🎉 All character carousel images loaded automatically!"