class ImagesController < ApplicationController
  before_action :set_gallery
  before_action :set_image, only: [:show]

  def show
    # Gallery and image already set by before_action
  end

  private

  def set_gallery
    @gallery = Gallery.find(params[:gallery_id])
  end

  def set_image
    @image = Image.find(params[:id])
  end
end
