class UnlocksController < ApplicationController
  def index
    @locked_characters = Image.locked_chars.order(:name)
    @unlocked_characters = Image.unlocked.order(:name)
  end
  
  def unlock_character
    @character = Image.find(params[:id])
    
    if @character.update(locked: false)
      # Store newly unlocked character for modal display (use string keys for session)
      session[:newly_unlocked] ||= []
      session[:newly_unlocked] << {
        'id' => @character.id,
        'name' => @character.name,
        'image' => @character.thumbnail_url,
        'gallery_id' => @character.gallery_id
      }
      
      redirect_back(fallback_location: root_path, notice: "#{@character.name} has been unlocked!")
    else
      redirect_back(fallback_location: root_path, alert: "Failed to unlock #{@character.name}.")
    end
  end
  
  def unlock_all
    locked_characters = Image.locked_chars.to_a
    
    # Store all characters being unlocked for modal display
    session[:newly_unlocked] ||= []
    locked_characters.each do |character|
      session[:newly_unlocked] << {
        'id' => character.id,
        'name' => character.name,
        'image' => character.thumbnail_url,
        'gallery_id' => character.gallery_id
      }
    end
    
    # Unlock all at once
    Image.locked_chars.update_all(locked: false)
    
    redirect_to unlocks_path, notice: "All #{locked_characters.count} locked characters have been unlocked!"
  end
  
  def lock_all
    unlocked_count = Image.unlocked.count
    Image.unlocked.update_all(locked: true)
    
    # Clear any unlock notifications
    session[:newly_unlocked] = []
    
    redirect_to unlocks_path, notice: "All #{unlocked_count} unlocked characters have been locked!"
  end
  
  def clear_unlocked_session
    session[:newly_unlocked] = []
    render json: { success: true }
  end
end

