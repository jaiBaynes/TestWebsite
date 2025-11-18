class CreateChapterUnlocks < ActiveRecord::Migration[7.1]
  def change
    create_table :chapter_unlocks do |t|
      t.references :chapter, null: false, foreign_key: true
      t.references :image, null: false, foreign_key: true

      t.timestamps
    end
    
    add_index :chapter_unlocks, [:chapter_id, :image_id], unique: true
  end
end
