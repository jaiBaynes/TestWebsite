class ImagesController < ApplicationController
  before_action :set_gallery
  before_action :set_image, only: [:show]

  def show
    # Find previous and next images in the same gallery
    all_images = @gallery.images.order(:id)
    current_index = all_images.index(@image)
    
    if current_index
      @previous_image = current_index > 0 ? all_images[current_index - 1] : all_images.last
      @next_image = current_index < all_images.length - 1 ? all_images[current_index + 1] : all_images.first
    end
  end

  private

  def set_gallery
    @gallery = Gallery.find(params[:gallery_id])
  end

  def set_image
    @image = Image.find(params[:id])
  end
end
