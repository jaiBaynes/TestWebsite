#!/usr/bin/env rails runner

# Update Kat's image URL
kat = Image.find_by(name: "Kat")
if kat
  kat.update(image_url: "https://drive.google.com/uc?export=view&id=1W5rTjSmYDU60z0dOKkHmuzH0dNxv706_")
  puts "✅ Kat's image updated to: #{kat.image_url}"
else
  puts "❌ Kat not found in database"
end
