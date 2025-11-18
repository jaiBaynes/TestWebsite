class AddBackgroundImageToGalleries < ActiveRecord::Migration[7.1]
  def change
    add_column :galleries, :background_image, :string
  end
end
