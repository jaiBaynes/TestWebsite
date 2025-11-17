class Image < ApplicationRecord
  belongs_to :gallery
  has_many :character_images, dependent: :destroy
  
  validates :name, presence: true
  validates :quote, presence: true
  validates :biography, presence: true
  validates :image_url, presence: true
  
  def display_image_url
    image_url
  end
  
  def has_image?
    image_url.present? || character_images.any?
  end
  
  def all_image_urls
    if character_images.any?
      character_images.pluck(:image_path)
    else
      [image_url]
    end
  end
end
