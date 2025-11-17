class AddDetailsToImages < ActiveRecord::Migration[7.1]
  def change
    add_column :images, :artist, :string
    add_column :images, :myth_inspiration, :text
    add_column :images, :powers, :text
    add_column :images, :home, :string
  end
end
