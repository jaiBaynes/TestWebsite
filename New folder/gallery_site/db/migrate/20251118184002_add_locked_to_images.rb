class AddLockedToImages < ActiveRecord::Migration[7.1]
  def change
    add_column :images, :locked, :boolean, default: false, null: false
  end
end
