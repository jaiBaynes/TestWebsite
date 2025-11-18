class AddMusicFileToGalleries < ActiveRecord::Migration[7.1]
  def change
    add_column :galleries, :music_file, :string
  end
end
