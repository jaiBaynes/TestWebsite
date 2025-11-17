class CreateCharacterImages < ActiveRecord::Migration[7.1]
  def change
    create_table :character_images do |t|
      t.integer :image_id, null: false
      t.string :image_path, null: false
      t.integer :position, default: 0

      t.timestamps
    end
    
    add_index :character_images, :image_id
    add_index :character_images, [:image_id, :position]
  end
end
