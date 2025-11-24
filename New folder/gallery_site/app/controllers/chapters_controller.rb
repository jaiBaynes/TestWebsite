class ChaptersController < ApplicationController
  # Subcategory descriptions - can be updated as needed
  SUBCATEGORY_INFO = {
    'Other Adventures of Hercules' => 'Hercules\' other adventures before and after the Twelve Labors.',
    'Divine Wrath Saga' => 'Assorted tales of divine wrath of gods on mortals; some who deserve it, some who don\'t.',
    'Mel and Hydra - Attack on Crete' => 'The story of Mel and Hydra\'s attack on Crete to liberate it from the evil Minos brothers and their stronghold the "unconquerable" Palace of Knossos.',
    'Kat in Olympia' => 'The story of the mysterious Kat: a girl who arrived in Olympia to "write a report" but changed the city forever.',
    'Locked Chapters' => 'TODO',
    # Add more subcategories as needed
  }
  
  def index
    # Group published chapters by subcategory for bonus_chapters
    @bonus_chapters = Chapter.published.where(category: 'bonus_chapters').group_by(&:subcategory)
    
    # Get other categories (Act 1, Act 2, etc.) - keep as is for now
    @other_chapters = Chapter.published.where.not(category: 'bonus_chapters').group_by(&:category)
    
    # Make subcategory info available to the view
    @subcategory_info = SUBCATEGORY_INFO
    
    # Make unlocked subcategories available to the view
    @unlocked_subcategories = session[:unlocked_subcategories] || []
  end
  
  def subcategory
    @subcategory = params[:subcategory]
    @chapters = Chapter.published
                      .where(category: 'bonus_chapters', subcategory: @subcategory)
                      .order(Arel.sql('CAST(chapter_number AS DECIMAL)'))
    
    if @chapters.empty?
      redirect_to stories_path, alert: "Subcategory not found."
      return
    end
    
    # Check if this subcategory is locked
    first_chapter = @chapters.first
    if first_chapter.locked? && !subcategory_unlocked?(@subcategory)
      @locked_subcategory = @subcategory
      @subcategory_password = first_chapter.password
      render :locked_subcategory
    end
  end
  
  def unlock_subcategory
    subcategory = params[:subcategory]
    password = params[:password]
    
    # Find a chapter in this subcategory to check the password
    chapter = Chapter.published
                    .where(category: 'bonus_chapters', subcategory: subcategory)
                    .first
    
    if chapter && chapter.password == password
      # Store unlocked subcategory in session
      session[:unlocked_subcategories] ||= []
      session[:unlocked_subcategories] << subcategory unless session[:unlocked_subcategories].include?(subcategory)
      
      respond_to do |format|
        format.json { render json: { success: true } }
      end
    else
      respond_to do |format|
        format.json { render json: { success: false, message: "Incorrect password" }, status: :unauthorized }
      end
    end
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
  
  private
  
  def subcategory_unlocked?(subcategory)
    session[:unlocked_subcategories] ||= []
    session[:unlocked_subcategories].include?(subcategory)
  end
  
  def complete
    @chapter = Chapter.find_by!(slug: params[:id])
    
    # Unlock all characters associated with this chapter
    newly_unlocked_ids = []
    
    @chapter.unlockable_characters.each do |character|
      if character.locked?
        character.update(locked: false)
        newly_unlocked_ids << character.id
      end
    end
    
    # Fetch full character data for the response
    newly_unlocked = Image.where(id: newly_unlocked_ids).map do |character|
      {
        'id' => character.id,
        'name' => character.name,
        'image' => character.thumbnail_url,
        'gallery_id' => character.gallery_id
      }
    end
    
    respond_to do |format|
      format.json { render json: { success: true, unlocked: newly_unlocked } }
    end
  end
end
