class Image < ApplicationRecord
  belongs_to :gallery
  has_one_attached :image_file
  
  validates :caption, presence: true
  validates :image_file, presence: true
end
