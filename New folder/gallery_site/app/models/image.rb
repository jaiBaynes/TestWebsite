class Image < ApplicationRecord
  belongs_to :gallery
  
  validates :name, presence: true
  validates :quote, presence: true
  validates :biography, presence: true
  validates :image_url, presence: true
  
  def display_image_url
    image_url
  end
  
  def has_image?
    image_url.present?
  end
end
