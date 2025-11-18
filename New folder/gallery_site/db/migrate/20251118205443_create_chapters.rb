class CreateChapters < ActiveRecord::Migration[7.1]
  def change
    create_table :chapters do |t|
      t.string :title
      t.string :slug
      t.string :category
      t.integer :chapter_number
      t.string :file_path
      t.boolean :published, default: true

      t.timestamps
    end
    
    add_index :chapters, :slug, unique: true
    add_index :chapters, :category
  end
end
