class ChaptersController < ApplicationController
  def index
    @chapters_by_category = Chapter.published.ordered.group_by(&:category)
  end

  def show
    @chapter = Chapter.find_by!(slug: params[:id])
    
    # Find next and previous chapters in the same category
    all_chapters = Chapter.published.where(category: @chapter.category).order(:chapter_number, :created_at)
    current_index = all_chapters.index(@chapter)
    
    if current_index
      @previous_chapter = current_index > 0 ? all_chapters[current_index - 1] : all_chapters.last
      @next_chapter = current_index < all_chapters.length - 1 ? all_chapters[current_index + 1] : all_chapters.first
    end
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
    
    respond_to do |format|
      format.json { render json: { success: true, unlocked: newly_unlocked } }
    end
  end
end
