class UnlocksController < ApplicationController
  def index
    @locked_characters = Image.locked_chars.order(:name)
    @unlocked_characters = Image.unlocked.order(:name)
  end
  
  def unlock_character
    @character = Image.find(params[:id])
    
    if @character.update(locked: false)
      # Store only character ID for modal display to avoid cookie overflow
      session[:newly_unlocked] ||= []
      session[:newly_unlocked] << @character.id
      
      redirect_back(fallback_location: root_path, notice: "#{@character.name} has been unlocked!")
    else
      redirect_back(fallback_location: root_path, alert: "Failed to unlock #{@character.name}.")
    end
  end
  
  def unlock_all
    locked_character_ids = Image.locked_chars.pluck(:id)
    
    # Store only character IDs to avoid cookie overflow
    session[:newly_unlocked] = locked_character_ids
    
    # Unlock all at once
    Image.locked_chars.update_all(locked: false)
    
    redirect_to unlocks_path, notice: "All #{locked_character_ids.count} locked characters have been unlocked!"
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

