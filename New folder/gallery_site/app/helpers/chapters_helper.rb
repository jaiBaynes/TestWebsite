require 'redcarpet'

module ChaptersHelper
  def parse_chapter_content(content)
    # First, extract and process character mentions (@CharacterName)
    content = link_character_mentions(content)
    
    # Parse markdown to HTML
    markdown = Redcarpet::Markdown.new(
      Redcarpet::Render::HTML.new(
        hard_wrap: true,
        link_attributes: { target: '_blank' }
      ),
      autolink: true,
      space_after_headers: true,
      fenced_code_blocks: true,
      strikethrough: true,
      superscript: true
    )
    
    html_content = markdown.render(content)
    
    # Wrap images with their artwork captions
    html_content = wrap_artwork_with_images(html_content)
    
    html_content.html_safe
  end
  
  def link_character_mentions(content)
    # Find all character names in the database
    character_names = Image.pluck(:name)
    
    # Sort by length (descending) to match longer names first
    character_names.sort_by! { |name| -name.length }
    
    character_names.each do |name|
      character = Image.find_by(name: name)
      next unless character
      
      # Create a link to the character's profile
      link = link_to(name, gallery_image_path(character.gallery, character), 
                     class: 'character-link', 
                     title: "View #{name}'s profile")
      
      # Replace character name with link (but not inside existing HTML tags or links)
      # Use word boundaries to avoid partial matches
      content = content.gsub(/\b#{Regexp.escape(name)}\b(?![^<]*>)/, link)
    end
    
    content
  end
  
  def wrap_artwork_with_images(html)
    # Pattern: <img ...> followed by <p>Artwork: ...</p>
    # Wrap them together in a centered container
    html.gsub(/<img([^>]+)>\s*<p>Artwork:(.*?)<\/p>/mi) do
      img_attrs = $1
      artwork_text = $2.strip
      
      <<-HTML
<div class="chapter-artwork">
  <img#{img_attrs}>
  <p class="artwork-caption">#{artwork_text}</p>
</div>
      HTML
    end
  end
  
  def extract_plain_text_for_tts(content)
    # Remove markdown syntax for TTS
    plain_text = content.dup
    
    # Remove image syntax
    plain_text.gsub!(/!\[.*?\]\(.*?\)/, '')
    
    # Remove links but keep text
    plain_text.gsub!(/\[([^\]]+)\]\([^\)]+\)/, '\1')
    
    # Remove bold/italic markers
    plain_text.gsub!(/[*_]{1,2}([^*_]+)[*_]{1,2}/, '\1')
    
    # Remove headers
    plain_text.gsub!(/^#+\s*/, '')
    
    # Clean up extra whitespace
    plain_text.gsub!(/\n{3,}/, "\n\n")
    plain_text.strip
  end
end
