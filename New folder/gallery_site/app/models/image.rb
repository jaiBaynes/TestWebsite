class Image < ApplicationRecord
  belongs_to :gallery
  has_one_attached :image_file
  
  validates :name, presence: true
  validates :quote, presence: true
  validates :biography, presence: true
  validates :image_url, presence: true
end
