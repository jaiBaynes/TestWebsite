class GalleriesController < ApplicationController
  before_action :set_gallery, only: [:show]

  def characters
    @category = 'characters'
    @galleries = Gallery.characters
    render :category
  end
  
  def locations
    @category = 'locations'
    @galleries = Gallery.locations
    render :category
  end
  
  def items
    @category = 'items'
    @galleries = Gallery.items
    render :category
  end

  def show
    @images = @gallery.images.unlocked
  end

  private

  def set_gallery
    @gallery = Gallery.find(params[:id])
  end
end
