class ImagesController < ApplicationController
  before_action :set_gallery
  before_action :set_image, only: [:show, :destroy]

  def show
    @image = Image.find(params[:id])
    @gallery = Gallery.find(params[:gallery_id])
  end

  def destroy
    @image.destroy
    redirect_to @gallery, notice: 'Character was successfully deleted.'
  end

  private

  def set_gallery
    @gallery = Gallery.find(params[:gallery_id])
  end

  def set_image
    @image = Image.find(params[:id])
  end
end
