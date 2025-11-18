class ChaptersController < ApplicationController
  def index
    @chapters_by_category = Chapter.published.ordered.group_by(&:category)
  end

  def show
    @chapter = Chapter.find_by!(slug: params[:id])
  end
  
  def complete
    @chapter = Chapter.find_by!(slug: params[:id])
    
    # Unlock all characters associated with this chapter
    newly_unlocked = []
    
    @chapter.unlockable_characters.each do |character|
      if character.locked?
        character.update(locked: false)
        newly_unlocked << {
          'id' => character.id,
          'name' => character.name,
          'image' => character.thumbnail_url,
          'gallery_id' => character.gallery_id
        }
      end
    end
    
    # Add to session for unlock modal
    if newly_unlocked.any?
      session[:newly_unlocked] ||= []
      session[:newly_unlocked].concat(newly_unlocked)
    end
    
    redirect_to stories_path, notice: "Chapter completed! #{newly_unlocked.count} character(s) unlocked!"
  end
end
