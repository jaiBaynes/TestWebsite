class ImagesController < ApplicationController
  before_action :set_gallery
  before_action :set_image, only: [:destroy]

  def create
    @image = @gallery.images.build(image_params)
    
    if @image.save
      redirect_to @gallery, notice: 'Image was successfully added.'
    else
      redirect_to @gallery, alert: 'Error adding image.'
    end
  end

  def destroy
    @image.destroy
    redirect_to @gallery, notice: 'Image was successfully deleted.'
  end

  private

  def set_gallery
    @gallery = Gallery.find(params[:gallery_id])
  end

  def set_image
    @image = Image.find(params[:id])
  end

  def image_params
    params.require(:image).permit(:caption, :image_file)
  end
end
