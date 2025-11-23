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
  
  # Character name aliases - alternate names that link to character profiles
  CHARACTER_ALIASES = {
    'Mel' => 'Melissa',
    'Hermes' => 'Mercury',
    'Jupiter' => 'Zeus',
    'Poseidon' => 'Neptune',
    'Ares' => 'Mars',
    'Aphrodite' => 'Venus',
    'Erymanthus' => 'Erymanthian Boar',
    'Ceryneia' => 'Ceryneian Hind',
    'Stymphalus' => 'Stymphalian Bird',
    'Tauros' => 'Cretan Bull',
    'Hipponome' => 'Mare of Diomedes',
    # Add more aliases here as needed:
    # 'AliasName' => 'ActualCharacterName'
  }
  
  def link_character_mentions(content)
    # Find all character names in the database
    character_names = Image.pluck(:name)
    
    # Build a list of all names to link (actual names + aliases)
    names_to_link = {}
    
    # Add actual character names
    character_names.each do |name|
      names_to_link[name] = name
    end
    
    # Add aliases
    CHARACTER_ALIASES.each do |alias_name, actual_name|
      names_to_link[alias_name] = actual_name if character_names.include?(actual_name)
    end
    
    # Sort by length (descending) to match longer names first
    sorted_names = names_to_link.keys.sort_by { |name| -name.length }
    
    sorted_names.each do |display_name|
      actual_name = names_to_link[display_name]
      character = Image.find_by(name: actual_name)
      next unless character
      
      # Create a link to the character's profile
      link = link_to(display_name, gallery_image_path(character.gallery, character), 
                     class: 'character-link', 
                     title: "View #{actual_name}'s profile")
      
      # Replace character name with link, but NOT inside:
      # - Image markdown: ![...](...)
      # - Existing HTML tags
      # Use negative lookahead to avoid matching inside image alt text
      content = content.gsub(/\b#{Regexp.escape(display_name)}\b(?![^\[]*\]\([^\)]*\))(?![^<]*>)/, link)
    end
    
    content
  end
  
  def wrap_artwork_with_images(html)
    # First, handle images WITH artwork captions
    # Pattern: <img ...> followed by <p>Artwork: ...</p>
    html = html.gsub(/<img([^>]+)>\s*<p>Artwork:(.*?)<\/p>/mi) do
      img_attrs = $1
      artwork_text = $2.strip
      
      <<-HTML
<div class="chapter-artwork">
  <img#{img_attrs}>
  <p class="artwork-caption">#{artwork_text}</p>
</div>
      HTML
    end
    
    # Then, handle standalone images (that weren't already wrapped)
    # Pattern: <img ...> that is NOT already inside a chapter-artwork div
    html.gsub!(/<img([^>]+)>(?!.*<\/div>)/m) do |match|
      img_attrs = $1
      
      # Extract alt text from the img tag for use as caption
      alt_text = img_attrs.match(/alt="([^"]*)"/)
      caption = alt_text ? alt_text[1] : ''
      
      if caption.present?
        <<-HTML
<div class="chapter-artwork">
  <img#{img_attrs}>
  <p class="artwork-caption">#{caption}</p>
</div>
        HTML
      else
        # If no alt text, just wrap the image without a caption
        <<-HTML
<div class="chapter-artwork">
  <img#{img_attrs}>
</div>
        HTML
      end
    end
    
    html
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
