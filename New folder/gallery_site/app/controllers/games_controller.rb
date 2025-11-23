class GamesController < ApplicationController
  def index
  end
  
  def random_characters
    # Get 4 random unlocked characters
    unlocked_characters = Image.unlocked.order("RANDOM()").limit(4)
    
    # Build response with preview images
    characters_data = unlocked_characters.map do |character|
      {
        id: character.id,
        name: character.name,
        image: character.thumbnail_url,
        gallery_id: character.gallery_id
      }
    end
    
    render json: { characters: characters_data }
  end
end
