class CharacterImage < ApplicationRecord
  belongs_to :image
  
  validates :image_path, presence: true
  validates :position, presence: true
  
  default_scope { order(position: :asc) }
end
