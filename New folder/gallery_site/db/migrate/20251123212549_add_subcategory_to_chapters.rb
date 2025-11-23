class AddSubcategoryToChapters < ActiveRecord::Migration[7.1]
  def change
    add_column :chapters, :subcategory, :string
  end
end
