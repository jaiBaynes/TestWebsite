#!/usr/bin/env rails runner

puts "\n" + "=" * 60
puts "CHECKING DATABASE"
puts "=" * 60

puts "\n📚 All Galleries:"
Gallery.all.each_with_index do |g, i|
  puts "  #{i+1}. ID=#{g.id}, Title='#{g.title}'"
end

puts "\n📸 All Images:"
Image.all.each_with_index do |img, i|
  puts "  #{i+1}. ID=#{img.id}, Name='#{img.name}', Gallery ID=#{img.gallery_id}"
end

puts "\n" + "=" * 60
