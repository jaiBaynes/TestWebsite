namespace :images do
  desc "Add multiple images to a character"
  task :add_to_character, [:character_name] => :environment do |t, args|
    character_name = args[:character_name]
    
    unless character_name
      puts "Usage: rails images:add_to_character[CharacterName]"
      puts "Example: rails images:add_to_character[Kat]"
      exit
    end
    
    character = Image.find_by(name: character_name)
    
    unless character
      puts "❌ Character '#{character_name}' not found!"
      puts "Available characters: #{Image.pluck(:name).join(', ')}"
      exit
    end
    
    # Look for images in public/images/characters/
    base_name = character_name.downcase
    images_dir = Rails.root.join('public', 'images', 'characters')
    
    # Find all matching image files
    image_files = Dir.glob(images_dir.join("#{base_name}_*.{png,jpg,jpeg,gif,webp}"))
                    .sort
                    .map { |f| File.basename(f) }
    
    if image_files.empty?
      puts "⚠️  No additional images found for #{character_name}"
      puts "Looking for files matching: #{base_name}_1.png, #{base_name}_2.png, etc."
      puts "In directory: #{images_dir}"
      exit
    end
    
    puts "Found #{image_files.length} images for #{character_name}:"
    image_files.each { |f| puts "  - #{f}" }
    puts ""
    
    # Clear existing character images
    character.character_images.destroy_all
    
    # Add new images
    image_files.each_with_index do |filename, index|
      character.character_images.create!(
        image_path: "/images/characters/#{filename}",
        position: index
      )
      puts "✅ Added: #{filename} (position #{index})"
    end
    
    puts ""
    puts "🎉 Successfully added #{image_files.length} images to #{character_name}!"
    puts "Visit: http://localhost:3002/galleries/#{character.gallery_id}/images/#{character.id}"
  end
  
  desc "List all character images"
  task :list => :environment do
    Image.all.each do |character|
      puts "\n#{character.name}:"
      puts "  Main image: #{character.image_url}"
      if character.character_images.any?
        puts "  Additional images (#{character.character_images.count}):"
        character.character_images.each do |img|
          puts "    #{img.position + 1}. #{img.image_path}"
        end
      else
        puts "  No additional images"
      end
    end
    puts ""
  end
  
  desc "Clear all character images"
  task :clear, [:character_name] => :environment do |t, args|
    if args[:character_name]
      character = Image.find_by(name: args[:character_name])
      if character
        count = character.character_images.count
        character.character_images.destroy_all
        puts "✅ Cleared #{count} additional images from #{character.name}"
      else
        puts "❌ Character '#{args[:character_name]}' not found!"
      end
    else
      total = CharacterImage.count
      CharacterImage.destroy_all
      puts "✅ Cleared all #{total} character images"
    end
  end
end

