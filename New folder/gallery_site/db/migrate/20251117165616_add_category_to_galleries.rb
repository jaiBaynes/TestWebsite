class AddCategoryToGalleries < ActiveRecord::Migration[7.1]
  def change
    add_column :galleries, :category, :string, default: 'characters'
    add_index :galleries, :category
  end
end
