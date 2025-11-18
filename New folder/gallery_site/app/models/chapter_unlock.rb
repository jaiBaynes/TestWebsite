class ChapterUnlock < ApplicationRecord
  belongs_to :chapter
  belongs_to :image
  
  validates :chapter_id, uniqueness: { scope: :image_id }
end

