class AddFamilyToImages < ActiveRecord::Migration[7.1]
  def change
    add_column :images, :family, :text
  end
end
