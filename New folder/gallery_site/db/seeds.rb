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
olympia_gallery = Gallery.create!(
  title: "Olympia",
  description: "Meet the many residents of the mortal city of Olympia and the divine city of Olympus that floats above it. Click on each character to learn more about them.",
  category: "characters",
  background_image: "/images/characters/zeus_4.png",
  music_file: "/music/Solo Menu - Kid Icarus_ Uprising (OST).mp3"
)

# Olympia Characters

# Character: Zeus
zeus = Image.create!(
  gallery: olympia_gallery,
  name: "Zeus",
  quote: "I am Zeus Almighty, my will be done.",
  family: "Hercules (son), Metis (wife), Hebe (daughter), Apollo (son), Jupiter (self?), Mercury (brother), Venus (sister), Terra (sister), Mars (brother), Neptune (brother), Uranus (sister)",
  biography: "TODO",
  image_url: "/images/characters/zeus_preview.png",
  artist: "filipe_sca (Luis Filipe)",
  myth_inspiration: "Zeus the king of the gods in greek mythology.",
  powers: "electricity manipulation, teleportation, shape shifting, weather control, Illusions, Microcosm",
  home: "Olympus",
  personality: "TODO",
  first_appearance: "Act 1",
  race: "Solaris",
  goal: "To rule the world and ensure Fate is followed."
)
load_character_images(zeus)

# Character: Hercules
hercules = Image.create!(
  gallery: olympia_gallery,
  name: "Hercules",
  quote: "I am Hercules, the son of Zeus and the greatest hero of all time!",
  family: "Zeus (father), Alcmene (mother), Amphitryon (adoptive father), Hebe (half-sister), Apollo (half-brother), Megara (wife), Deianira (wife), Iole (wife)",
  biography: "TODO",
  image_url: "/images/characters/hercules.png",
  artist: "bentejam (BENTE)",
  myth_inspiration: "Heracles the son of Zeus and Alcmene in Greek mythology.",
  powers: "Super strength, shape-shifting ring, supercharge by Zeus, deus ex machina (off the cuff power creation), lightning manipulation",
  home: "Thebes",
  personality: "TODO",
  first_appearance: "Act 1",
  race: "Theban Demi-god (mortal)",
  goal: "To prove himself to his father Zeus and to become the greatest hero of all time."
)
load_character_images(hercules)

# Character: Hebe
hebe = Image.create!(
  gallery: olympia_gallery,
  name: "Hebe",
  quote: "Anyone who harms children is my enemy; I don't care what power or authority they claim to do it under.",
  family: "Zeus (father), Metis (mother), Hercules (half-brother), Apollo (half-brother)",
  biography: "TODO",
  image_url: "/images/characters/hebe.png",
  artist: "bentejam (BENTE)",
  myth_inspiration: "Hebe the daughter of Zeus and Hera, the goddess of youth in greek mythology.",
  powers: "Lightning manipulation, Teleportation, Shape shifting, Illusions, Ambrosia manipulation",
  home: "Olympus",
  personality: "TODO",
  first_appearance: "Act 1",
  race: "Goddess (Immortal)",
  goal: "To be free... and for her father to love her."
)
load_character_images(hebe)

# Character: Neptune
neptune = Image.create!(
  gallery: olympia_gallery,
  name: "Neptune",
  quote: "I go with the flow... and wash away anything that gets in my way.",
  family: "Zeus (brother), Mercury (brother), Venus (sister), Terra (sister), Uranus (sister)",
  biography: "TODO",
  image_url: "/images/characters/neptune_preview.png",
  artist: "bentejam (BENTE), tsuki.chiin (*pochll*)",
  myth_inspiration: "Poseidon the god of the sea in greek mythology.",
  powers: "Fault line, storm manipulation, shape shifting, Illusions, Monster creation and control, Microcosm",
  home: "Olympus",
  personality: "TODO",
  first_appearance: "Act 1",
  race: "Solaris",
  goal: "To protect himself and those he cares about."
)
load_character_images(neptune)

# Character: Metis
metis = Image.create!(
  gallery: olympia_gallery,
  name: "Metis",
  quote: "Mind over muscle.",
  family: "Zeus (husband), Hebe (daughter)",
  biography: "TODO",
  image_url: "/images/characters/metis.png",
  artist: "anne.cherry",
  myth_inspiration: "Metis the Titaness of wisdom, wife of Zeus and mother of Athena.",
  powers: "Mind control, Illusions",
  home: "Olympus",
  personality: "TODO",
  first_appearance: "Bonus Chapters",
  race: "Goddess (Immortal)",
  goal: "To rule as queen of the gods with a less embarassing husband.",
  locked: true
)
load_character_images(metis)

# Character: Mercury
mercury = Image.create!(
  gallery: olympia_gallery,
  name: "Mercury",
  quote: "We're in the money!",
  family: "Venus (sister), Terra (sister), Mars (brother), Jupiter (brother), Neptune (brother), Uranus (sister)",
  biography: "TODO",
  image_url: "/images/characters/mercury.png",
  artist: "tsuki.chiin (*pochll*)",
  myth_inspiration: "Hermes the messenger of the gods in greek mythology.",
  powers: "Super speed, Relativity, Shape shifting, Illusions, Teleportation, Microcosm",
  home: "Olympus",
  personality: "TODO",
  first_appearance: "Act 1",
  race: "Solaris",
  goal: "To amuse himself; currently his amusement takes the form of amassing wealth."
)
load_character_images(mercury)

# Character: Apollo
apollo = Image.create!(
  gallery: olympia_gallery,
  name: "Apollo",
  quote: "In Delphi there is but one son of Zeus, and it is me.",
  family: "Zeus (father), Artemis (twin sister), Leto (mother), Hercules (half-brother), Hebe (half-sister)",
  biography: "TODO",
  image_url: "/images/characters/apollo.png",
  artist: "bentejam (BENTE)",
  myth_inspiration: "Apollo the god of the sun and music in greek mythology.",
  powers: "Solar power, Disease manipulation, Healing,Shape shifting, Illusions, Microcosm",
  home: "Olympus",
  personality: "TODO",
  first_appearance: "Act 2",
  race: "half-Lycian God (Immortal)",
  goal: "To regain his status as Zeus' number one son.",
  locked: true
)
load_character_images(apollo)

# Character: Venus
venus = Image.create!(
  gallery: olympia_gallery,
  name: "Venus",
  quote: "Beauties and graces, both are mine.",
  family: "Hephaestus (husband), Mercury (brother), Mars (brother), Terra (sister), Jupiter (brother), Neptune (brother), Uranus (sister)",
  biography: "TODO",
  image_url: "/images/characters/venus.png",
  artist: "dilan_grizart (Dilan)",
  myth_inspiration: "Aphrodite, Greek Goddess of Love, Beauty and Desire",
  powers: "Illusions, Perception Manipulation, Mind Control, Beautification (matter/ appearance manipulation)",
  home: "Olympus",
  personality: "Flirty, nosy, energetic, attention-seeking, petty, eccentric",
  first_appearance: "Act 2",
  race: "Solaris",
  goal: "To forever enjoy the beauty of the world.",
  locked: true
)
load_character_images(venus)

# Character: Megara
megara = Image.create!(
  gallery: olympia_gallery,
  name: "Megara",
  quote: "I am the faithful servant of my Lord-Husband, Hercules.",
  family: "Hercules (husband)",
  biography: "TODO",
  image_url: "/images/characters/megara.png",
  artist: "bentejam (BENTE)",
  myth_inspiration: "Megaera, the leader of the Furies in greek mythology.",
  powers: "None",
  home: "Thebes",
  personality: "TODO",
  first_appearance: "Act 1",
  race: "Theban (mortal)",
  goal: "To be the best wife to Hercules that she can be. ...and nothing else."
)
load_character_images(megara)

# Sinisters Gallery
sinisters_gallery = Gallery.create!(
  title: "Sinisters",
  description: "Meet the many people outside Olympia or Elysium who have banded together under the banner of the Sinisters. Click on each character to learn more about them.",
  category: "characters",
  background_image: "/images/characters/Sinisters Symbol.png",
  music_file: "/music/Code Geass Lelouch of the Rebellion OST 2 - 05. Feel Ambivalents.mp3"
)

# Sinisters Characters

# Character: Hydra
hydra = Image.create!(
  gallery: sinisters_gallery,
  name: "Hydra",
  quote: "I have returned from the Gates of Tartarus in tact, and sent that bastard Pelops to fill my spot among the dead!",
  family: "Typhon (biological father), Echidna (biological mother), Melissa (wife), Draco (son), Neptune (adoptive father)",
  biography: "TODO",
  image_url: "/images/characters/hydra.png",
  artist: "Me (Placeholder), LDAWB, meikkochi_ (Meiko), the.creature.keeper (Patricio Perez)",
  myth_inspiration: "Hydra the many-headed serpent in greek mythology.",
  powers: "Shape shifting, Illusions, clones, Monster creation and control, Teleportation, Microcosm",
  home: "Crete",
  personality: "TODO",
  first_appearance: "Act 1",
  race: "demi-human monster (Immortal)",
  goal: "To liberate the peoples of the world from the tyranny of Olympus.",
  locked: true
)
load_character_images(hydra)

# Character: Draco
draco = Image.create!(
  gallery: sinisters_gallery,
  name: "Draco",
  quote: "I'm a celebrity, princess. I have a sense for when people are ogling me. My eyes are up here.",
  family: "Hydra (father), Melissa (mother)",
  biography: "TODO",
  image_url: "/images/characters/draco.png",
  artist: "tsuki.chiin (*pochll*)",
  myth_inspiration: "The Immortal head of Hydra that Hercules cut off and buried rather than actually killing it despite popular belief).",
  powers: "Shape shifting, Illusions, clones, Monster creation and control, Teleportation, Microcosm",
  home: "Crete",
  personality: "TODO",
  first_appearance: "Act 1",
  race: "half-Cretan half-demi-human monster (Immortal)",
  goal: "To liberate the peoples of the world from the tyranny of Olympus."
)
load_character_images(draco)

# Character: Melissa
melissa = Image.create!(
  gallery: sinisters_gallery,
  name: "Melissa",
  quote: "Zeus shall reap what he has sown; Olympus shall be smashed to pebbles!",
  family: "Melisseus (father), Hydra (husband), Draco (son)",
  biography: "TODO",
  image_url: "/images/characters/melissa_preview.png",
  artist: "LDAWB, Me (Placeholder)",
  myth_inspiration: "Melissa, the proposed Cretan bee goddes/ matriarchy of 20th century archeologiests. Also the nymphs named Melissa in Greek mythology.",
  powers: "Super strength, lightning manipulation, Monster creation and control, Microcosm",
  home: "Crete",
  personality: "TODO",
  first_appearance: "Bonus Chapters",
  race: "half-Cretan, half-African Nymph (Immortal)",
  goal: "To liberate the peoples of the world from the tyranny of Olympus.",
  locked: true
)
load_character_images(melissa)

# Character: Scythia
scythia = Image.create!(
  gallery: sinisters_gallery,
  name: "Scythia",
  quote: "Don't mess with me.",
  family: "Kolaxias (father), Hora (mother), Agathyrsos (brother), Gelonos (brother)",
  biography: "TODO",
  image_url: "/images/characters/scythia.png",
  artist: "Kat_Kay_tee (Kaytee)",
  myth_inspiration: "Scythes aka Targitavah the ancestor of the Scythians in Scythian mythology. Also a son of Heracles and Echidna according to some rare versions of greek mythology.",
  powers: "Super Strength, Divine Possession",
  home: "Scythia",
  personality: "TODO",
  first_appearance: "Act 1",
  race: "Scythian (mortal)",
  goal: "To liberate the peoples of the world from the tyranny of Olympus."
)
load_character_images(scythia)

# Underworld Gallery
underworld_gallery = Gallery.create!(
  title: "Underworld",
  description: "Meet the many residents of the 'Underworld'. You might be surprised to find that they are different from what Zeus' myths would have you believe. Click on each character to learn more about them.",
  category: "characters",
  background_image: "/images/characters/hades_2.png",
  music_file: "/music/Keves Colony (Day) Xenoblade Chronicles 3 Original Soundtrack OST.mp3"
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
  myth_inspiration: "In Mythology, Hades is the god of the underworld and the king of the dead. He is the son of Cronus and Rhea and the brother of Zeus and Poseidon. He is married to Persephone. A thing that interested me was the fact that according to some versions of myth, Hades was sterile and had no children. So I thought it would be cool to have Hades adopt lots of children and love them all despite no blood connection as a contrast to Zeus who has many biological children but is a complete asshole to most of them. Hades' character being focused on fatherhood is one of the many inspirtions I took from Odin, the Norse 'Allfather' as a fellow death god who I mixed with Hades. Third major inspiration from myth is the clever Greek hero Odysseus as a more positive reflection of the idea that the devil is an unreliable trickster(Zeus = Agamemnon, Poseidon = Diomedes and Hades = Odysseus).",
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
  goal: "For the world to be a just and peaceful place... and for people to believe her husband when he says the same.",
  locked: true
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
  goal: "To protect her home the Underworld and punish all evildoers who threaten people everywhere.",
  locked: true
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
  goal: "To avenge the originally destroyed Elysium and protect the new city from meeting the same fate.",
  locked: true
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
  goal: "To escape prison so she can kill and eat strong prey to her heart's content.",
  locked: true
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