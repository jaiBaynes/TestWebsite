#!/usr/bin/env rails runner

puts "=" * 60
puts "GALLERY AND CHARACTER DATA"
puts "=" * 60

galleries = Gallery.all
puts "\n📚 Galleries: #{galleries.count}"
galleries.each do |g|
  puts "  - #{g.title}"
  puts "    Description: #{g.description}"
  puts "    Characters: #{g.images.count}"
  g.images.each do |img|
    puts "      * #{img.name}"
    puts "        Quote: #{img.quote}"
    puts "        Image URL: #{img.image_url}"
  end
end

puts "\n" + "=" * 60
