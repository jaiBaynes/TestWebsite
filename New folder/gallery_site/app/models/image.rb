class Image < ApplicationRecord
  belongs_to :gallery
  has_many :character_images, dependent: :destroy
  
  validates :name, presence: true
  validates :quote, presence: true
  validates :biography, presence: true
  validates :image_url, presence: true
  
  def display_image_url
    # Priority: 1) Check for _preview image, 2) Use first carousel image, 3) Use main image_url
    if character_images.any?
      preview_image = character_images.find { |ci| ci.image_path.include?('_preview') }
      preview_image ? preview_image.image_path : character_images.first.image_path
    else
      image_url
    end
  end
  
  def thumbnail_url
    # Specifically for gallery card - look for _preview or _thumb image
    preview = character_images.find { |ci| ci.image_path.match?(/_preview|_thumb/) }
    preview ? preview.image_path : display_image_url
  end
  
  def has_image?
    image_url.present? || character_images.any?
  end
  
  def all_image_urls
    if character_images.any?
      # Exclude preview/thumbnail images from carousel
      carousel_images = character_images.reject { |ci| ci.image_path.match?(/_preview|_thumb/) }
                                        .pluck(:image_path)
      # If no carousel images exist (only preview/thumb), fall back to main image_url
      carousel_images.any? ? carousel_images : [image_url]
    else
      [image_url]
    end
  end
end
