class AddLockedToChapters < ActiveRecord::Migration[7.1]
  def change
    add_column :chapters, :locked, :boolean, default: false
    add_column :chapters, :password, :string
  end
end
